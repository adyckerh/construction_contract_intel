import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  try {
    const terms = await prisma.extractedTerm.findMany({
      where: {
        contractId: id,
        ...(category && { category: category as never })
      },
      orderBy: [
        { category: 'asc' },
        { confidence: 'desc' }
      ]
    })
    
    return NextResponse.json(terms)
  } catch (error) {
    console.error('Error fetching terms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch terms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    const data = await request.json()
    
    const term = await prisma.extractedTerm.create({
      data: {
        contractId: id,
        category: data.category,
        title: data.title,
        description: data.description,
        value: data.value,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        parties: data.parties || [],
        sourceSection: data.sourceSection,
        sourcePage: data.sourcePage,
        confidence: 1.0, // Manual entries have full confidence
        originalText: data.originalText
      }
    })
    
    return NextResponse.json(term)
  } catch (error) {
    console.error('Error creating term:', error)
    return NextResponse.json(
      { error: 'Failed to create term' },
      { status: 500 }
    )
  }
}

