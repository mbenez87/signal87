export class DocumentParser {
  async extractText(file: File): Promise<string> {
    const fileType = file.type

    try {
      if (fileType === 'text/plain' || fileType === 'text/markdown') {
        return await this.parseTextFile(file)
      } else if (fileType === 'application/pdf') {
        return await this.parsePDFFile(file)
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword'
      ) {
        return await this.parseWordFile(file)
      } else if (fileType.startsWith('text/')) {
        return await this.parseTextFile(file)
      } else {
        // For unsupported types, return filename and basic info
        return `[Uploaded file: ${file.name}]\nFile type: ${fileType}\nSize: ${this.formatFileSize(file.size)}`
      }
    } catch (error) {
      console.error('Error parsing document:', error)
      return `[Could not extract text from ${file.name}]`
    }
  }

  private async parseTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  private async parsePDFFile(file: File): Promise<string> {
    // For PDF parsing, we'd normally use a library like pdf.js
    // For now, we'll return a placeholder that indicates PDF upload
    return `[PDF Document: ${file.name}]\n\nThis is a PDF file. Full text extraction requires pdf.js library integration.\n\nIn production, this would contain the extracted text from all pages of the PDF.`
  }

  private async parseWordFile(file: File): Promise<string> {
    // For Word document parsing, we'd use a library like mammoth.js
    return `[Word Document: ${file.name}]\n\nThis is a Word document. Full text extraction requires mammoth.js library integration.\n\nIn production, this would contain the extracted text from the Word document.`
  }

  countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
}

export const documentParser = new DocumentParser()
