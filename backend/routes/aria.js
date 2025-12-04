import express from 'express';
import {
  processCommand,
  createFolder,
  listFolders,
  deleteFolder,
  uploadDocument,
  listDocuments
} from '../controllers/ariaController.js';

const router = express.Router();

// Main Aria command processor - interprets natural language and routes to appropriate action
router.post('/command', processCommand);

// Specific action endpoints
router.post('/folders/create', createFolder);
router.get('/folders', listFolders);
router.delete('/folders/:folderId', deleteFolder);

router.post('/documents/upload', uploadDocument);
router.get('/documents', listDocuments);

// Status endpoint for frontend to check Aria's availability
router.get('/status', (req, res) => {
  res.json({
    success: true,
    agent: 'Aria',
    status: 'operational',
    capabilities: [
      'folder_creation',
      'folder_management',
      'document_upload',
      'document_analysis',
      'natural_language_processing'
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;
