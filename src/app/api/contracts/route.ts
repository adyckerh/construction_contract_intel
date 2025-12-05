import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { parsePDF } from '@/lib/ai/parser'
import { extractAllTerms, validateExtraction } from '@/lib/ai/extractor'

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            terms: true,
            changeOrders: true
          }
        }
      }
    })
    
    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Error fetching contracts:', error)
    // Return empty array on database error for graceful degradation
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const projectName = formData.get('projectName') as string | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads')
    await mkdir(uploadDir, { recursive: true })
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    
    // Create contract record
    const contract = await prisma.contract.create({
      data: {
        name: name || file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        filePath: filePath,
        fileSize: file.size,
        projectName: projectName,
        status: 'PENDING'
      }
    })
    
    // Start extraction in background
    processContract(contract.id, buffer).catch(console.error)
    
    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error uploading contract:', error)
    return NextResponse.json(
      { error: 'Failed to upload contract' },
      { status: 500 }
    )
  }
}

async function processContract(contractId: string, buffer: Buffer) {
  try {
    // Update status to processing
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'PROCESSING' }
    })
    
    // Parse PDF
    console.log('Parsing PDF...')
    const parsed = await parsePDF(buffer)
    
    // Update with raw text
    await prisma.contract.update({
      where: { id: contractId },
      data: { rawText: parsed.text }
    })
    
    // Extract terms using AI
    console.log('Extracting terms with AI...')
    const { structure, terms } = await extractAllTerms(parsed.text)
    
    // Validate extraction
    const { valid: validTerms, warnings } = validateExtraction(terms)
    
    if (warnings.length > 0) {
      console.log('Extraction warnings:', warnings)
    }
    
    // Update contract with structure info
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        projectName: structure?.projectName || undefined,
        owner: structure?.owner || undefined,
        contractor: structure?.contractor || undefined,
        totalValue: structure?.contractValue || undefined,
        startDate: structure?.contractDate ? new Date(structure.contractDate) : undefined,
        status: 'EXTRACTED'
      }
    })
    
    // Create term records
    for (const term of validTerms) {
      // Validate date - only use if it's a valid date
      let parsedDate: Date | undefined = undefined
      if (term.dueDate) {
        const dateObj = new Date(term.dueDate)
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj
        }
      }

      await prisma.extractedTerm.create({
        data: {
          contractId,
          category: term.category,
          title: term.title,
          description: term.description,
          value: term.value,
          dueDate: parsedDate,
          parties: term.parties,
          sourceSection: term.sourceSection,
          sourcePage: term.sourcePage ? parseInt(String(term.sourcePage), 10) || null : null,
          confidence: typeof term.confidence === 'number' ? term.confidence : parseFloat(String(term.confidence)) || 0.5,
          originalText: term.originalText
        }
      })
    }
    
    // Create notification
    await prisma.notification.create({
      data: {
        contractId,
        type: 'EXTRACTION_COMPLETE',
        title: 'Contract Analysis Complete',
        message: `Successfully extracted ${validTerms.length} terms from the contract.`
      }
    })
    
    console.log(`Contract ${contractId} processed successfully`)
  } catch (error) {
    console.error(`Error processing contract ${contractId}:`, error)
    
    await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'ERROR' }
    })
  }
}

