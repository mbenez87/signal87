import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    console.log('=== Document Intelligence Agent Called ===');

    const base44 = createClientFromRequest(req);

    // Authenticate user
    let user;
    try {
      user = await base44.auth.me();
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return Response.json({
        error: 'Authentication required',
        details: 'Please log in to use ARIA'
      }, { status: 401 });
    }

    if (!user || !user.email) {
      return Response.json({
        error: 'Invalid user session'
      }, { status: 401 });
    }

    console.log(`User authenticated: ${user.email}`);

    // Parse request
    const body = await req.json();
    const {
      query,
      selectedDocuments = [],
      conversationHistory = [],
      workspaceId = null,
      preferredModel = 'claude-3-5-sonnet-20241022'
    } = body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return Response.json({
        error: 'Query is required'
      }, { status: 400 });
    }

    console.log(`Query: "${query}"`);
    console.log(`Selected documents: ${selectedDocuments.length}`);
    console.log(`Preferred model: ${preferredModel}`);

    // === STEP 1: BUILD COMPREHENSIVE DOCUMENT CONTEXT ===
    let documentContext = '';
    const citedDocs = new Map();
    let totalCharsProcessed = 0;
    const maxContextChars = 80000; // Increased limit

    console.log('--- Building Document Context ---');

    // Load full content from selected documents
    if (selectedDocuments && selectedDocuments.length > 0) {
      console.log(`Loading ${selectedDocuments.length} selected documents...`);

      for (const docRef of selectedDocuments) {
        if (totalCharsProcessed >= maxContextChars) break;

        try {
          const docId = docRef.id || docRef;
          const docs = await base44.entities.Document.filter({ id: docId });

          if (docs && docs.length > 0) {
            const doc = docs[0];

            citedDocs.set(doc.id, {
              id: doc.id,
              title: doc.title,
              category: doc.category || 'Uncategorized',
              file_type: doc.file_type
            });

            if (doc.extracted_content && doc.extracted_content.length > 100) {
              const contentToAdd = doc.extracted_content.substring(0, 30000);
              documentContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
              documentContext += `📄 DOCUMENT: ${doc.title}\n`;
              documentContext += `Category: ${doc.category || 'Uncategorized'}\n`;
              documentContext += `Type: ${doc.file_type || 'Unknown'}\n`;
              documentContext += `Document ID for citation: ${doc.id}\n`;
              documentContext += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
              documentContext += `FULL CONTENT:\n${contentToAdd}\n\n`;

              totalCharsProcessed += contentToAdd.length;
              console.log(`✓ Added full content: ${doc.title} (${contentToAdd.length} chars)`);
            } else if (doc.ai_summary && doc.ai_summary.length > 50) {
              documentContext += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
              documentContext += `📄 DOCUMENT: ${doc.title}\n`;
              documentContext += `Document ID for citation: ${doc.id}\n`;
              documentContext += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
              documentContext += `SUMMARY:\n${doc.ai_summary}\n\n`;
              documentContext += `⚠️ Note: Full content extraction pending.\n`;

              totalCharsProcessed += doc.ai_summary.length;
              console.log(`⚠ Added summary: ${doc.title}`);
            } else {
              console.warn(`✗ Document "${doc.title}" has no content - needs processing`);
              documentContext += `\n\n📄 Document "${doc.title}" is in the system but needs to be processed first.\n`;
            }
          }
        } catch (docError) {
          console.error(`Failed to load document:`, docError);
        }
      }
    }

    // If no selected documents or not enough context, try semantic search
    if (documentContext.length < 500) {
      console.log('Attempting semantic search for additional context...');

      try {
        const searchFilter = { created_by: user.email };

        if (workspaceId && workspaceId !== 'personal') {
          searchFilter.workspace_id = workspaceId;
        } else {
          searchFilter.workspace_id = { '$in': [null, 'personal'] };
        }

        const searchResponse = await base44.functions.invoke('semanticSearch', {
          query: query,
          filter: searchFilter,
          limit: 8
        });

        if (searchResponse?.data?.results && searchResponse.data.results.length > 0) {
          console.log(`✓ Found ${searchResponse.data.results.length} semantic search results`);

          for (const result of searchResponse.data.results) {
            if (totalCharsProcessed >= maxContextChars) break;

            if (!citedDocs.has(result.document_id)) {
              citedDocs.set(result.document_id, {
                id: result.document_id,
                title: result.document_title,
                category: result.document_category
              });
            }

            documentContext += `\n\n[Relevant Excerpt from "${result.document_title}"]\n`;
            documentContext += `${result.chunk_text}\n`;
            documentContext += `[Source: doc://${result.document_id}]\n`;

            totalCharsProcessed += result.chunk_text.length;
          }
        }
      } catch (searchError) {
        console.error('Semantic search failed:', searchError);
      }
    }

    console.log(`Total context built: ${documentContext.length} chars from ${citedDocs.size} documents`);

    // === STEP 2: CALL LLM WITH CONTEXT ===

    // Build conversation history for Claude format
    const claudeMessages = [];
    for (const histMsg of conversationHistory) {
      claudeMessages.push({
        role: histMsg.role === 'assistant' ? 'assistant' : 'user',
        content: histMsg.content
      });
    }

    // Add current query with document context
    const userPrompt = documentContext.length > 0
      ? `${documentContext}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUser Question: ${query}`
      : `User Question: ${query}`;

    claudeMessages.push({
      role: 'user',
      content: userPrompt
    });

    const systemPrompt = `You are ARIA, an advanced document intelligence assistant for Signal87 AI.

**YOUR CAPABILITIES:**
- Deep document analysis and comprehension
- Multi-document synthesis and comparison
- Precise information extraction and citation
- Contextual question answering

**CRITICAL INSTRUCTIONS:**
1. **ALWAYS cite your sources** using this EXACT format: [Source: Document Title](doc://document_id)
2. **Be specific and detailed** - reference actual content, quotes, and data points from the documents
3. **If you find relevant information**, explain it clearly and provide context
4. **If information is missing**, clearly state what's needed
5. **Be conversational** but professional
6. **Provide actionable insights** when appropriate

**CITATION FORMAT:**
When referencing ANY information from a document, you MUST cite it like this:
"According to the [Source: Contract Agreement](doc://abc123), the payment terms are Net 30."

Current user: ${user.full_name || user.email}
Documents available: ${citedDocs.size}

Remember: Your value comes from providing detailed, well-cited, actionable responses based on the actual document content provided to you.`;

    console.log('--- Calling LLM ---');
    console.log(`System prompt length: ${systemPrompt.length}`);
    console.log(`User prompt length: ${userPrompt.length}`);

    let answer = '';
    let modelUsed = 'Claude Sonnet 4.5';

    try {
      // Use base44 InvokeLLM integration
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: JSON.stringify({
          system: systemPrompt,
          messages: claudeMessages
        }),
        add_context_from_internet: false
      });

      console.log('LLM Response received:', typeof llmResponse);

      if (typeof llmResponse === 'string') {
        answer = llmResponse;
      } else if (llmResponse?.response) {
        answer = llmResponse.response;
      } else if (llmResponse?.content) {
        answer = llmResponse.content;
      } else {
        answer = JSON.stringify(llmResponse);
      }

      console.log(`✓ Answer generated (${answer.length} chars)`);

    } catch (llmError) {
      console.error('LLM call failed:', llmError);
      throw new Error(`Failed to generate response: ${llmError.message}`);
    }

    // === STEP 3: GENERATE FOLLOW-UP QUESTION ===
    let followUpQuestion = null;

    try {
      const followUpPrompt = `Based on this conversation:
User asked: "${query}"
Assistant answered: "${answer.substring(0, 500)}..."

Generate ONE intelligent follow-up question the user might want to ask next. Be specific and relevant to the documents discussed. Return ONLY the question, no explanation.`;

      const followUpResponse = await base44.integrations.Core.InvokeLLM({
        prompt: followUpPrompt,
        add_context_from_internet: false
      });

      if (typeof followUpResponse === 'string') {
        followUpQuestion = followUpResponse.trim();
      } else if (followUpResponse?.response) {
        followUpQuestion = followUpResponse.response.trim();
      }

      console.log(`✓ Follow-up generated: ${followUpQuestion}`);

    } catch (followUpError) {
      console.error('Follow-up generation failed:', followUpError);
      // Non-critical error, continue without follow-up
    }

    // === STEP 4: RETURN RESPONSE ===
    const responseData = {
      answer: answer,
      followUpQuestion: followUpQuestion,
      citedDocuments: Array.from(citedDocs.values()),
      contextStats: {
        modelUsed: modelUsed,
        documentsReferenced: citedDocs.size,
        totalContextChars: documentContext.length
      }
    };

    console.log('=== Agent Response Complete ===');
    console.log(`Answer length: ${answer.length}`);
    console.log(`Cited documents: ${citedDocs.size}`);

    return Response.json(responseData);

  } catch (error) {
    console.error('=== Agent Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return Response.json({
      error: 'Agent processing failed',
      details: error.message,
      answer: `I encountered an error while processing your request: ${error.message}\n\nPlease try:\n1. Selecting specific documents\n2. Ensuring documents are processed\n3. Simplifying your question`,
      citedDocuments: [],
      contextStats: { modelUsed: 'Error', documentsReferenced: 0, totalContextChars: 0 }
    }, { status: 200 }); // Return 200 with error message so frontend can display it
  }
});
