// Dynamic import to avoid pdf-parse test file bug
// @ts-expect-error - pdf-parse has an import-time side effect bug
const pdf = require('pdf-parse/lib/pdf-parse')

export interface ParsedDocument {
  text: string
  pages: PageContent[]
  metadata: {
    pageCount: number
    info: Record<string, unknown>
  }
}

export interface PageContent {
  pageNumber: number
  text: string
}

export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  const data = await pdf(buffer)
  
  // Split text by page markers if available, otherwise treat as single page
  const pages = splitTextByPages(data.text, data.numpages)
  
  return {
    text: data.text,
    pages,
    metadata: {
      pageCount: data.numpages,
      info: data.info || {}
    }
  }
}

function splitTextByPages(text: string, pageCount: number): PageContent[] {
  // Simple page splitting - in production you might use more sophisticated methods
  const avgCharsPerPage = Math.ceil(text.length / pageCount)
  const pages: PageContent[] = []
  
  // Try to split at paragraph breaks near the expected page boundaries
  let currentPosition = 0
  
  for (let i = 0; i < pageCount; i++) {
    const isLastPage = i === pageCount - 1
    let endPosition: number
    
    if (isLastPage) {
      endPosition = text.length
    } else {
      // Look for a good break point near the expected position
      const targetPosition = currentPosition + avgCharsPerPage
      endPosition = findGoodBreakPoint(text, targetPosition, avgCharsPerPage * 0.2)
    }
    
    const pageText = text.slice(currentPosition, endPosition).trim()
    
    if (pageText) {
      pages.push({
        pageNumber: i + 1,
        text: pageText
      })
    }
    
    currentPosition = endPosition
  }
  
  return pages
}

function findGoodBreakPoint(text: string, targetPosition: number, searchRange: number): number {
  const startSearch = Math.max(0, Math.floor(targetPosition - searchRange))
  const endSearch = Math.min(text.length, Math.ceil(targetPosition + searchRange))
  
  // Look for double newline (paragraph break)
  const searchArea = text.slice(startSearch, endSearch)
  const paragraphBreak = searchArea.lastIndexOf('\n\n')
  
  if (paragraphBreak !== -1) {
    return startSearch + paragraphBreak + 2
  }
  
  // Fall back to single newline
  const lineBreak = searchArea.lastIndexOf('\n')
  if (lineBreak !== -1) {
    return startSearch + lineBreak + 1
  }
  
  // Fall back to space
  const space = searchArea.lastIndexOf(' ')
  if (space !== -1) {
    return startSearch + space + 1
  }
  
  // Just use the target position
  return Math.min(targetPosition, text.length)
}

export function chunkText(text: string, maxChunkSize: number = 50000, overlap: number = 1000): string[] {
  const chunks: string[] = []
  let currentPosition = 0
  
  while (currentPosition < text.length) {
    let endPosition = Math.min(currentPosition + maxChunkSize, text.length)
    
    // Find a good break point if not at the end
    if (endPosition < text.length) {
      endPosition = findGoodBreakPoint(text, endPosition, 500)
    }
    
    chunks.push(text.slice(currentPosition, endPosition))
    
    // Move position with overlap for context continuity
    currentPosition = endPosition - overlap
    if (currentPosition >= text.length - overlap) {
      break
    }
  }
  
  return chunks
}

export function extractSections(text: string): { title: string; content: string; startIndex: number }[] {
  // Common construction contract section patterns
  const sectionPatterns = [
    /^(?:ARTICLE|SECTION|PART)\s+(\d+(?:\.\d+)*)\s*[-:.]?\s*(.+?)$/gim,
    /^(\d+(?:\.\d+)*)\s*[-:.]?\s*([A-Z][A-Z\s]+)$/gm,
    /^([A-Z][A-Z\s]{3,})$/gm,
  ]
  
  const sections: { title: string; content: string; startIndex: number }[] = []
  const matches: { index: number; title: string }[] = []
  
  // Find all section headers
  for (const pattern of sectionPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        title: match[0].trim()
      })
    }
  }
  
  // Sort by position
  matches.sort((a, b) => a.index - b.index)
  
  // Remove duplicates (within 50 chars of each other)
  const uniqueMatches = matches.filter((match, index) => {
    if (index === 0) return true
    return match.index - matches[index - 1].index > 50
  })
  
  // Extract content between sections
  for (let i = 0; i < uniqueMatches.length; i++) {
    const current = uniqueMatches[i]
    const next = uniqueMatches[i + 1]
    
    const contentStart = current.index + current.title.length
    const contentEnd = next ? next.index : text.length
    
    sections.push({
      title: current.title,
      content: text.slice(contentStart, contentEnd).trim(),
      startIndex: current.index
    })
  }
  
  return sections
}

