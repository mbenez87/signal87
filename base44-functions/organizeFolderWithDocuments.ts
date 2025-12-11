import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { folderName, searchCriteria, workspaceId } = await req.json();

        if (!folderName || !searchCriteria) {
            return Response.json({
                error: 'Missing required parameters: folderName and searchCriteria'
            }, { status: 400 });
        }

        console.log(`[ORGANIZE] Starting organization for folder: "${folderName}", criteria: "${searchCriteria}"`);

        // Step 1: Create the folder
        const newFolder = await base44.asServiceRole.entities.Folder.create({
            name: folderName,
            workspace_id: workspaceId || 'personal',
            color: 'blue',
            icon: 'Folder',
            document_ids: [],
            created_by: user.email
        });

        console.log(`[ORGANIZE] Created folder: ${folderName} with ID: ${newFolder.id}`);

        // Step 2: Get all user's documents
        const allDocuments = await base44.asServiceRole.entities.Document.filter({
            created_by: user.email,
            is_trashed: false
        });

        console.log(`[ORGANIZE] Found ${allDocuments.length} total documents for user`);

        // Step 3: Enhanced multi-strategy search
        const searchLower = searchCriteria.toLowerCase().trim();

        // Strategy 1: Exact and partial string matching
        const basicMatches = allDocuments.filter(doc => {
            const titleMatch = doc.title?.toLowerCase().includes(searchLower);
            const contentMatch = doc.extracted_content?.toLowerCase().includes(searchLower);
            const categoryMatch = doc.category?.toLowerCase().includes(searchLower);
            const tagsMatch = doc.tags?.some(tag => tag.toLowerCase().includes(searchLower));

            const matched = titleMatch || contentMatch || categoryMatch || tagsMatch;

            if (matched) {
                console.log(`[ORGANIZE] Basic match: "${doc.title}" (title: ${titleMatch}, content: ${contentMatch}, category: ${categoryMatch}, tags: ${tagsMatch})`);
            }

            return matched;
        });

        console.log(`[ORGANIZE] Basic matching found ${basicMatches.length} documents`);

        // Strategy 2: Fuzzy/flexible matching for common variations
        const flexibleMatches = allDocuments.filter(doc => {
            // Split search criteria into words for flexible matching
            const searchWords = searchLower.split(/\s+/);
            const titleLower = (doc.title || '').toLowerCase();
            const contentLower = (doc.extracted_content || '').toLowerCase();

            // Check if all search words appear (order-independent)
            const allWordsInTitle = searchWords.every(word => titleLower.includes(word));
            const allWordsInContent = searchWords.every(word => contentLower.includes(word));

            // Check for partial matches (at least 60% of words match)
            const titleWordMatches = searchWords.filter(word => titleLower.includes(word)).length;
            const contentWordMatches = searchWords.filter(word => contentLower.includes(word)).length;
            const partialTitleMatch = titleWordMatches >= Math.ceil(searchWords.length * 0.6);
            const partialContentMatch = contentWordMatches >= Math.ceil(searchWords.length * 0.6);

            const matched = allWordsInTitle || allWordsInContent || partialTitleMatch || partialContentMatch;

            if (matched && !basicMatches.find(m => m.id === doc.id)) {
                console.log(`[ORGANIZE] Flexible match: "${doc.title}" (allWordsInTitle: ${allWordsInTitle}, allWordsInContent: ${allWordsInContent}, partial: ${partialTitleMatch || partialContentMatch})`);
            }

            return matched;
        });

        console.log(`[ORGANIZE] Flexible matching found ${flexibleMatches.length} documents`);

        // Strategy 3: AI-powered semantic search for better matching
        let semanticMatches = [];
        try {
            // Use the semantic search function if we have summaries
            const documentsWithSummaries = allDocuments.filter(doc => doc.ai_summary);

            if (documentsWithSummaries.length > 0) {
                console.log(`[ORGANIZE] Attempting semantic search across ${documentsWithSummaries.length} documents with AI summaries`);

                // Use AI to find semantically related documents
                const semanticSearchPrompt = `Find documents related to: "${searchCriteria}"`;

                const semanticResults = await base44.asServiceRole.functions.invoke('semanticSearch', {
                    query: semanticSearchPrompt,
                    userEmail: user.email,
                    topK: 10,
                    threshold: 0.3
                });

                if (semanticResults?.data?.results) {
                    semanticMatches = semanticResults.data.results
                        .map(result => allDocuments.find(doc => doc.id === result.document_id))
                        .filter(doc => doc);

                    console.log(`[ORGANIZE] Semantic search found ${semanticMatches.length} documents`);
                }
            }
        } catch (semanticError) {
            console.warn(`[ORGANIZE] Semantic search failed (continuing with basic search):`, semanticError.message);
        }

        // Combine all matches and remove duplicates
        const allMatchIds = new Set();
        const matchingDocuments = [];

        [...basicMatches, ...flexibleMatches, ...semanticMatches].forEach(doc => {
            if (doc && !allMatchIds.has(doc.id)) {
                allMatchIds.add(doc.id);
                matchingDocuments.push(doc);
            }
        });

        console.log(`[ORGANIZE] Total unique matches: ${matchingDocuments.length}`);

        // Log some examples of what was searched
        if (matchingDocuments.length === 0 && allDocuments.length > 0) {
            console.log(`[ORGANIZE] No matches found. Sample document titles from user's library:`);
            allDocuments.slice(0, 5).forEach(doc => {
                console.log(`  - "${doc.title}"`);
            });
        }

        // Step 4: Move matching documents to the folder
        const documentIds = matchingDocuments.map(doc => doc.id);
        const movePromises = matchingDocuments.map(doc =>
            base44.asServiceRole.entities.Document.update(doc.id, {
                folder_id: newFolder.id
            })
        );

        await Promise.all(movePromises);

        // Step 5: Update folder with document IDs
        await base44.asServiceRole.entities.Folder.update(newFolder.id, {
            document_ids: documentIds
        });

        console.log(`[ORGANIZE] Successfully moved ${matchingDocuments.length} documents to folder: ${folderName}`);

        return Response.json({
            success: true,
            folder: {
                id: newFolder.id,
                name: newFolder.name,
                documentCount: matchingDocuments.length
            },
            movedDocuments: matchingDocuments.map(doc => ({
                id: doc.id,
                title: doc.title
            })),
            message: `Successfully created folder "${folderName}" and moved ${matchingDocuments.length} document${matchingDocuments.length !== 1 ? 's' : ''} into it.`,
            searchDetails: {
                totalDocuments: allDocuments.length,
                basicMatches: basicMatches.length,
                flexibleMatches: flexibleMatches.length,
                semanticMatches: semanticMatches.length,
                finalMatches: matchingDocuments.length
            }
        });

    } catch (error) {
        console.error('[ORGANIZE] Error organizing folder:', error);
        return Response.json({
            error: error.message || 'Failed to organize folder and documents'
        }, { status: 500 });
    }
});
