# Upload Troubleshooting Guide

## Common Upload Failures & Solutions

### 1. "No file URL returned from storage"

**Problem:** `base44.integrations.Core.UploadFile()` is not returning a file URL

**Solutions:**
- ✅ Make sure BASE44 UploadFile integration is configured
- ✅ Check BASE44 dashboard → Integrations → Core → UploadFile
- ✅ Verify you have storage configured (S3, R2, etc.)

### 2. "Upload function not found"

**Problem:** The `upload` Deno function isn't deployed to BASE44

**Solutions:**
- ✅ Deploy `base44-functions/upload.ts` to your BASE44 project
- ✅ Name it exactly "upload" (case-sensitive)
- ✅ Verify deployment: Check BASE44 dashboard → Functions

### 3. "Authentication failed"

**Problem:** User is not authenticated or BASE44 auth is not configured

**Solutions:**
- ✅ Replace mockAuth with real auth provider
- ✅ Check BASE44 authentication settings
- ✅ Verify user.email is set

### 4. "API URL not configured"

**Problem:** `VITE_API_URL` environment variable is not set

**Solutions:**
```bash
# Create/edit .env file
echo "VITE_API_URL=https://your-project.deno.dev" > .env

# Restart dev server
npm run dev
```

### 5. "Invalid response from upload function"

**Problem:** Upload function returned unexpected data structure

**Expected Response:**
```json
{
  "success": true,
  "document": {
    "id": "doc_123",
    "title": "file.pdf",
    "file_url": "https://...",
    "file_type": "pdf",
    "processing_status": "pending"
  }
}
```

**Solutions:**
- ✅ Check upload function logs in BASE44
- ✅ Verify Document entity exists in BASE44
- ✅ Check for errors in Deno function console

## Debug Steps

### Step 1: Check Console

Open browser console (F12) and look for:
```
[UploadContext] Uploading file: example.pdf
[UploadContext] File details: {...}
[UploadContext] UploadFile result: {...}
[UploadContext] Calling upload function...
[UploadContext] Raw response: {...}
```

### Step 2: Verify BASE44 Setup

1. **Functions deployed?**
   - BASE44 Dashboard → Functions
   - Verify "upload" function exists

2. **Integrations configured?**
   - BASE44 Dashboard → Integrations
   - Verify Core.UploadFile is enabled

3. **Entities created?**
   - BASE44 Dashboard → Entities
   - Verify "Document" entity exists

### Step 3: Test Manually

```bash
# Test UploadFile integration
curl -X POST https://your-project.deno.dev/integrations/core/upload \
  -F "file=@test.pdf"

# Test upload function
curl -X POST https://your-project.deno.dev/functions/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "https://example.com/test.pdf",
    "file_name": "test.pdf",
    "file_size": 1024,
    "file_type": "application/pdf"
  }'
```

### Step 4: Check Environment

```bash
# Verify .env is loaded
cat .env
# Should see: VITE_API_URL=https://...

# Restart dev server
npm run dev
```

## Quick Fixes

### If BASE44 functions aren't deployed:

```bash
cd base44-functions

# Deploy upload function
base44 functions deploy upload --file upload.ts

# Or manually copy/paste in BASE44 dashboard
```

### If .env is missing:

```bash
cp .env.example .env
# Edit .env and set VITE_API_URL
```

### If authentication fails:

Replace mockAuth in `App.tsx` with real BASE44 auth:
```javascript
// TODO: Replace with real BASE44 auth
const auth = base44.auth.createProvider();
```

## Error Messages Decoded

| Error | Meaning | Fix |
|-------|---------|-----|
| "No file URL returned" | Storage upload failed | Check UploadFile integration |
| "Upload function not found" | Function not deployed | Deploy upload.ts to BASE44 |
| "Authentication failed" | No user session | Set up real auth |
| "VITE_API_URL" error | Env var not set | Create .env with API URL |
| "Invalid response" | Function returned wrong data | Check function logs |

## Still Failing?

1. Check browser console for detailed error logs
2. Check BASE44 function logs for backend errors
3. Verify all 3 pieces are in place:
   - ✅ Upload page (UI)
   - ✅ UploadContext (state management)
   - ✅ upload.ts (backend function)

4. Open an issue with:
   - Console error logs
   - BASE44 function logs
   - Steps to reproduce
