export interface Document {
  id: string
  title: string
  filename: string
  content: string // Extracted text content
  fileType: string // pdf, docx, txt, etc.
  size: number // in bytes
  uploadedAt: Date
  lastModified: Date

  // AI-Generated Metadata
  summary?: string
  tags: string[]
  category?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  entities?: string[] // People, places, organizations mentioned
  keywords?: string[]

  // Storage
  url?: string
  thumbnail?: string

  // Metadata
  author?: string
  pageCount?: number
  wordCount?: number
}

export interface DocumentUploadRequest {
  file: File
  extractText?: boolean
  generateTags?: boolean
  generateSummary?: boolean
}

export interface DocumentUploadResponse {
  document: Document
  success: boolean
  error?: string
}

export interface DocumentSearchQuery {
  query: string
  tags?: string[]
  category?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface DocumentAnalysis {
  summary: string
  tags: string[]
  category: string
  sentiment: 'positive' | 'negative' | 'neutral'
  entities: string[]
  keywords: string[]
}
