import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        terms: {
          orderBy: [
            { category: 'asc' },
            { confidence: 'desc' }
          ]
        },
        changeOrders: {
          include: {
            termChanges: true,
            approvals: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    await prisma.contract.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    const data = await request.json()
    
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        name: data.name,
        projectName: data.projectName,
        owner: data.owner,
        contractor: data.contractor
      }
    })
    
    return NextResponse.json(contract)
  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    )
  }
}

