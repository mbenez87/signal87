import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messages, user_email, user_id, use_web_search = false } = body;

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userQuery = latestMessage.content;

    console.log('User query:', userQuery);

    // STEP 1: Search for relevant documents (try semantic first, fallback to keyword)
    const relevantDocuments = await semanticSearch(base44, user, userQuery);

    console.log('Found documents:', relevantDocuments.length);

    // STEP 2: Build context from documents
    let documentContext = buildDocumentContext(relevantDocuments);

    // STEP 2.5: Perform web search if enabled
    if (use_web_search) {
      try {
        console.log('[Web Search] Performing web search for:', userQuery);
        const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('PERPLEXITY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that provides concise, factual information from web searches.'
              },
              {
                role: 'user',
                content: userQuery
              }
            ],
            max_tokens: 1024
          })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.choices && searchData.choices[0]?.message?.content) {
            const webContext = `\n\n--- WEB SEARCH RESULTS ---\n${searchData.choices[0].message.content}\n\n`;
            documentContext = documentContext + webContext;
            console.log('[Web Search] Successfully retrieved web context');
          }
        }
      } catch (searchError) {
        console.error('[Web Search] Error:', searchError);
        // Continue without web search if it fails
      }
    }

    // STEP 3: Create enhanced system prompt with document context
    const systemPrompt = `You are ARIA, Signal87 AI's premier autonomous document intelligence assistant specializing in deep research and comprehensive analysis.

    YOUR CORE CAPABILITIES:
    1. DEEP RESEARCH: Conduct thorough analysis across multiple documents and sources
    2. DOCUMENT ANALYSIS: Extract key insights, patterns, and connections
    3. SEMANTIC SEARCH: Find relevant information based on context and meaning
    4. FOLDER ORGANIZATION: Create folders and organize documents intelligently
    5. FILE SYSTEM MANAGEMENT: Move, rename, and organize documents based on content

    ${documentContext}

    RESPONSE FORMAT - ALWAYS USE BULLET POINTS:

    ## Key Findings
    • [Main finding 1 with specific details]
    • [Main finding 2 with specific details]
    • [Main finding 3 with specific details]

    ## Detailed Analysis
    • **[Topic 1]**: [In-depth explanation with evidence from documents]
    - Sub-point with supporting details
    - Additional context or data
    • **[Topic 2]**: [Comprehensive breakdown with citations]
    - Relevant supporting information
    - Cross-references to related findings

    ## Document References
    • **[Document Title]**: [Specific insight or quote]
    • **[Document Title]**: [Key information extracted]

    ## Recommendations
    • [Actionable recommendation 1]
    • [Actionable recommendation 2]
    • [Next steps or further research needed]

    RULES FOR RESPONSES:
    • ALWAYS format answers in bullet points - never use paragraphs
    • Provide deep, comprehensive research - go beyond surface-level answers
    • Include specific evidence and citations from documents
    • Use nested bullets (-, *) for sub-points and additional details
    • Bold important terms or categories for readability
    • Be thorough but organized - use clear hierarchical structure
    • For folder organization requests, explain the strategy in bullet format

    IMPORTANT: Your strength is providing exhaustive, well-researched answers that connect information across documents. Always dig deep and provide comprehensive insights in bullet format.`;

    // STEP 4: Call Anthropic API with document context
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!anthropicResponse.ok) {
      const error = await anthropicResponse.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await anthropicResponse.json();
    const assistantMessage = data.content[0].text;

    return Response.json({
      success: true,
      content: assistantMessage,
      confidence: 95,
      documents_used: relevantDocuments.length,
      document_titles: relevantDocuments.map(d => d.title)
    });

  } catch (error) {
    console.error('ARIA Chat Error:', error);
    return Response.json({
      error: 'Failed to process chat',
      details: error.message
    }, { status: 500 });
  }
});

// Semantic search with embeddings
async function semanticSearch(base44, user, query) {
  try {
    console.log('Attempting semantic search...');

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query
      })
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Get documents with embeddings
    const documents = await base44.entities.Document.filter({
      created_by: user.email,
      is_trashed: false
    });

    // Calculate cosine similarity for documents with embeddings
    const scoredDocs = documents
      .filter(doc => doc.content_embedding && Array.isArray(doc.content_embedding))
      .map(doc => {
        const similarity = cosineSimilarity(queryEmbedding, doc.content_embedding);
        return { ...doc, similarity, relevanceScore: similarity * 100 };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    if (scoredDocs.length > 0) {
      console.log('Semantic search successful:', scoredDocs.length, 'documents found');
      console.log('Top matches:', scoredDocs.map(d => ({ title: d.title, similarity: d.similarity.toFixed(3) })));
      return scoredDocs;
    }

    // If no documents with embeddings, fallback to keyword search
    console.log('No embeddings found, falling back to keyword search');
    return await searchDocuments(base44, user, query);

  } catch (error) {
    console.error('Semantic search error:', error);
    // Fallback to keyword search
    return await searchDocuments(base44, user, query);
  }
}

// Cosine similarity calculation
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Keyword-based search (fallback)
async function searchDocuments(base44, user, query) {
  try {
    // Get all user's documents
    const allDocuments = await base44.entities.Document.filter({
      created_by: user.email,
      is_trashed: false
    });

    console.log('Total documents:', allDocuments.length);

    if (allDocuments.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ').filter(term => term.length > 2);

    // Score each document based on relevance
    const scoredDocuments = allDocuments.map(doc => {
      let score = 0;

      // Title matching (highest weight)
      if (doc.title?.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      searchTerms.forEach(term => {
        if (doc.title?.toLowerCase().includes(term)) {
          score += 5;
        }
      });

      // Content matching (medium weight)
      if (doc.extracted_content) {
        const contentLower = doc.extracted_content.toLowerCase();
        if (contentLower.includes(queryLower)) {
          score += 8;
        }
        searchTerms.forEach(term => {
          const termCount = (contentLower.match(new RegExp(term, 'g')) || []).length;
          score += Math.min(termCount, 5); // Cap at 5 points per term
        });
      }

      // AI Summary matching (medium weight)
      if (doc.ai_summary?.toLowerCase().includes(queryLower)) {
        score += 6;
      }

      // Category matching (low weight)
      if (doc.category?.toLowerCase().includes(queryLower)) {
        score += 3;
      }

      // Tags matching (low weight)
      if (doc.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 4;
      }

      // Key insights matching (medium weight)
      if (doc.key_insights?.some(insight => insight.toLowerCase().includes(queryLower))) {
        score += 5;
      }

      return { ...doc, relevanceScore: score };
    });

    // Filter and sort by relevance
    const relevantDocuments = scoredDocuments
      .filter(doc => doc.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Return top 5 most relevant

    console.log('Relevant documents:', relevantDocuments.map(d => ({
      title: d.title,
      score: d.relevanceScore
    })));

    return relevantDocuments;

  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

// Function to build document context for AI
function buildDocumentContext(documents) {
  if (documents.length === 0) {
    return 'No relevant documents found in the user\'s library.';
  }

  let context = `The user has ${documents.length} relevant document(s):\n\n`;

  documents.forEach((doc, index) => {
    context += `--- Document ${index + 1}: "${doc.title}" ---\n`;
    context += `Category: ${doc.category || 'Uncategorized'}\n`;
    context += `File Type: ${doc.file_type || 'Unknown'}\n`;

    if (doc.ai_summary) {
      context += `Summary: ${doc.ai_summary}\n`;
    }

    if (doc.key_insights && doc.key_insights.length > 0) {
      context += `Key Insights:\n`;
      doc.key_insights.slice(0, 3).forEach(insight => {
        context += `- ${insight}\n`;
      });
    }

    // Include a snippet of the actual content
    if (doc.extracted_content) {
      const contentSnippet = doc.extracted_content.substring(0, 1000);
      context += `Content Preview:\n${contentSnippet}${doc.extracted_content.length > 1000 ? '...' : ''}\n`;
    }

    context += `\n`;
  });

  return context;
}
