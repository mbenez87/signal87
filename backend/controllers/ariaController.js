import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage directory for user files
const STORAGE_ROOT = path.join(__dirname, '../storage');

// Ensure storage directory exists
await fs.mkdir(STORAGE_ROOT, { recursive: true });

// In-memory storage for demo (replace with database in production)
let folders = [];
let documents = [];

/**
 * Process natural language command from Aria chat
 * This is the main entry point for Aria's autonomous execution
 */
export async function processCommand(req, res) {
  try {
    const { message, userId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`[Aria] Processing command: "${message}"`);

    // Simple NLP pattern matching (in production, use real AI/LLM)
    const command = message.toLowerCase().trim();
    let result;

    // Folder creation patterns
    if (command.match(/create|make|new.*folder/i)) {
      const folderMatch = command.match(/(?:folder|directory)(?:\s+named?|\s+called)?\s+["']?([a-zA-Z0-9\s_-]+)["']?/i);
      const folderName = folderMatch ? folderMatch[1].trim() : extractPotentialName(command);

      if (folderName) {
        result = await executeCreateFolder(folderName, userId);
      } else {
        result = {
          success: false,
          action: 'create_folder',
          error: 'Could not determine folder name. Please specify a name like "Create folder named Reports"'
        };
      }
    }
    // List folders
    else if (command.match(/list|show|display.*folders?/i)) {
      result = await executeListFolders(userId);
    }
    // Delete folder
    else if (command.match(/delete|remove.*folder/i)) {
      const folderMatch = command.match(/(?:folder|directory)(?:\s+named?|\s+called)?\s+["']?([a-zA-Z0-9\s_-]+)["']?/i);
      const folderName = folderMatch ? folderMatch[1].trim() : null;

      if (folderName) {
        result = await executeDeleteFolder(folderName, userId);
      } else {
        result = {
          success: false,
          error: 'Please specify which folder to delete'
        };
      }
    }
    // Upload document
    else if (command.match(/upload|add.*document|file/i)) {
      result = {
        success: true,
        action: 'upload_document',
        message: 'Document upload functionality ready. Use the upload button or drag-and-drop to add files.',
        requiresUserAction: true
      };
    }
    // Default fallback
    else {
      result = {
        success: true,
        action: 'acknowledgment',
        message: `I understand you want to: "${message}". I'm currently learning more commands. For now, I can create folders, list folders, and manage documents. Try "Create folder named Projects" or "Show my folders".`
      };
    }

    res.json({
      success: true,
      command: message,
      result,
      executedBy: 'Aria',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Aria] Command processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      command: req.body.message
    });
  }
}

/**
 * Create a new folder
 */
export async function createFolder(req, res) {
  try {
    const { name, userId = 'default' } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    const result = await executeCreateFolder(name, userId);
    res.json(result);

  } catch (error) {
    console.error('[Aria] Folder creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * List all folders
 */
export async function listFolders(req, res) {
  try {
    const { userId = 'default' } = req.query;
    const result = await executeListFolders(userId);
    res.json(result);
  } catch (error) {
    console.error('[Aria] List folders error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Delete a folder
 */
export async function deleteFolder(req, res) {
  try {
    const { folderId } = req.params;
    const { userId = 'default' } = req.body;

    const folder = folders.find(f => f.id === folderId && f.userId === userId);

    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found'
      });
    }

    // Delete physical folder
    const folderPath = path.join(STORAGE_ROOT, userId, folder.name);
    await fs.rm(folderPath, { recursive: true, force: true });

    // Remove from in-memory storage
    folders = folders.filter(f => f.id !== folderId);

    res.json({
      success: true,
      action: 'delete_folder',
      message: `Folder "${folder.name}" deleted successfully`,
      folderId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Aria] Delete folder error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Upload document (placeholder for file upload)
 */
export async function uploadDocument(req, res) {
  res.json({
    success: true,
    action: 'upload_document',
    message: 'Document upload endpoint ready. Implement file upload middleware for full functionality.',
    timestamp: new Date().toISOString()
  });
}

/**
 * List documents
 */
export async function listDocuments(req, res) {
  try {
    const { userId = 'default', folderId } = req.query;

    let userDocuments = documents.filter(d => d.userId === userId);

    if (folderId) {
      userDocuments = userDocuments.filter(d => d.folderId === folderId);
    }

    res.json({
      success: true,
      documents: userDocuments,
      count: userDocuments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Aria] List documents error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================================================
// Helper Functions - Internal Execution Logic
// ============================================================================

async function executeCreateFolder(name, userId) {
  // Check if folder already exists
  const existingFolder = folders.find(
    f => f.name.toLowerCase() === name.toLowerCase() && f.userId === userId
  );

  if (existingFolder) {
    return {
      success: false,
      action: 'create_folder',
      error: `Folder "${name}" already exists`,
      existingFolder
    };
  }

  // Create physical folder on file system
  const userStoragePath = path.join(STORAGE_ROOT, userId);
  const folderPath = path.join(userStoragePath, name);

  await fs.mkdir(folderPath, { recursive: true });

  // Create folder record
  const folder = {
    id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    userId,
    path: folderPath,
    createdAt: new Date().toISOString(),
    documentsCount: 0
  };

  folders.push(folder);

  console.log(`[Aria] ✓ Created folder: ${folderPath}`);

  return {
    success: true,
    action: 'create_folder',
    message: `Folder "${name}" created successfully`,
    folder,
    timestamp: new Date().toISOString()
  };
}

async function executeListFolders(userId) {
  const userFolders = folders.filter(f => f.userId === userId);

  return {
    success: true,
    action: 'list_folders',
    folders: userFolders,
    count: userFolders.length,
    message: userFolders.length > 0
      ? `Found ${userFolders.length} folder${userFolders.length !== 1 ? 's' : ''}`
      : 'No folders found. Create your first folder!',
    timestamp: new Date().toISOString()
  };
}

async function executeDeleteFolder(name, userId) {
  const folder = folders.find(
    f => f.name.toLowerCase() === name.toLowerCase() && f.userId === userId
  );

  if (!folder) {
    return {
      success: false,
      action: 'delete_folder',
      error: `Folder "${name}" not found`
    };
  }

  // Delete physical folder
  await fs.rm(folder.path, { recursive: true, force: true });

  // Remove from in-memory storage
  folders = folders.filter(f => f.id !== folder.id);

  return {
    success: true,
    action: 'delete_folder',
    message: `Folder "${name}" deleted successfully`,
    deletedFolder: folder,
    timestamp: new Date().toISOString()
  };
}

function extractPotentialName(command) {
  // Try to extract a name from the end of the command
  const words = command.split(' ');
  const lastWords = words.slice(-3).join(' ');

  // Remove common stop words
  const cleaned = lastWords.replace(/(create|make|new|folder|named|called|a|an|the)/gi, '').trim();

  return cleaned || null;
}
