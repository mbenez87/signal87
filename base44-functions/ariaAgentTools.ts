import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * ARIA Agent Tools - Enables ARIA to take actions on behalf of the user
 *
 * Available Tools:
 * 1. create_folder - Create a new folder
 * 2. move_documents - Move documents to a folder
 * 3. update_document_metadata - Update document tags, category, etc.
 * 4. create_document_note - Add notes/annotations to a document
 * 5. search_documents - Search for specific documents
 * 6. get_document_details - Get detailed information about a document
 * 7. list_folders - List all available folders
 */

async function createFolder(base44, { folder_name, parent_folder_id = null, workspace_id = null, color = 'blue' }) {
    try {
        console.log(`[Tool: create_folder] Creating folder: ${folder_name}`);

        const folderData = {
            name: folder_name,
            workspace_id: workspace_id,
            color: color
        };

        if (parent_folder_id) {
            folderData.parent_folder_id = parent_folder_id;
        }

        const newFolder = await base44.asServiceRole.entities.Folder.create(folderData);

        return {
            success: true,
            folder_id: newFolder.id,
            folder_name: newFolder.name,
            message: `Successfully created folder "${folder_name}"`
        };
    } catch (error) {
        console.error('[Tool: create_folder] Error:', error);
        return {
            success: false,
            error: `Failed to create folder: ${error.message}`
        };
    }
}

async function moveDocuments(base44, { document_ids, folder_id }) {
    try {
        console.log(`[Tool: move_documents] Moving ${document_ids.length} documents to folder ${folder_id}`);

        if (!Array.isArray(document_ids) || document_ids.length === 0) {
            return {
                success: false,
                error: 'document_ids must be a non-empty array'
            };
        }

        // Verify folder exists
        let folder;
        try {
            folder = await base44.asServiceRole.entities.Folder.get(folder_id);
        } catch (e) {
            return {
                success: false,
                error: `Folder with id ${folder_id} not found`
            };
        }

        // Move each document
        const results = await Promise.allSettled(
            document_ids.map(doc_id =>
                base44.asServiceRole.entities.Document.update(doc_id, { folder_id: folder_id })
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - successful;

        return {
            success: true,
            moved_count: successful,
            failed_count: failed,
            folder_name: folder?.name || 'Unknown',
            message: `Successfully moved ${successful} document(s) to "${folder?.name || 'folder'}"${failed > 0 ? `. ${failed} failed.` : ''}`
        };
    } catch (error) {
        console.error('[Tool: move_documents] Error:', error);
        return {
            success: false,
            error: `Failed to move documents: ${error.message}`
        };
    }
}

async function updateDocumentMetadata(base44, { document_id, updates }) {
    try {
        console.log(`[Tool: update_document_metadata] Updating document ${document_id}`);

        const allowedFields = ['title', 'category', 'tags', 'is_favorited'];
        const sanitizedUpdates = {};

        for (const [key, value] of Object.entries(updates || {})) {
            if (allowedFields.includes(key)) {
                sanitizedUpdates[key] = value;
            }
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            return {
                success: false,
                error: 'No valid fields to update'
            };
        }

        await base44.asServiceRole.entities.Document.update(document_id, sanitizedUpdates);

        return {
            success: true,
            updated_fields: Object.keys(sanitizedUpdates),
            message: `Successfully updated document metadata`
        };
    } catch (error) {
        console.error('[Tool: update_document_metadata] Error:', error);
        return {
            success: false,
            error: `Failed to update document: ${error.message}`
        };
    }
}

async function searchDocuments(base44, { query, workspace_id = null, category = null, limit = 10 }) {
    try {
        console.log(`[Tool: search_documents] Searching for: ${query}`);

        const filter = { is_trashed: false };

        if (workspace_id) {
            filter.workspace_id = workspace_id;
        }

        if (category) {
            filter.category = category;
        }

        const documents = await base44.asServiceRole.entities.Document.filter(filter);

        // Simple text-based filtering
        const queryLower = (query || '').toLowerCase();
        const matchedDocs = (documents || []).filter(doc =>
            (doc.title || '').toLowerCase().includes(queryLower) ||
            (doc.ai_summary || '').toLowerCase().includes(queryLower) ||
            (doc.extracted_content || '').toLowerCase().includes(queryLower) ||
            (doc.tags || []).some(tag => (tag || '').toLowerCase().includes(queryLower))
        ).slice(0, limit);

        return {
            success: true,
            documents: matchedDocs.map(doc => ({
                id: doc.id,
                title: doc.title || 'Untitled',
                category: doc.category || 'Uncategorized',
                tags: doc.tags || [],
                summary: (doc.ai_summary || '').substring(0, 200),
                created_date: doc.created_date
            })),
            count: matchedDocs.length,
            message: `Found ${matchedDocs.length} document(s) matching "${query}"`
        };
    } catch (error) {
        console.error('[Tool: search_documents] Error:', error);
        return {
            success: false,
            error: `Failed to search documents: ${error.message}`
        };
    }
}

async function getDocumentDetails(base44, { document_id }) {
    try {
        console.log(`[Tool: get_document_details] Getting details for ${document_id}`);

        let doc;
        try {
            doc = await base44.asServiceRole.entities.Document.get(document_id);
        } catch (e) {
            return {
                success: false,
                error: 'Document not found'
            };
        }

        return {
            success: true,
            document: {
                id: doc.id,
                title: doc.title || 'Untitled',
                file_type: doc.file_type || 'Unknown',
                file_size: doc.file_size,
                category: doc.category || 'Uncategorized',
                tags: doc.tags || [],
                summary: doc.ai_summary || '',
                key_insights: doc.key_insights || [],
                created_date: doc.created_date,
                created_by: doc.created_by,
                folder_id: doc.folder_id,
                is_favorited: doc.is_favorited || false,
                processing_status: doc.processing_status,
                embedding_status: doc.embedding_status
            }
        };
    } catch (error) {
        console.error('[Tool: get_document_details] Error:', error);
        return {
            success: false,
            error: `Failed to get document details: ${error.message}`
        };
    }
}

async function listFolders(base44, { workspace_id = null }) {
    try {
        console.log(`[Tool: list_folders] Listing folders`);

        const filter = workspace_id ? { workspace_id } : {};
        const folders = await base44.asServiceRole.entities.Folder.filter(filter);

        return {
            success: true,
            folders: (folders || []).map(folder => ({
                id: folder.id,
                name: folder.name || 'Unnamed',
                color: folder.color,
                document_count: folder.document_ids?.length || 0,
                parent_folder_id: folder.parent_folder_id,
                created_date: folder.created_date
            })),
            count: (folders || []).length,
            message: `Found ${(folders || []).length} folder(s)`
        };
    } catch (error) {
        console.error('[Tool: list_folders] Error:', error);
        return {
            success: false,
            error: `Failed to list folders: ${error.message}`
        };
    }
}

const TOOL_DEFINITIONS = {
    create_folder: {
        description: 'Create a new folder to organize documents',
        parameters: {
            folder_name: { type: 'string', required: true, description: 'Name of the new folder' },
            parent_folder_id: { type: 'string', required: false, description: 'ID of parent folder (optional)' },
            workspace_id: { type: 'string', required: false, description: 'Workspace ID (optional)' },
            color: { type: 'string', required: false, description: 'Folder color (blue, green, purple, etc.)' }
        },
        handler: createFolder
    },
    move_documents: {
        description: 'Move one or more documents to a specific folder',
        parameters: {
            document_ids: { type: 'array', required: true, description: 'Array of document IDs to move' },
            folder_id: { type: 'string', required: true, description: 'Target folder ID' }
        },
        handler: moveDocuments
    },
    update_document_metadata: {
        description: 'Update document properties like title, category, tags, or favorite status',
        parameters: {
            document_id: { type: 'string', required: true, description: 'Document ID to update' },
            updates: { type: 'object', required: true, description: 'Object with fields to update (title, category, tags, is_favorited)' }
        },
        handler: updateDocumentMetadata
    },
    search_documents: {
        description: 'Search for documents by title, content, tags, or summary',
        parameters: {
            query: { type: 'string', required: true, description: 'Search query' },
            workspace_id: { type: 'string', required: false, description: 'Filter by workspace' },
            category: { type: 'string', required: false, description: 'Filter by category' },
            limit: { type: 'number', required: false, description: 'Max results (default 10)' }
        },
        handler: searchDocuments
    },
    get_document_details: {
        description: 'Get detailed information about a specific document',
        parameters: {
            document_id: { type: 'string', required: true, description: 'Document ID' }
        },
        handler: getDocumentDetails
    },
    list_folders: {
        description: 'List all available folders',
        parameters: {
            workspace_id: { type: 'string', required: false, description: 'Filter by workspace' }
        },
        handler: listFolders
    }
};

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

        const body = await req.json();
        const { tool_name, parameters } = body;

        if (!tool_name) {
            return Response.json({
                success: false,
                error: 'tool_name is required'
            }, { status: 400 });
        }

        console.log(`[Agent Tools] User ${user.email} invoking tool: ${tool_name}`);

        const tool = TOOL_DEFINITIONS[tool_name];

        if (!tool) {
            return Response.json({
                success: false,
                error: `Unknown tool: ${tool_name}`,
                available_tools: Object.keys(TOOL_DEFINITIONS)
            }, { status: 400 });
        }

        // Validate required parameters
        for (const [param, config] of Object.entries(tool.parameters)) {
            if (config.required && (!parameters || parameters[param] === undefined)) {
                return Response.json({
                    success: false,
                    error: `Missing required parameter: ${param}`,
                    tool_description: tool.description,
                    parameters: tool.parameters
                }, { status: 400 });
            }
        }

        // Execute the tool
        const result = await tool.handler(base44, parameters || {});

        console.log(`[Agent Tools] Tool ${tool_name} completed:`, result.success ? 'SUCCESS' : 'FAILED');

        return Response.json(result);

    } catch (error) {
        console.error('[Agent Tools] Unexpected error:', error);

        return Response.json({
            success: false,
            error: 'An unexpected error occurred',
            details: error.message
        }, { status: 500 });
    }
});
