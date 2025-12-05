"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  GitBranch, 
  FileText,
  User,
  Calendar,
  ArrowRight
} from "lucide-react"
import { formatDate, getStatusColor } from "@/lib/utils"

interface ChangeOrder {
  id: string
  title: string
  description: string | null
  status: string
  submittedBy: string
  impactSummary: string | null
  createdAt: string
  contract: {
    name: string
    projectName: string | null
  }
  termChanges: Array<{
    id: string
    changeType: string
    term: {
      title: string
      category: string
    }
  }>
  approvals: Array<{
    id: string
    status: string
    approverRole: string
  }>
}

export default function ChangeOrdersPage() {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/change-orders")
      .then(res => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          return []
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setChangeOrders(data)
      })
      .catch(() => setChangeOrders([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <Header 
        title="Change Orders" 
        description="Track and manage contract modifications"
        actions={
          <Link href="/change-orders/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Change Order
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : changeOrders.length === 0 ? (
          <Card className="glass-panel">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <GitBranch className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No change orders yet</h3>
              <p className="text-muted-foreground mb-6">
                Submit a change order when modifications are needed
              </p>
              <Link href="/change-orders/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  New Change Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {changeOrders.map(co => (
              <Link key={co.id} href={`/change-orders/${co.id}`}>
                <Card className="term-card hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <GitBranch className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{co.title}</h3>
                            <Badge className={getStatusColor(co.status)}>{co.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {co.contract.projectName || co.contract.name}
                          </p>
                          
                          {co.impactSummary && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {co.impactSummary}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {co.submittedBy}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(co.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {co.termChanges.length} terms affected
                            </div>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

