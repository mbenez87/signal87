# BASE44 Functions for Signal87 AI

This directory contains all Deno Edge Functions ready to deploy to your BASE44 project.

## 📦 Functions Included

### Core ARIA Functions

1. **ariaChatWithCaching.ts** - GPT-4o powered chat (loads all documents)
   - Uses OpenAI GPT-4o
   - Loads all user documents for context
   - Research-grade structured output
   - Requires: `GPTKEY`

2. **ariaChatWithAnthropic.ts** - Claude Sonnet powered chat with semantic search
   - Uses Anthropic Claude 3.5 Sonnet
   - Semantic search with OpenAI embeddings
   - Optional Perplexity web search
   - Requires: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `PERPLEXITY` (optional)

3. **ariaAgentTools.ts** - ARIA's action layer (6 tools)
   - create_folder
   - move_documents
   - update_document_metadata
   - search_documents
   - get_document_details
   - list_folders

### Document Intelligence

4. **documentIntelligenceAgent.ts** - Deep document Q&A with citations
   - Multi-document synthesis
   - Citation generation with `doc://` protocol
   - Follow-up question generation
   - Semantic search fallback

5. **semanticSearch.ts** - Vector-based document search
   - Cosine similarity matching
   - DocumentChunk entity support
   - AI summary of results
   - Configurable similarity threshold

6. **indexDocument.ts** - Generate embeddings for documents
   - OpenAI text-embedding-3-small
   - Stores 1536-dimension vectors
   - Updates `content_embedding` field
   - Requires: `GPTKEY`

### Organization & Insights

7. **organizeFolderWithDocuments.ts** - Smart folder organization
   - 3-strategy search (basic, flexible, semantic)
   - Auto-creates folders
   - Moves documents based on criteria
   - Regex pattern detection

8. **generateDocumentInsights.ts** - Document analytics
   - 8 insight types (trends, anomalies, compliance risks)
   - Growth tracking
   - Duplicate detection
   - Unprocessed document alerts

### Core Operations

9. **upload.ts** - Document upload handler
   - Creates Document entities
   - Auto file type detection
   - Triggers background AI processing
   - Returns immediately with pending status

## 🚀 Deployment to BASE44

### Option 1: Deploy via BASE44 CLI

```bash
# Install BASE44 CLI (if not already installed)
npm install -g @base44/cli

# Login to BASE44
base44 login

# Deploy all functions
cd base44-functions
for file in *.ts; do
  name="${file%.ts}"
  base44 functions deploy "$name" --file "$file"
done
```

### Option 2: Deploy via BASE44 Dashboard

1. Go to your BASE44 project dashboard
2. Navigate to "Functions" section
3. Click "Create Function"
4. For each `.ts` file:
   - Name: Use filename without `.ts` extension
   - Runtime: Deno
   - Code: Copy/paste the file contents
   - Click "Deploy"

### Option 3: Deploy via BASE44 API

```bash
# Set your BASE44 API token
export BASE44_TOKEN="your_token_here"

# Deploy function
curl -X POST https://api.base44.com/v1/functions \
  -H "Authorization: Bearer $BASE44_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ariaChatWithCaching",
    "runtime": "deno",
    "code": "...paste code here..."
  }'
```

## 🔑 Environment Variables Required

Set these in your BASE44 project settings:

```bash
# Required for all ARIA functions
GPTKEY=sk-...                    # OpenAI API key

# Optional - for specific features
ANTHROPIC_API_KEY=sk-ant-...     # For ariaChatWithAnthropic
PERPLEXITY=pplx-...               # For web search in ARIA
CLAUDEAPI=sk-ant-...              # Alias for Anthropic key
GROK_API_KEY=xai-...              # For Grok model (future)
```

## 📋 Function Details

### ariaChatWithCaching
**Endpoint:** POST `/functions/ariaChatWithCaching`
**Payload:**
```json
{
  "messages": [
    { "role": "user", "content": "What are my Q4 revenue projections?" }
  ],
  "user_email": "user@example.com",
  "user_id": "user_123"
}
```

### ariaChatWithAnthropic
**Endpoint:** POST `/functions/ariaChatWithAnthropic`
**Payload:**
```json
{
  "messages": [...],
  "use_web_search": true
}
```

### ariaAgentTools
**Endpoint:** POST `/functions/ariaAgentTools`
**Payload:**
```json
{
  "tool_name": "create_folder",
  "parameters": {
    "folder_name": "Contracts 2024",
    "workspace_id": "ws_123"
  }
}
```

### documentIntelligenceAgent
**Endpoint:** POST `/functions/documentIntelligenceAgent`
**Payload:**
```json
{
  "query": "Summarize the key terms",
  "selectedDocuments": [
    { "id": "doc_123" }
  ],
  "workspaceId": "ws_123"
}
```

### semanticSearch
**Endpoint:** POST `/functions/semanticSearch`
**Payload:**
```json
{
  "query": "machine learning algorithms",
  "workspace_id": "ws_123",
  "limit": 10,
  "min_similarity": 0.3
}
```

### indexDocument
**Endpoint:** POST `/functions/indexDocument`
**Payload:**
```json
{
  "document_id": "doc_123"
}
```

### organizeFolderWithDocuments
**Endpoint:** POST `/functions/organizeFolderWithDocuments`
**Payload:**
```json
{
  "folderName": "Legal Contracts",
  "searchCriteria": "contract agreement",
  "workspaceId": "ws_123"
}
```

### generateDocumentInsights
**Endpoint:** POST `/functions/generateDocumentInsights`
**Payload:**
```json
{
  "workspace_id": "ws_123"
}
```

### upload
**Endpoint:** POST `/functions/upload`
**Payload:**
```json
{
  "file_url": "https://storage.../document.pdf",
  "file_name": "Q4_Report.pdf",
  "file_size": 1024000,
  "file_type": "application/pdf",
  "workspace_id": "ws_123",
  "folder_id": "folder_456"
}
```

## 🧪 Testing Functions

After deployment, test with curl:

```bash
# Test ariaChatWithCaching
curl -X POST https://your-project.base44.dev/functions/ariaChatWithCaching \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello ARIA"}
    ]
  }'
```

## 📝 Notes

- All functions use `@base44/sdk@0.8.4`
- Functions automatically authenticate users via `base44.auth.me()`
- Service role access via `base44.asServiceRole` for elevated permissions
- All functions return JSON responses
- Error handling built into each function

## 🔗 Client Integration

In your frontend, call functions via the base44Client:

```javascript
import base44 from './lib/base44Client';

// Call ARIA chat
const response = await base44.functions.invoke('ariaChatWithCaching', {
  messages: [{ role: 'user', content: 'Hello' }]
});

// Upload document (after uploading file to storage)
const uploadResponse = await base44.functions.invoke('upload', {
  file_url: 'https://...',
  file_name: 'document.pdf',
  file_size: 1024000,
  file_type: 'application/pdf'
});
```

## 🐛 Troubleshooting

1. **401 Unauthorized**: Check user authentication in your app
2. **Missing environment variable**: Set GPTKEY or other required keys in BASE44
3. **Function not found**: Ensure function is deployed with exact name
4. **Timeout**: Increase function timeout in BASE44 settings
5. **Embedding errors**: Verify GPTKEY is valid OpenAI API key

## 📚 Resources

- [BASE44 Documentation](https://docs.base44.com)
- [Deno Documentation](https://deno.land/manual)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic API Reference](https://docs.anthropic.com)

---

**Ready to deploy!** Copy these files to your BASE44 project and start using ARIA's intelligence.
