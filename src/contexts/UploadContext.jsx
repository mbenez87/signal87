import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import base44 from '../lib/base44Client';

const UploadContext = createContext();

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within UploadProvider');
  }
  return context;
};

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState([]);
  const [status, setStatus] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const processFile = useCallback(async (fileData) => {
    const { file, id, workspace_id } = fileData;

    try {
      setStatus(prev => ({ ...prev, [id]: { state: 'uploading', progress: 20 }}));

      // Step 1: Upload file to storage
      console.log('[UploadContext] Uploading file:', file.name);
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const file_url = uploadResult?.file_url || uploadResult?.url;

      if (!file_url) {
        throw new Error('No file URL returned from storage');
      }

      console.log('[UploadContext] File uploaded:', file_url);

      setStatus(prev => ({ ...prev, [id]: { state: 'creating_document', progress: 60 }}));

      // Step 2: Create document record
      const uploadPayload = {
        file_url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        workspace_id: workspace_id || null,
        folder_id: null
      };

      console.log('[UploadContext] Upload payload:', uploadPayload);

      let response, data;

      try {
        response = await base44.functions.invoke('upload', uploadPayload);
        console.log('[UploadContext] Raw response:', response);

        // Parse response - base44.functions.invoke returns { data: {...} } or direct data
        data = response?.data || response;
        console.log('[UploadContext] Parsed data:', data);

        if (!data?.document?.id && !data?.success) {
          console.error('[UploadContext] Invalid response structure:', data);
          throw new Error('Invalid response from upload function');
        }
      } catch (invokeError) {
        console.error('[UploadContext] Function invoke error:', invokeError);
        throw new Error(`Upload function failed: ${invokeError.message || 'Unknown error'}`);
      }

      setStatus(prev => ({
        ...prev,
        [id]: {
          state: 'completed',
          progress: 100,
          document: data.document
        }
      }));

      console.log(`[UploadContext] ${file.name} uploaded successfully`);

      // Signal that documents have been updated (for cross-tab/page communication)
      try {
        localStorage.setItem('documents_updated', Date.now().toString());
      } catch (e) {
        console.error('Failed to set localStorage flag:', e);
      }

    } catch (error) {
      console.error('[UploadContext] Upload error:', error);

      setStatus(prev => ({
        ...prev,
        [id]: {
          state: 'failed',
          progress: 0,
          message: error.message || 'Upload failed'
        }
      }));

      console.error(`[UploadContext] Failed to upload ${file?.name}: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (processingRef.current || uploads.length === 0) return;

    const pendingUploads = uploads.filter(upload => {
      const uploadStatus = status[upload.id];
      return !uploadStatus || uploadStatus.state === 'pending' || uploadStatus.state === 'queued';
    });

    if (pendingUploads.length === 0) {
      setIsProcessing(false);
      return;
    }

    const processNext = async () => {
      processingRef.current = true;
      setIsProcessing(true);

      for (const upload of pendingUploads) {
        await processFile(upload);
      }

      processingRef.current = false;
      setIsProcessing(false);
    };

    processNext();
  }, [uploads, status, processFile]);

  const addToQueue = (files) => {
    const validatedFiles = files.map(f => ({
      ...f,
      validated_at: Date.now()
    }));

    setUploads(prev => [...prev, ...validatedFiles]);
    const newStatus = {};
    validatedFiles.forEach(f => {
      newStatus[f.id] = { state: 'queued', progress: 0 };
    });
    setStatus(prev => ({ ...prev, ...newStatus }));
  };

  const removeFromQueue = (id) => {
    setUploads(prev => prev.filter(u => u.id !== id));
    setStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[id];
      return newStatus;
    });
  };

  const clearCompleted = () => {
    const completedIds = Object.keys(status).filter(
      id => status[id].state === 'completed' || status[id].state === 'failed'
    );

    setUploads(prev => prev.filter(u => !completedIds.includes(u.id)));
    setStatus(prev => {
      const newStatus = { ...prev };
      completedIds.forEach(id => delete newStatus[id]);
      return newStatus;
    });
  };

  return (
    <UploadContext.Provider value={{
      uploads,
      status,
      isProcessing,
      addToQueue,
      removeFromQueue,
      clearCompleted
    }}>
      {children}
    </UploadContext.Provider>
  );
};
