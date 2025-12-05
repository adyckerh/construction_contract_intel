import Anthropic from '@anthropic-ai/sdk'
import {
  SYSTEM_PROMPT,
  STRUCTURE_EXTRACTION_PROMPT,
  DEADLINE_EXTRACTION_PROMPT,
  PAYMENT_EXTRACTION_PROMPT,
  SCOPE_EXTRACTION_PROMPT,
  RESPONSIBILITY_EXTRACTION_PROMPT,
  SPECIFICATION_EXTRACTION_PROMPT,
  OTHER_TERMS_PROMPT,
  CHANGE_ORDER_ANALYSIS_PROMPT
} from './prompts'
import { chunkText } from './parser'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export interface ExtractedTermData {
  category: 'DEADLINE' | 'PAYMENT' | 'SCOPE' | 'RESPONSIBILITY' | 'SPECIFICATION' | 'WARRANTY' | 'INSURANCE' | 'PENALTY' | 'OTHER'
  title: string
  description: string
  value?: string
  dueDate?: string
  parties: string[]
  sourceSection?: string
  sourcePage?: number
  confidence: number
  originalText?: string
}

export interface ContractStructure {
  projectName: string | null
  owner: string | null
  contractor: string | null
  contractDate: string | null
  contractValue: number | null
  sections: {
    title: string
    pageRange: string
    summary: string
  }[]
}

export interface ChangeOrderAnalysis {
  summary: string
  affectedTerms: {
    termId: string
    termTitle: string
    changeType: 'MODIFY' | 'ADD' | 'REMOVE'
    previousValue: string
    proposedValue: string
    reason: string
  }[]
  costImpact: {
    amount: string
    direction: 'increase' | 'decrease' | 'neutral'
  }
  scheduleImpact: {
    days: string
    direction: 'extension' | 'acceleration' | 'neutral'
  }
  riskAssessment: string
  recommendations: string[]
}

async function callClaude(prompt: string, maxTokens: number = 4096): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    system: SYSTEM_PROMPT
  })

  const textContent = message.content.find(block => block.type === 'text')
  return textContent ? textContent.text : ''
}

function parseJSONResponse<T>(response: string): T | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(response)
  } catch (error) {
    console.error('Failed to parse JSON response:', error)
    console.error('Response was:', response.substring(0, 500))
    return null
  }
}

export async function extractContractStructure(text: string): Promise<ContractStructure | null> {
  // Use first ~50k chars for structure extraction
  const sampleText = text.substring(0, 50000)
  const prompt = STRUCTURE_EXTRACTION_PROMPT + sampleText
  
  const response = await callClaude(prompt)
  return parseJSONResponse<ContractStructure>(response)
}

async function extractTermsByCategory(
  text: string,
  prompt: string,
  category: ExtractedTermData['category']
): Promise<ExtractedTermData[]> {
  const chunks = chunkText(text, 80000, 2000)
  const allTerms: ExtractedTermData[] = []
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkPrompt = prompt + chunks[i]
    const response = await callClaude(chunkPrompt, 8192)
    const terms = parseJSONResponse<Array<Partial<ExtractedTermData>>>(response)
    
    if (terms && Array.isArray(terms)) {
      for (const term of terms) {
        allTerms.push({
          category: term.category || category,
          title: term.title || 'Untitled Term',
          description: term.description || '',
          value: term.value || undefined,
          dueDate: term.dueDate || undefined,
          parties: term.parties || [],
          sourceSection: term.sourceSection || undefined,
          sourcePage: term.sourcePage || undefined,
          confidence: term.confidence ?? 0.7,
          originalText: term.originalText || undefined
        })
      }
    }
  }
  
  // Deduplicate terms by title similarity
  return deduplicateTerms(allTerms)
}

function deduplicateTerms(terms: ExtractedTermData[]): ExtractedTermData[] {
  const seen = new Map<string, ExtractedTermData>()
  
  for (const term of terms) {
    const normalizedTitle = term.title.toLowerCase().trim()
    const existing = seen.get(normalizedTitle)
    
    if (!existing || term.confidence > existing.confidence) {
      seen.set(normalizedTitle, term)
    }
  }
  
  return Array.from(seen.values())
}

export async function extractAllTerms(text: string): Promise<{
  structure: ContractStructure | null
  terms: ExtractedTermData[]
}> {
  // Step 1: Extract structure
  console.log('Extracting contract structure...')
  const structure = await extractContractStructure(text)
  
  // Step 2: Extract terms by category in parallel
  console.log('Extracting terms by category...')
  const [deadlines, payments, scope, responsibilities, specifications, otherTerms] = await Promise.all([
    extractTermsByCategory(text, DEADLINE_EXTRACTION_PROMPT, 'DEADLINE'),
    extractTermsByCategory(text, PAYMENT_EXTRACTION_PROMPT, 'PAYMENT'),
    extractTermsByCategory(text, SCOPE_EXTRACTION_PROMPT, 'SCOPE'),
    extractTermsByCategory(text, RESPONSIBILITY_EXTRACTION_PROMPT, 'RESPONSIBILITY'),
    extractTermsByCategory(text, SPECIFICATION_EXTRACTION_PROMPT, 'SPECIFICATION'),
    extractTermsByCategory(text, OTHER_TERMS_PROMPT, 'OTHER')
  ])
  
  const allTerms = [
    ...deadlines,
    ...payments,
    ...scope,
    ...responsibilities,
    ...specifications,
    ...otherTerms
  ]
  
  console.log(`Extracted ${allTerms.length} terms total`)
  
  return {
    structure,
    terms: allTerms
  }
}

export async function analyzeChangeOrder(
  changeOrderText: string,
  existingTerms: Array<{ id: string; title: string; description: string; value?: string }>
): Promise<ChangeOrderAnalysis | null> {
  const termsJson = JSON.stringify(existingTerms.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    currentValue: t.value
  })), null, 2)
  
  const prompt = CHANGE_ORDER_ANALYSIS_PROMPT
    .replace('{existingTerms}', termsJson)
    .replace('{changeOrderText}', changeOrderText)
  
  const response = await callClaude(prompt, 8192)
  return parseJSONResponse<ChangeOrderAnalysis>(response)
}

// Validate extraction results
export function validateExtraction(terms: ExtractedTermData[]): {
  valid: ExtractedTermData[]
  warnings: string[]
} {
  const valid: ExtractedTermData[] = []
  const warnings: string[] = []
  
  for (const term of terms) {
    if (!term.title || term.title.length < 3) {
      warnings.push(`Skipped term with invalid title: "${term.title}"`)
      continue
    }
    
    if (!term.description || term.description.length < 10) {
      warnings.push(`Term "${term.title}" has very short description`)
    }
    
    if (term.confidence < 0.5) {
      warnings.push(`Term "${term.title}" has low confidence (${term.confidence})`)
    }
    
    valid.push(term)
  }
  
  return { valid, warnings }
}

