import { useState, useCallback } from 'react';
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle, Loader2, FolderPlus } from 'lucide-react';
import { useUpload } from '../contexts';
import { useWorkspace } from '../contexts';
import { Button, Card, CardContent, CardHeader, CardTitle, Progress } from '../components/ui';
import { cn } from '../utils/cn';

export default function Upload() {
  const { uploads, status, isProcessing, addToQueue, removeFromQueue, clearCompleted } = useUpload();
  const { activeWorkspace } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [activeWorkspace]);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [activeWorkspace]);

  const handleFiles = (fileList) => {
    // Validate and prepare files
    const validFiles = fileList.filter(file => {
      // Max 50MB per file
      if (file.size > 50 * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds 50MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    // Create upload items with proper structure
    const uploadItems = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file: file, // The actual File object
      workspace_id: activeWorkspace?.id === 'personal' ? null : activeWorkspace?.id
    }));

    addToQueue(uploadItems);
  };

  const getStatusIcon = (uploadId) => {
    const uploadStatus = status[uploadId];
    if (!uploadStatus) {
      return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }

    switch (uploadStatus.state) {
      case 'queued':
        return <Loader2 className="w-5 h-5 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'creating_document':
        return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (uploadId) => {
    const uploadStatus = status[uploadId];
    if (!uploadStatus) return 'Pending...';

    switch (uploadStatus.state) {
      case 'queued':
        return 'In queue...';
      case 'uploading':
        return 'Uploading to storage...';
      case 'creating_document':
        return 'Creating document...';
      case 'completed':
        return 'Complete!';
      case 'failed':
        return uploadStatus.message || 'Failed';
      default:
        return 'Processing...';
    }
  };

  const getProgress = (uploadId) => {
    const uploadStatus = status[uploadId];
    return uploadStatus?.progress || 0;
  };

  const completedCount = Object.values(status).filter(s => s.state === 'completed').length;
  const failedCount = Object.values(status).filter(s => s.state === 'failed').length;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Upload Documents
          </h1>
          <p className="text-gray-400">
            Drag & drop files or click to browse. AI will automatically extract and analyze content.
          </p>
        </div>

        {/* Workspace Info */}
        {activeWorkspace && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
            <FolderPlus className="w-4 h-4" />
            <span>Uploading to: <span className="text-blue-400">{activeWorkspace.name}</span></span>
          </div>
        )}

        {/* Drop Zone */}
        <Card
          className={cn(
            'mb-8 border-2 border-dashed transition-all duration-200',
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-700 hover:border-zinc-600'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-12">
            <div className="text-center">
              <UploadIcon className={cn(
                'w-16 h-16 mx-auto mb-4 transition-colors',
                isDragging ? 'text-blue-500' : 'text-gray-500'
              )} />
              <h3 className="text-xl font-semibold mb-2">
                {isDragging ? 'Drop files here' : 'Drag & drop files'}
              </h3>
              <p className="text-gray-400 mb-4">
                or click to browse
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                accept=".pdf,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-input">
                <Button as="span" className="cursor-pointer">
                  Select Files
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Supported: PDF, DOCX, TXT, CSV, XLSX, Images • Max 50MB per file
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {uploads.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{uploads.length}</div>
                <div className="text-sm text-gray-400">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{failedCount}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Queue */}
        {uploads.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload Queue</CardTitle>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCompleted}
                  >
                    Clear Completed
                  </Button>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploads.map((upload) => {
                  const uploadStatus = status[upload.id];
                  const progress = getProgress(upload.id);
                  const isCompleted = uploadStatus?.state === 'completed';
                  const isFailed = uploadStatus?.state === 'failed';

                  return (
                    <div
                      key={upload.id}
                      className={cn(
                        'p-4 rounded-lg border transition-all',
                        isCompleted && 'border-green-500/30 bg-green-500/5',
                        isFailed && 'border-red-500/30 bg-red-500/5',
                        !isCompleted && !isFailed && 'border-zinc-800 bg-zinc-900'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(upload.id)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-white truncate">
                              {upload.file.name}
                            </h4>
                            {!isCompleted && (
                              <button
                                onClick={() => removeFromQueue(upload.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            {getStatusText(upload.id)} • {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {!isCompleted && !isFailed && (
                            <Progress value={progress} className="h-1" />
                          )}
                          {isFailed && uploadStatus.message && (
                            <p className="text-xs text-red-400 mt-1">
                              Error: {uploadStatus.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {uploads.length === 0 && (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-400">No uploads yet</h3>
            <p className="text-gray-500">Start by dropping files or clicking "Select Files" above</p>
          </div>
        )}
      </div>
    </div>
  );
}
