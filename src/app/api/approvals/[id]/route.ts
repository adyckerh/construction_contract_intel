import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const { id } = await context.params
  
  try {
    const data = await request.json()
    const { status, comments, approverName } = data
    
    // Update approval
    const approval = await prisma.approval.update({
      where: { id },
      data: {
        status,
        comments,
        approverName,
        decidedAt: new Date()
      },
      include: {
        changeOrder: {
          include: {
            contract: true,
            termChanges: {
              include: { term: true }
            }
          }
        }
      }
    })
    
    // If approved, apply the changes
    if (status === 'APPROVED') {
      // Update all term changes to approved
      await prisma.termChange.updateMany({
        where: { changeOrderId: approval.changeOrderId },
        data: { status: 'APPROVED' }
      })
      
      // Apply changes to terms
      for (const termChange of approval.changeOrder.termChanges) {
        if (termChange.changeType === 'MODIFY' && termChange.proposedValue) {
          await prisma.extractedTerm.update({
            where: { id: termChange.termId },
            data: {
              value: termChange.proposedValue,
              description: termChange.proposedValue
            }
          })
        } else if (termChange.changeType === 'REMOVE') {
          await prisma.extractedTerm.update({
            where: { id: termChange.termId },
            data: { isActive: false }
          })
        }
      }
      
      // Update change order status
      await prisma.changeOrder.update({
        where: { id: approval.changeOrderId },
        data: { status: 'IMPLEMENTED' }
      })
      
      // Create notification
      await prisma.notification.create({
        data: {
          contractId: approval.changeOrder.contractId,
          type: 'APPROVAL_DECISION',
          title: 'Change Order Approved',
          message: `Change order "${approval.changeOrder.title}" has been approved and implemented.`,
          actionUrl: `/change-orders/${approval.changeOrderId}`
        }
      })
    } else if (status === 'REJECTED') {
      // Update term changes to rejected
      await prisma.termChange.updateMany({
        where: { changeOrderId: approval.changeOrderId },
        data: { status: 'REJECTED' }
      })
      
      // Update change order status
      await prisma.changeOrder.update({
        where: { id: approval.changeOrderId },
        data: { status: 'REJECTED' }
      })
      
      // Create notification
      await prisma.notification.create({
        data: {
          contractId: approval.changeOrder.contractId,
          type: 'APPROVAL_DECISION',
          title: 'Change Order Rejected',
          message: `Change order "${approval.changeOrder.title}" has been rejected.${comments ? ` Reason: ${comments}` : ''}`,
          actionUrl: `/change-orders/${approval.changeOrderId}`
        }
      })
    }
    
    return NextResponse.json(approval)
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    )
  }
}

