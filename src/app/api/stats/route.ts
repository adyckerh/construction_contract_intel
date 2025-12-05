import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addDays, startOfDay } from 'date-fns'

export async function GET() {
  try {
    // Get all data in one try block for database connection handling
    const results = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'EXTRACTED' } }),
      prisma.approval.count({ where: { status: 'PENDING' } }),
      prisma.extractedTerm.count({ where: { isActive: true } }),
      prisma.extractedTerm.findMany({
        where: {
          isActive: true,
          dueDate: {
            gte: startOfDay(new Date()),
            lte: addDays(new Date(), 30)
          }
        },
        include: {
          contract: {
            select: { name: true, projectName: true }
          }
        },
        orderBy: { dueDate: 'asc' },
        take: 10
      }),
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          contract: {
            select: { name: true }
          }
        }
      }),
      prisma.extractedTerm.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { id: true }
      }),
      prisma.changeOrder.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.contract.findMany({
        where: { totalValue: { not: null } },
        select: { totalValue: true }
      })
    ])
    
    const [
      totalContracts,
      activeContracts,
      pendingApprovals,
      totalTerms,
      upcomingDeadlines,
      recentActivity,
      termsByCategoryResult,
      changeOrderStatsResult,
      contractsWithValue
    ] = results
    
    const totalValue = contractsWithValue.reduce((sum, c) => sum + (c.totalValue || 0), 0)
    
    return NextResponse.json({
      overview: {
        totalContracts,
        activeContracts,
        pendingApprovals,
        totalTerms,
        totalValue
      },
      termsByCategory: termsByCategoryResult.reduce((acc, item) => {
        acc[item.category] = item._count.id
        return acc
      }, {} as Record<string, number>),
      changeOrderStats: changeOrderStatsResult.reduce((acc, item) => {
        acc[item.status] = item._count.id
        return acc
      }, {} as Record<string, number>),
      upcomingDeadlines,
      recentActivity
    })
  } catch (error) {
    console.error('Database error:', error)
    // Return empty data if database is not connected
    return NextResponse.json({
      overview: {
        totalContracts: 0,
        activeContracts: 0,
        pendingApprovals: 0,
        totalTerms: 0,
        totalValue: 0
      },
      termsByCategory: {},
      changeOrderStats: {},
      upcomingDeadlines: [],
      recentActivity: []
    })
  }
}
