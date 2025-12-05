import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    const changeOrder = await prisma.changeOrder.findUnique({
      where: { id },
      include: {
        contract: {
          select: {
            id: true,
            name: true,
            projectName: true
          }
        },
        termChanges: {
          include: {
            term: true
          }
        },
        approvals: true
      }
    })
    
    if (!changeOrder) {
      return NextResponse.json(
        { error: 'Change order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(changeOrder)
  } catch (error) {
    console.error('Error fetching change order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch change order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    const data = await request.json()
    
    const changeOrder = await prisma.changeOrder.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status
      }
    })
    
    return NextResponse.json(changeOrder)
  } catch (error) {
    console.error('Error updating change order:', error)
    return NextResponse.json(
      { error: 'Failed to update change order' },
      { status: 500 }
    )
  }
}

