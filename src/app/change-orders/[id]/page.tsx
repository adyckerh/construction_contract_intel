"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft,
  GitBranch,
  User,
  Calendar,
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Send
} from "lucide-react"
import { formatDate, getStatusColor, getCategoryIcon, getCategoryColor } from "@/lib/utils"

interface TermChange {
  id: string
  changeType: string
  previousValue: string | null
  proposedValue: string | null
  reason: string | null
  status: string
  term: {
    id: string
    title: string
    category: string
    description: string
  }
}

interface Approval {
  id: string
  approverRole: string
  approverName: string | null
  status: string
  comments: string | null
  decidedAt: string | null
}

interface ChangeOrder {
  id: string
  title: string
  description: string | null
  status: string
  submittedBy: string
  impactSummary: string | null
  fileName: string | null
  createdAt: string
  contract: {
    id: string
    name: string
    projectName: string | null
  }
  termChanges: TermChange[]
  approvals: Approval[]
}

export default function ChangeOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [changeOrder, setChangeOrder] = useState<ChangeOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestingApproval, setRequestingApproval] = useState(false)

  const fetchChangeOrder = async () => {
    try {
      const res = await fetch(`/api/change-orders/${id}`)
      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
        return null
      }
      const data = await res.json()
      if (data) setChangeOrder(data)
      return data
    } catch {
      setChangeOrder(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChangeOrder()
  }, [id])

  const requestApproval = async () => {
    if (!changeOrder) return
    setRequestingApproval(true)
    try {
      const res = await fetch(`/api/change-orders/${id}/request-approval`, {
        method: 'POST'
      })
      if (res.ok) {
        await fetchChangeOrder()
      }
    } catch (error) {
      console.error('Failed to request approval:', error)
    } finally {
      setRequestingApproval(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!changeOrder) {
    return (
      <div className="min-h-screen">
        <Header title="Not Found" />
        <div className="p-6">
          <Card className="glass-panel">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Change order not found</h3>
              <Link href="/change-orders">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Change Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        title={changeOrder.title}
        description={changeOrder.contract.projectName || changeOrder.contract.name}
        actions={
          <Badge className={`${getStatusColor(changeOrder.status)} text-sm px-3 py-1`}>
            {changeOrder.status}
          </Badge>
        }
      />

      <div className="p-6 space-y-6">
        {/* Back Link */}
        <Link href="/change-orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Change Orders
        </Link>

        {/* Overview */}
        <Card className="glass-panel">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{changeOrder.submittedBy}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted On</p>
                  <p className="font-medium">{formatDate(changeOrder.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Affected Terms</p>
                  <p className="font-medium">{changeOrder.termChanges.length}</p>
                </div>
              </div>
            </div>

            {changeOrder.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{changeOrder.description}</p>
              </div>
            )}

            {changeOrder.impactSummary && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium mb-2">AI Impact Analysis</h4>
                <p className="text-muted-foreground">{changeOrder.impactSummary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Status */}
        {changeOrder.approvals.length === 0 ? (
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500/50 mb-3" />
                <p className="text-muted-foreground mb-4">No approval has been requested yet</p>
                <Button onClick={requestApproval} disabled={requestingApproval}>
                  {requestingApproval ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Request Approval
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeOrder.approvals.map(approval => (
                  <div 
                    key={approval.id}
                    className={`p-4 rounded-lg border ${
                      approval.status === 'APPROVED' 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : approval.status === 'REJECTED'
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-secondary/50 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          approval.status === 'APPROVED' 
                            ? 'bg-emerald-500/10' 
                            : approval.status === 'REJECTED'
                              ? 'bg-red-500/10'
                              : 'bg-secondary'
                        }`}>
                          {approval.status === 'APPROVED' ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : approval.status === 'REJECTED' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{approval.approverRole}</p>
                          {approval.approverName && (
                            <p className="text-sm text-muted-foreground">{approval.approverName}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(approval.status)}>
                          {approval.status}
                        </Badge>
                        {approval.decidedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(approval.decidedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    {approval.comments && (
                      <p className="mt-3 text-sm text-muted-foreground pl-13">
                        {approval.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affected Terms */}
        {changeOrder.termChanges.length > 0 && (
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Affected Contract Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeOrder.termChanges.map(tc => (
                  <div key={tc.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{getCategoryIcon(tc.term.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{tc.term.title}</h4>
                          <Badge className={getCategoryColor(tc.term.category)}>
                            {tc.term.category}
                          </Badge>
                          <Badge variant={tc.changeType === 'ADD' ? 'success' : tc.changeType === 'REMOVE' ? 'destructive' : 'warning'}>
                            {tc.changeType}
                          </Badge>
                        </div>
                        
                        {tc.reason && (
                          <p className="text-sm text-muted-foreground mb-3">{tc.reason}</p>
                        )}
                        
                        {(tc.previousValue || tc.proposedValue) && (
                          <div className="flex items-center gap-4 text-sm">
                            {tc.previousValue && (
                              <div className="flex-1 p-3 rounded bg-red-500/5 border border-red-500/20">
                                <p className="text-xs text-muted-foreground mb-1">Previous</p>
                                <p className="text-red-400">{tc.previousValue}</p>
                              </div>
                            )}
                            {tc.previousValue && tc.proposedValue && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            {tc.proposedValue && (
                              <div className="flex-1 p-3 rounded bg-emerald-500/5 border border-emerald-500/20">
                                <p className="text-xs text-muted-foreground mb-1">Proposed</p>
                                <p className="text-emerald-400">{tc.proposedValue}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Link to Contract */}
        <Link href={`/contracts/${changeOrder.contract.id}`}>
          <Card className="term-card hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-primary" />
                <span>View Parent Contract</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

