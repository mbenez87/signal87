import { Document, DocumentAnalysis, DocumentUploadRequest, DocumentSearchQuery } from '../types/document'
import { documentParser } from './documentParser'
import { llmService } from './llm'

class DocumentService {
  private documents: Map<string, Document> = new Map()

  async uploadDocument(request: DocumentUploadRequest): Promise<Document> {
    const { file } = request

    // Extract text from document
    const content = await documentParser.extractText(file)
    const wordCount = documentParser.countWords(content)

    // Create base document
    const document: Document = {
      id: this.generateId(),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      filename: file.name,
      content,
      fileType: file.type || 'unknown',
      size: file.size,
      uploadedAt: new Date(),
      lastModified: new Date(file.lastModified),
      tags: [],
      wordCount,
    }

    // Generate AI analysis
    if (request.generateTags || request.generateSummary) {
      const analysis = await this.analyzeDocument(document)
      document.summary = analysis.summary
      document.tags = analysis.tags
      document.category = analysis.category
      document.sentiment = analysis.sentiment
      document.entities = analysis.entities
      document.keywords = analysis.keywords
    }

    // Store document
    this.documents.set(document.id, document)

    return document
  }

  async analyzeDocument(document: Document): Promise<DocumentAnalysis> {
    const prompt = `Analyze the following document and provide:
1. A concise summary (2-3 sentences)
2. 5-10 relevant tags/topics
3. The main category (choose one: Financial, Legal, HR, Technical, Marketing, Operations, Compliance, or Other)
4. Overall sentiment (positive, negative, or neutral)
5. Key entities mentioned (people, organizations, locations)
6. 5-10 important keywords

Document Title: ${document.title}
Document Content:
${document.content.slice(0, 4000)} ${document.content.length > 4000 ? '...(truncated)' : ''}

Respond in JSON format:
{
  "summary": "...",
  "tags": ["tag1", "tag2", ...],
  "category": "...",
  "sentiment": "positive|negative|neutral",
  "entities": ["entity1", "entity2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}`

    try {
      const response = await llmService.chat({
        messages: [
          {
            role: 'system',
            content: 'You are a document analysis AI. Analyze documents and extract metadata, tags, and insights. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
      })

      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return {
          summary: analysis.summary || 'No summary available',
          tags: analysis.tags || [],
          category: analysis.category || 'Other',
          sentiment: analysis.sentiment || 'neutral',
          entities: analysis.entities || [],
          keywords: analysis.keywords || [],
        }
      }

      // Fallback if JSON parsing fails
      return this.generateBasicAnalysis(document)
    } catch (error) {
      console.error('Error analyzing document:', error)
      return this.generateBasicAnalysis(document)
    }
  }

  private generateBasicAnalysis(document: Document): DocumentAnalysis {
    // Fallback analysis without AI
    const words = document.content.toLowerCase().split(/\s+/)
    const uniqueWords = [...new Set(words)].filter(w => w.length > 4)

    return {
      summary: `Document "${document.title}" containing ${document.wordCount} words.`,
      tags: uniqueWords.slice(0, 5),
      category: 'Other',
      sentiment: 'neutral',
      entities: [],
      keywords: uniqueWords.slice(0, 5),
    }
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    )
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id)
  }

  deleteDocument(id: string): boolean {
    return this.documents.delete(id)
  }

  searchDocuments(query: DocumentSearchQuery): Document[] {
    let results = this.getAllDocuments()

    // Filter by text query
    if (query.query) {
      const searchTerm = query.query.toLowerCase()
      results = results.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        doc.summary?.toLowerCase().includes(searchTerm)
      )
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(doc =>
        query.tags!.some(tag => doc.tags.includes(tag))
      )
    }

    // Filter by category
    if (query.category) {
      results = results.filter(doc => doc.category === query.category)
    }

    // Filter by date range
    if (query.dateFrom) {
      results = results.filter(doc => doc.uploadedAt >= query.dateFrom!)
    }
    if (query.dateTo) {
      results = results.filter(doc => doc.uploadedAt <= query.dateTo!)
    }

    return results
  }

  async getDocumentContext(documentIds: string[]): Promise<string> {
    const documents = documentIds
      .map(id => this.getDocument(id))
      .filter((doc): doc is Document => doc !== undefined)

    if (documents.length === 0) {
      return ''
    }

    return documents
      .map(doc => {
        return `Document: ${doc.title}
Category: ${doc.category || 'N/A'}
Tags: ${doc.tags.join(', ')}
Summary: ${doc.summary || 'No summary'}
Content Preview: ${doc.content.slice(0, 500)}...
---`
      })
      .join('\n\n')
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get all unique tags across all documents
  getAllTags(): string[] {
    const tags = new Set<string>()
    this.documents.forEach(doc => {
      doc.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  // Get all unique categories
  getAllCategories(): string[] {
    const categories = new Set<string>()
    this.documents.forEach(doc => {
      if (doc.category) categories.add(doc.category)
    })
    return Array.from(categories).sort()
  }
}

export const documentService = new DocumentService()
