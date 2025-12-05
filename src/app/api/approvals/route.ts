import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  try {
    const approvals = await prisma.approval.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        changeOrder: {
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
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Error fetching approvals:', error)
    // Return empty array on database error for graceful degradation
    return NextResponse.json([])
  }
}

