import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        contract: {
          select: {
            name: true,
            projectName: true
          }
        }
      }
    })
    
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    // Return empty array on database error for graceful degradation
    return NextResponse.json([])
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { ids } = await request.json()
    
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

