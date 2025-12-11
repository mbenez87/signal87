import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await req.json();

    if (!document_id) {
      return Response.json({ error: 'document_id is required' }, { status: 400 });
    }

    // Fetch document with service role
    const documents = await base44.asServiceRole.entities.Document.filter({ id: document_id });
    const document = documents?.[0];

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!document.extracted_content) {
      return Response.json({ error: 'Document has no extracted content to index' }, { status: 400 });
    }

    console.log(`[Indexing] Indexing document: ${document.title}`);

    // Build embedding text input (trim to 8k)
    const contentToEmbed = document.extracted_content.substring(0, 8000);

    console.log(`[Indexing] Content length for embedding: ${contentToEmbed.length}`);

    // Use GPTKEY (new standard)
    const GPTKEY = Deno.env.get("GPTKEY");
    if (!GPTKEY) {
      console.error("[Indexing] Missing GPTKEY environment variable");
      return Response.json({
        error: "GPTKEY is not configured",
        success: false
      }, { status: 500 });
    }

    // Call OpenAI embeddings
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GPTKEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: contentToEmbed,
        encoding_format: "float"
      })
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error("[Indexing] OpenAI API error:", errorText);
      throw new Error(errorText);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData?.data?.[0]?.embedding;

    if (!Array.isArray(embedding)) {
      throw new Error("Invalid embedding returned by OpenAI");
    }

    console.log(`[Indexing] Embedding generated with ${embedding.length} dimensions`);

    // Store embedding
    await base44.asServiceRole.entities.Document.update(document_id, {
      content_embedding: embedding,
      last_indexed: new Date().toISOString()
    });

    console.log(`[Indexing] Document "${document.title}" indexed successfully`);

    return Response.json({
      success: true,
      message: "Document indexed successfully",
      document_title: document.title,
      embedding_dimensions: embedding.length
    });

  } catch (error) {
    console.error("[Indexing] Error:", error);
    return Response.json({
      error: "Failed to index document",
      details: error.message,
      success: false
    }, { status: 500 });
  }
});
