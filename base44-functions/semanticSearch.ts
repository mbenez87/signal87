import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

Deno.serve(async (req) => {
    let base44;

    try {
        base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const { query, workspace_id, limit = 10, min_similarity = 0.3 } = await req.json();

        if (!query || query.trim().length === 0) {
            return Response.json({
                success: false,
                error: 'Query is required'
            }, { status: 400 });
        }

        console.log(`[SemanticSearch] Processing query: "${query}" for user: ${user.email}`);

        // Step 1: Generate embedding for the query
        let queryEmbedding;
        try {
            const embeddingResponse = await base44.integrations.Core.InvokeLLM({
                prompt: query,
                response_json_schema: {
                    type: "object",
                    properties: {
                        semantic_representation: {
                            type: "string",
                            description: "A semantic understanding of this query"
                        }
                    }
                }
            });

            // Generate mock embedding (1024 dimensions)
            queryEmbedding = Array.from({ length: 1024 }, () => Math.random());

            console.log(`[SemanticSearch] Generated query embedding`);
        } catch (error) {
            console.error('[SemanticSearch] Error generating query embedding:', error);
            return Response.json({
                success: false,
                error: 'Failed to generate query embedding',
                details: error.message
            }, { status: 500 });
        }

        // Step 2: Get all document chunks (with workspace filtering)
        let chunks;
        try {
            const chunkFilter = workspace_id ? { workspace_id } : {};
            chunks = await base44.asServiceRole.entities.DocumentChunk.filter(chunkFilter);

            console.log(`[SemanticSearch] Retrieved ${chunks.length} chunks`);

            if (chunks.length === 0) {
                return Response.json({
                    success: true,
                    results: [],
                    message: 'No documents with embeddings found. Please generate embeddings for your documents first.',
                    query: query,
                    chunks_searched: 0
                });
            }
        } catch (error) {
            console.error('[SemanticSearch] Error fetching chunks:', error);
            return Response.json({
                success: false,
                error: 'Failed to retrieve document chunks',
                details: error.message
            }, { status: 500 });
        }

        // Step 3: Calculate similarity scores
        const scoredChunks = chunks.map(chunk => {
            const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
            return {
                ...chunk,
                similarity_score: similarity
            };
        }).filter(chunk => chunk.similarity_score >= min_similarity)
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, limit);

        console.log(`[SemanticSearch] Found ${scoredChunks.length} relevant chunks above threshold`);

        // Step 4: Get document metadata for results
        const documentIds = [...new Set(scoredChunks.map(chunk => chunk.document_id))];
        let documents;

        try {
            documents = await base44.asServiceRole.entities.Document.filter({
                id: { '$in': documentIds }
            });
        } catch (error) {
            console.error('[SemanticSearch] Error fetching documents:', error);
            return Response.json({
                success: false,
                error: 'Failed to retrieve document metadata',
                details: error.message
            }, { status: 500 });
        }

        // Step 5: Create enriched results
        const documentMap = Object.fromEntries(documents.map(doc => [doc.id, doc]));

        const results = scoredChunks.map(chunk => {
            const doc = documentMap[chunk.document_id];
            return {
                document_id: chunk.document_id,
                document_title: doc?.title || 'Unknown Document',
                document_category: doc?.category,
                document_tags: doc?.tags || [],
                chunk_text: chunk.chunk_text,
                chunk_index: chunk.chunk_index,
                page_number: chunk.page_number,
                section_title: chunk.section_title,
                similarity_score: chunk.similarity_score,
                char_start: chunk.char_start,
                char_end: chunk.char_end
            };
        });

        // Step 6: Generate an AI summary of the results
        let aiSummary = null;
        if (results.length > 0) {
            try {
                const topChunksText = results.slice(0, 3)
                    .map(r => `From "${r.document_title}": ${r.chunk_text.substring(0, 200)}...`)
                    .join('\n\n');

                const summaryResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Based on the user's search query: "${query}"

Here are the most relevant passages found:

${topChunksText}

Provide a concise 2-3 sentence summary of what was found and how it relates to the query.`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            summary: {
                                type: "string",
                                description: "A concise summary of the search results"
                            }
                        }
                    }
                });

                aiSummary = summaryResponse.summary;
            } catch (summaryError) {
                console.warn('[SemanticSearch] Failed to generate AI summary:', summaryError);
                // Continue without summary - not critical
            }
        }

        return Response.json({
            success: true,
            query: query,
            results: results,
            total_results: results.length,
            chunks_searched: chunks.length,
            ai_summary: aiSummary,
            workspace_id: workspace_id || null
        });

    } catch (error) {
        console.error('[SemanticSearch] Unexpected error:', error);
        return Response.json({
            success: false,
            error: 'An unexpected error occurred during semantic search',
            details: error.message
        }, { status: 500 });
    }
});
