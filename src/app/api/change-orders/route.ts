import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { parsePDF } from '@/lib/ai/parser'
import { analyzeChangeOrder } from '@/lib/ai/extractor'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contractId = searchParams.get('contractId')
  
  try {
    const changeOrders = await prisma.changeOrder.findMany({
      where: contractId ? { contractId } : undefined,
      include: {
        contract: {
          select: {
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
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(changeOrders)
  } catch (error) {
    console.error('Error fetching change orders:', error)
    // Return empty array on database error for graceful degradation
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const contractId = formData.get('contractId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const submittedBy = formData.get('submittedBy') as string
    
    if (!contractId || !title || !submittedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    let filePath: string | null = null
    let fileName: string | null = null
    let changeOrderText: string | null = null
    
    // Handle file upload if provided
    if (file) {
      const uploadDir = join(process.cwd(), 'uploads', 'change-orders')
      await mkdir(uploadDir, { recursive: true })
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      fileName = `${Date.now()}-${file.name}`
      filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      
      // Parse the change order document
      if (file.name.endsWith('.pdf')) {
        const parsed = await parsePDF(buffer)
        changeOrderText = parsed.text
      }
    }
    
    // Create change order
    const changeOrder = await prisma.changeOrder.create({
      data: {
        contractId,
        title,
        description,
        fileName,
        filePath,
        submittedBy,
        status: 'UNDER_REVIEW'
      }
    })
    
    // Always create an approval record
    await prisma.approval.create({
      data: {
        changeOrderId: changeOrder.id,
        approverRole: 'Owner',
        status: 'PENDING'
      }
    })
    
    // If we have text, analyze the change order for term impacts
    if (changeOrderText) {
      analyzeChangeOrderBackground(changeOrder.id, contractId, changeOrderText).catch(console.error)
    }
    
    // Create notification
    await prisma.notification.create({
      data: {
        contractId,
        type: 'CHANGE_ORDER_SUBMITTED',
        title: 'New Change Order Submitted',
        message: `Change order "${title}" has been submitted by ${submittedBy}.`,
        actionUrl: `/change-orders/${changeOrder.id}`
      }
    })
    
    // Create notification for approval required
    await prisma.notification.create({
      data: {
        contractId,
        type: 'APPROVAL_REQUIRED',
        title: 'Approval Required',
        message: `Change order "${title}" requires review and approval.`,
        actionUrl: `/approvals`
      }
    })
    
    return NextResponse.json(changeOrder)
  } catch (error) {
    console.error('Error creating change order:', error)
    return NextResponse.json(
      { error: 'Failed to create change order' },
      { status: 500 }
    )
  }
}

async function analyzeChangeOrderBackground(
  changeOrderId: string,
  contractId: string,
  changeOrderText: string
) {
  try {
    // Get existing terms
    const terms = await prisma.extractedTerm.findMany({
      where: { contractId, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        value: true
      }
    })
    
    // Analyze with AI
    const analysis = await analyzeChangeOrder(changeOrderText, terms)
    
    if (!analysis) {
      console.error('Failed to analyze change order')
      return
    }
    
    // Update change order with impact summary
    await prisma.changeOrder.update({
      where: { id: changeOrderId },
      data: {
        impactSummary: analysis.summary,
        status: 'UNDER_REVIEW'
      }
    })
    
    // Create term change records
    for (const affected of analysis.affectedTerms) {
      const term = terms.find(t => t.id === affected.termId || t.title === affected.termTitle)
      
      if (term) {
        await prisma.termChange.create({
          data: {
            changeOrderId,
            termId: term.id,
            changeType: affected.changeType,
            previousValue: affected.previousValue,
            proposedValue: affected.proposedValue,
            reason: affected.reason,
            status: 'PENDING'
          }
        })
      }
    }
    
    // Update notification with term impact info
    if (analysis.affectedTerms.length > 0) {
      await prisma.notification.create({
        data: {
          contractId,
          type: 'TERMS_AFFECTED',
          title: 'Terms Affected by Change Order',
          message: `Analysis complete: ${analysis.affectedTerms.length} terms are affected by this change order.`,
          actionUrl: `/change-orders/${changeOrderId}`
        }
      })
    }
  } catch (error) {
    console.error('Error analyzing change order:', error)
  }
}

