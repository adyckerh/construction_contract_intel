"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Plus,
  Calendar
} from "lucide-react"
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils"

interface Stats {
  overview: {
    totalContracts: number
    activeContracts: number
    pendingApprovals: number
    totalTerms: number
    totalValue: number
  }
  termsByCategory: Record<string, number>
  changeOrderStats: Record<string, number>
  upcomingDeadlines: Array<{
    id: string
    title: string
    dueDate: string
    category: string
    contract: { name: string; projectName: string }
  }>
  recentActivity: Array<{
    id: string
    title: string
    message: string
    type: string
    createdAt: string
    contract: { name: string } | null
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then(res => {
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error('Not JSON response')
        }
        return res.json()
      })
      .then(data => {
        if (data && data.overview) {
          setStats(data)
        }
      })
      .catch(err => {
        console.log('Stats fetch error:', err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        description="Overview of your construction contracts"
        actions={
          <Link href="/contracts/upload">
            <Button>
              <Plus className="h-4 w-4" />
              Upload Contract
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Contracts"
            value={stats?.overview.totalContracts ?? 0}
            icon={FileText}
            loading={loading}
          />
          <StatCard
            label="Active Terms"
            value={stats?.overview.totalTerms ?? 0}
            icon={Clock}
            loading={loading}
          />
          <StatCard
            label="Pending Approvals"
            value={stats?.overview.pendingApprovals ?? 0}
            icon={AlertCircle}
            loading={loading}
          />
          <StatCard
            label="Total Value"
            value={formatCurrency(stats?.overview.totalValue ?? 0)}
            icon={DollarSign}
            loading={loading}
            isText
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Upcoming Deadlines */}
          <div className="col-span-2 bg-white border border-border rounded p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-foreground">Upcoming Deadlines</h2>
              <Link href="/contracts" className="text-sm text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-secondary rounded animate-pulse" />
                ))}
              </div>
            ) : (stats?.upcomingDeadlines?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.upcomingDeadlines.map(deadline => {
                  const days = daysUntil(deadline.dueDate)
                  return (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {deadline.contract.projectName || deadline.contract.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{formatDate(deadline.dueDate)}</p>
                        <p className={`text-xs ${days <= 7 ? "text-destructive" : "text-muted-foreground"}`}>
                          {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border rounded p-4">
            <h2 className="font-medium text-foreground mb-4">Recent Activity</h2>
            
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
                ))}
              </div>
            ) : (stats?.recentActivity?.length ?? 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentActivity.map(activity => (
                  <div key={activity.id} className="text-sm">
                    <p className="text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.contract?.name} · {formatDate(activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  loading: boolean
  isText?: boolean
}

function StatCard({ label, value, icon: Icon, loading, isText }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-secondary rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-foreground">
          {isText ? value : (value as number).toLocaleString()}
        </p>
      )}
    </div>
  )
}
