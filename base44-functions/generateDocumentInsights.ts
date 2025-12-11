import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const { workspace_id = null } = await req.json();

        console.log(`[Insights] Generating insights for user: ${user.email}`);

        // Fetch all documents for the user/workspace
        const filter = workspace_id ? { workspace_id } : { created_by: user.email };
        const documents = await base44.asServiceRole.entities.Document.filter(filter);

        if (documents.length === 0) {
            return Response.json({
                success: true,
                insights: [],
                message: 'No documents found to analyze'
            });
        }

        console.log(`[Insights] Analyzing ${documents.length} documents`);

        const insights = [];

        // Insight 1: Document Growth Trend
        const documentsByMonth = {};
        documents.forEach(doc => {
            const monthKey = new Date(doc.created_date).toISOString().slice(0, 7);
            documentsByMonth[monthKey] = (documentsByMonth[monthKey] || 0) + 1;
        });

        const months = Object.keys(documentsByMonth).sort();
        if (months.length >= 2) {
            const lastMonth = documentsByMonth[months[months.length - 1]];
            const prevMonth = documentsByMonth[months[months.length - 2]];
            const growth = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1);

            insights.push({
                type: 'trend',
                summary: `Document uploads ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth)}% this month`,
                details: {
                    current_month: lastMonth,
                    previous_month: prevMonth,
                    growth_percentage: parseFloat(growth),
                    trend_data: documentsByMonth
                },
                priority: Math.abs(growth) > 50 ? 'high' : 'medium',
                confidence_score: 95,
                generated_by_model: 'statistical_analysis'
            });
        }

        // Insight 2: Unprocessed Documents
        const unprocessedDocs = documents.filter(doc =>
            doc.processing_status === 'pending' || !doc.ai_summary
        );

        if (unprocessedDocs.length > 0) {
            insights.push({
                type: 'summary_aggregation',
                summary: `${unprocessedDocs.length} documents haven't been processed with AI yet`,
                details: {
                    unprocessed_count: unprocessedDocs.length,
                    document_ids: unprocessedDocs.map(d => d.id),
                    document_titles: unprocessedDocs.slice(0, 5).map(d => d.title)
                },
                priority: 'medium',
                confidence_score: 100,
                action_suggestion: 'Process these documents with Vision AI to unlock full search and intelligence capabilities',
                related_document_ids: unprocessedDocs.map(d => d.id),
                generated_by_model: 'rule_based'
            });
        }

        // Insight 3: Documents Without Embeddings
        const noEmbeddingDocs = documents.filter(doc =>
            doc.embedding_status !== 'completed' && doc.extracted_content
        );

        if (noEmbeddingDocs.length > 0) {
            insights.push({
                type: 'summary_aggregation',
                summary: `${noEmbeddingDocs.length} documents ready for semantic search embeddings`,
                details: {
                    ready_count: noEmbeddingDocs.length,
                    document_ids: noEmbeddingDocs.map(d => d.id)
                },
                priority: 'high',
                confidence_score: 100,
                action_suggestion: 'Generate embeddings to enable powerful semantic search across these documents',
                related_document_ids: noEmbeddingDocs.map(d => d.id),
                generated_by_model: 'rule_based'
            });
        }

        // Insight 4: Category Distribution
        const categoryCount = {};
        documents.forEach(doc => {
            if (doc.category) {
                categoryCount[doc.category] = (categoryCount[doc.category] || 0) + 1;
            }
        });

        const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            insights.push({
                type: 'summary_aggregation',
                summary: `Most documents are categorized as "${topCategory[0]}" (${topCategory[1]} documents)`,
                details: {
                    category_distribution: categoryCount,
                    top_category: topCategory[0],
                    top_category_count: topCategory[1]
                },
                priority: 'low',
                confidence_score: 100,
                generated_by_model: 'statistical_analysis'
            });
        }

        // Insight 5: Recent Activity Spike
        const last7Days = documents.filter(doc => {
            const docDate = new Date(doc.created_date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return docDate >= weekAgo;
        });

        const prev7Days = documents.filter(doc => {
            const docDate = new Date(doc.created_date);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return docDate >= twoWeeksAgo && docDate < weekAgo;
        });

        if (last7Days.length > prev7Days.length * 1.5) {
            insights.push({
                type: 'anomaly',
                summary: `Document uploads spiked in the last 7 days (${last7Days.length} uploads vs ${prev7Days.length} previous week)`,
                details: {
                    last_7_days: last7Days.length,
                    previous_7_days: prev7Days.length,
                    spike_percentage: ((last7Days.length - prev7Days.length) / prev7Days.length * 100).toFixed(1)
                },
                priority: 'medium',
                confidence_score: 90,
                generated_by_model: 'statistical_analysis'
            });
        }

        // Insight 6: Unsigned Documents
        const unsignedDocs = documents.filter(doc =>
            !doc.is_signed && !doc.signed_date && doc.file_type === 'pdf'
        );

        if (unsignedDocs.length > 5) {
            insights.push({
                type: 'compliance_risk',
                summary: `${unsignedDocs.length} PDF documents haven't been signed yet`,
                details: {
                    unsigned_count: unsignedDocs.length,
                    document_ids: unsignedDocs.map(d => d.id)
                },
                priority: 'medium',
                confidence_score: 100,
                action_suggestion: 'Review these documents and sign if needed',
                related_document_ids: unsignedDocs.map(d => d.id),
                generated_by_model: 'rule_based'
            });
        }

        // Insight 7: Large Files
        const largeFiles = documents.filter(doc => doc.file_size > 10 * 1024 * 1024); // > 10MB

        if (largeFiles.length > 0) {
            const totalSize = largeFiles.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
            const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

            insights.push({
                type: 'summary_aggregation',
                summary: `${largeFiles.length} large files (${sizeMB} MB total) detected`,
                details: {
                    large_file_count: largeFiles.length,
                    total_size_mb: parseFloat(sizeMB),
                    document_ids: largeFiles.map(d => d.id)
                },
                priority: 'low',
                confidence_score: 100,
                action_suggestion: 'Consider archiving or compressing large files to optimize storage',
                related_document_ids: largeFiles.map(d => d.id),
                generated_by_model: 'rule_based'
            });
        }

        // Insight 8: Duplicate Detection (by title similarity)
        const titleMap = {};
        documents.forEach(doc => {
            const normalizedTitle = doc.title?.toLowerCase().trim();
            if (normalizedTitle) {
                if (!titleMap[normalizedTitle]) {
                    titleMap[normalizedTitle] = [];
                }
                titleMap[normalizedTitle].push(doc);
            }
        });

        const duplicates = Object.values(titleMap).filter(group => group.length > 1);
        if (duplicates.length > 0) {
            const duplicateCount = duplicates.reduce((sum, group) => sum + group.length - 1, 0);
            insights.push({
                type: 'anomaly',
                summary: `${duplicateCount} potential duplicate documents detected`,
                details: {
                    duplicate_groups: duplicates.length,
                    total_duplicates: duplicateCount,
                    examples: duplicates.slice(0, 3).map(group => ({
                        title: group[0].title,
                        count: group.length,
                        document_ids: group.map(d => d.id)
                    }))
                },
                priority: 'medium',
                confidence_score: 75,
                action_suggestion: 'Review and consolidate duplicate documents',
                generated_by_model: 'similarity_analysis'
            });
        }

        // Store insights in the database
        const storedInsights = await Promise.allSettled(
            insights.map(insight =>
                base44.asServiceRole.entities.DocumentInsight.create({
                    ...insight,
                    workspace_id: workspace_id,
                    status: 'active'
                })
            )
        );

        const successfulInsights = storedInsights.filter(r => r.status === 'fulfilled').length;

        console.log(`[Insights] Generated ${successfulInsights} insights`);

        return Response.json({
            success: true,
            insights: insights,
            stored_count: successfulInsights,
            total_documents: documents.length
        });

    } catch (error) {
        console.error('[Insights] Error generating insights:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});
