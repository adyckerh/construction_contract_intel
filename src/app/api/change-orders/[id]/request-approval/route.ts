import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    // Check if change order exists
    const changeOrder = await prisma.changeOrder.findUnique({
      where: { id },
      include: { approvals: true }
    })
    
    if (!changeOrder) {
      return NextResponse.json(
        { error: 'Change order not found' },
        { status: 404 }
      )
    }
    
    // Check if approval already exists
    if (changeOrder.approvals.length > 0) {
      return NextResponse.json(
        { error: 'Approval already requested' },
        { status: 400 }
      )
    }
    
    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        changeOrderId: id,
        approverRole: 'Owner',
        status: 'PENDING'
      }
    })
    
    // Update change order status
    await prisma.changeOrder.update({
      where: { id },
      data: { status: 'UNDER_REVIEW' }
    })
    
    // Create notification
    await prisma.notification.create({
      data: {
        contractId: changeOrder.contractId,
        type: 'APPROVAL_REQUIRED',
        title: 'Approval Required',
        message: `Change order "${changeOrder.title}" requires review and approval.`,
        actionUrl: `/approvals`
      }
    })
    
    return NextResponse.json(approval)
  } catch (error) {
    console.error('Error requesting approval:', error)
    return NextResponse.json(
      { error: 'Failed to request approval' },
      { status: 500 }
    )
  }
}

