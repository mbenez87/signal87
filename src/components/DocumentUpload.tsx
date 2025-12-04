import { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { documentService } from '../services/documentService'
import { Document } from '../types/document'

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void
  onClose?: () => void
}

export default function DocumentUpload({ onUploadComplete, onClose }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadStatus('idle')
    setError('')

    try {
      const document = await documentService.uploadDocument({
        file,
        extractText: true,
        generateTags: true,
        generateSummary: true,
      })

      setUploadedDoc(document)
      setUploadStatus('success')

      if (onUploadComplete) {
        onUploadComplete(document)
      }
    } catch (err) {
      setUploadStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Document</h2>
            <p className="text-sm text-gray-400 mt-1">
              AI will automatically analyze and tag your document
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 hover:bg-zinc-800 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Upload Area */}
        <div className="p-6">
          {uploadStatus === 'idle' && !isUploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClickUpload}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
                }
              `}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Drop your document here
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-500">
                Supports: PDF, DOCX, TXT, and more
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
            </div>
          )}

          {isUploading && (
            <div className="border-2 border-zinc-700 rounded-xl p-12 text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Processing Document...
              </h3>
              <p className="text-sm text-gray-400">
                AI is analyzing and tagging your document
              </p>
            </div>
          )}

          {uploadStatus === 'success' && uploadedDoc && (
            <div className="border-2 border-green-500/50 bg-green-500/10 rounded-xl p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2 text-center">
                Upload Successful!
              </h3>

              <div className="mt-6 space-y-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{uploadedDoc.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{uploadedDoc.filename}</p>
                    </div>
                  </div>
                </div>

                {uploadedDoc.summary && (
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">AI Summary</h5>
                    <p className="text-sm text-white">{uploadedDoc.summary}</p>
                  </div>
                )}

                {uploadedDoc.tags.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">AI Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {uploadedDoc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedDoc.category && (
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-400 mb-2">Category</h5>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                      {uploadedDoc.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setUploadStatus('idle')
                    setUploadedDoc(null)
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Upload Another
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="border-2 border-red-500/50 bg-red-500/10 rounded-xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Upload Failed
              </h3>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => {
                  setUploadStatus('idle')
                  setError('')
                }}
                className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
