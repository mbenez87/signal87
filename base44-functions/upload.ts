import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { file_url, file_name, file_size, file_type, workspace_id, folder_id } = body;

    if (!file_url || !file_name) {
      return Response.json({ error: 'Missing required fields: file_url and file_name' }, { status: 400 });
    }

    console.log(`[Upload] Processing document: ${file_name}`);

    // Determine file type from filename if not provided
    const fileName = file_name.toLowerCase();
    let docFileType = 'other';
    if (fileName.endsWith('.pdf')) docFileType = 'pdf';
    else if (fileName.endsWith('.docx')) docFileType = 'docx';
    else if (fileName.endsWith('.txt')) docFileType = 'txt';
    else if (fileName.endsWith('.csv')) docFileType = 'csv';
    else if (fileName.endsWith('.xlsx')) docFileType = 'xlsx';
    else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) docFileType = 'image';

    // Create document record
    const documentData = {
      title: file_name,
      file_url,
      file_type: docFileType,
      file_size: file_size || 0,
      workspace_id: workspace_id || null,
      folder_id: folder_id || null,
      processing_status: 'pending',
      category: 'other',
      tags: [],
      extracted_content: '',
      ai_summary: 'Processing...',
      created_by: user.email,
      created_date: new Date().toISOString()
    };

    console.log(`[Upload] Creating document with data:`, JSON.stringify(documentData, null, 2));
    const document = await base44.asServiceRole.entities.Document.create(documentData);
    console.log(`[Upload] Document created successfully:`, JSON.stringify(document, null, 2));

    // Trigger AI processing in background (non-blocking)
    base44.asServiceRole.functions.invoke('processDocumentWithVision', {
      document_id: document.id,
      file_url,
      file_type: docFileType
    }).catch(error => {
      console.error(`[Upload] Background AI processing error for ${document.id}:`, error);
    });

    console.log(`[Upload] AI processing triggered for document ${document.id}`);

    return Response.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        file_url: document.file_url,
        file_type: document.file_type,
        processing_status: 'pending',
        message: 'Document uploaded. AI analysis in progress.'
      }
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return Response.json({
      error: error.message || 'Upload failed',
      details: error.toString()
    }, { status: 500 });
  }
});
