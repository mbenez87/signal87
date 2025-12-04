# Signal87 AI Platform - Setup Guide

Complete setup instructions for running the Signal87 platform with Aria AI agent.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (React + Vite)                    │
│  Port: 5173                                 │
│  - Dashboard UI                             │
│  - Aria Chat Interface                      │
│  - Folder Management                        │
└───────────────┬─────────────────────────────┘
                │ API Calls
                ↓
┌─────────────────────────────────────────────┐
│  Backend (Node.js + Express)                │
│  Port: 3001                                 │
│  - Aria Command Processor                   │
│  - Folder Operations                        │
│  - Natural Language Parsing                 │
└───────────────┬─────────────────────────────┘
                │ File System
                ↓
┌─────────────────────────────────────────────┐
│  Storage (backend/storage/)                 │
│  - User folders                             │
│  - Documents (future)                       │
└─────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Terminal access

## Installation Steps

### 1. Install Frontend Dependencies

```bash
# From project root
npm install
```

### 2. Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

#### Frontend (.env)
```bash
# Copy example file
cp .env.example .env

# Edit if needed (default should work)
VITE_API_URL=http://localhost:3001
```

#### Backend (backend/.env)
```bash
# Navigate to backend
cd backend

# Copy example file
cp .env.example .env

# Edit if needed (defaults should work)
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Running the Platform

You need **TWO terminal windows** to run both frontend and backend simultaneously.

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚀 Signal87 Backend running on port 3001
🤖 Aria AI Platform API ready
📍 Health check: http://localhost:3001/health
```

### Terminal 2: Start Frontend

```bash
# From project root
npm run dev
```

You should see:
```
VITE v6.0.1  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 3. Open the Platform

Open your browser and navigate to: **http://localhost:5173**

## Testing Aria Folder Creation

### Via Chat Interface

1. Click the **Aria floating button** (purple circle with bot icon)
2. Type any of these commands:
   - `Create folder named Projects`
   - `Make a new folder called Reports`
   - `Create folder Documents`
3. Aria will execute the command and create the folder
4. Navigate to **Folders** tab to see your created folders

### Via Folders Tab

1. Navigate to **Folders** tab in sidebar
2. Click "Ask Aria to Create Folder"
3. Type your folder creation command
4. View the newly created folder in the grid

### Verify on File System

Folders are created at: `backend/storage/default/[FolderName]`

```bash
# Check created folders
ls -la backend/storage/default/
```

## Example Commands Aria Understands

### ✅ Working Commands

- `Create folder named Financial Reports`
- `Make a new folder called Q4 2024`
- `Create folder Projects`
- `Show my folders`
- `List all folders`
- `Delete folder named test` (if folder exists)

### 🚧 Coming Soon

- Document upload
- Report generation
- Signature application
- Compliance checking

## Troubleshooting

### ❌ "Unable to connect to Aria backend"

**Problem:** Frontend can't reach backend

**Solutions:**
1. Make sure backend is running (`cd backend && npm start`)
2. Check backend is on port 3001: `curl http://localhost:3001/health`
3. Verify .env file has correct `VITE_API_URL=http://localhost:3001`

### ❌ "EADDRINUSE: Port already in use"

**Problem:** Port 3001 or 5173 is already taken

**Solutions:**

For backend (port 3001):
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 [PID]
```

For frontend (port 5173):
```bash
# Find process using port 5173
lsof -i :5173
# Kill it
kill -9 [PID]
```

### ❌ Backend crashes on startup

**Problem:** Missing dependencies or environment issues

**Solutions:**
```bash
cd backend
rm -rf node_modules
rm package-lock.json
npm install
npm start
```

### ❌ Aria status shows red (offline)

**Problem:** Backend not running or wrong URL

**Solutions:**
1. Ensure backend is running
2. Check `VITE_API_URL` in frontend .env
3. Refresh the browser after backend starts

## Development Mode

### Auto-reload on Changes

**Backend** (with --watch flag):
```bash
cd backend
npm run dev  # Uses node --watch for auto-restart
```

**Frontend** (Vite hot reload):
```bash
npm run dev  # Already has hot reload
```

## Project Structure

```
signal87/
├── src/                          # Frontend React app
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard with Aria
│   │   └── Landing.tsx          # Landing page
│   ├── services/
│   │   └── ariaApi.ts           # Backend API integration
│   └── utils/
│       └── cn.ts                # Utility functions
├── backend/                      # Backend API
│   ├── server.js                # Express server
│   ├── routes/
│   │   └── aria.js              # Aria API routes
│   ├── controllers/
│   │   └── ariaController.js   # Command processing logic
│   └── storage/                 # User data storage
│       └── default/             # Default user folders
├── aria-agent-config.json       # Aria agent configuration
├── ARIA_AGENT_GUIDE.md         # Integration guide
└── SETUP.md                     # This file
```

## API Endpoints

### Health Check
```
GET /health
Response: { status: 'healthy', service: 'Signal87 Backend', ... }
```

### Aria Status
```
GET /api/aria/status
Response: { success: true, agent: 'Aria', status: 'operational', ... }
```

### Process Command (Natural Language)
```
POST /api/aria/command
Body: { message: "Create folder named Reports", userId: "default" }
Response: { success: true, result: { action: 'create_folder', ... } }
```

### Create Folder (Direct)
```
POST /api/aria/folders/create
Body: { name: "Projects", userId: "default" }
Response: { success: true, folder: {...} }
```

### List Folders
```
GET /api/aria/folders?userId=default
Response: { success: true, folders: [...], count: 3 }
```

## Next Steps

After verifying folder creation works:

1. **Add Document Upload** - Implement file upload to folders
2. **Integrate Real AI** - Connect Claude API for smarter responses
3. **Add User Authentication** - Replace default userId with real auth
4. **Database Integration** - Move from in-memory storage to database
5. **Enhanced NLP** - Improve command parsing with LLM

## Support

Issues with setup? Check:
- [ARIA_AGENT_GUIDE.md](./ARIA_AGENT_GUIDE.md) for Aria configuration
- [aria-agent-config.json](./aria-agent-config.json) for agent settings
- Backend logs in terminal for error messages

---

**You're all set!** Aria should now be able to create real folders when you ask. 🚀
