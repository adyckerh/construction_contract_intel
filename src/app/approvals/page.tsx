"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  CheckSquare,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react"
import { formatDate, getStatusColor, getCategoryIcon } from "@/lib/utils"

interface Approval {
  id: string
  approverRole: string
  approverName: string | null
  status: string
  comments: string | null
  decidedAt: string | null
  changeOrder: {
    id: string
    title: string
    description: string | null
    submittedBy: string
    createdAt: string
    contract: {
      id: string
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
  }
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null)
  const [approverName, setApproverName] = useState("")
  const [comments, setComments] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchApprovals = () => {
    fetch("/api/approvals")
      .then(res => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          return []
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setApprovals(data)
      })
      .catch(() => setApprovals([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING')
  const completedApprovals = approvals.filter(a => a.status !== 'PENDING')

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedApproval) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/approvals/${selectedApproval.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          approverName,
          comments
        })
      })
      
      if (!response.ok) throw new Error('Failed to update approval')
      
      // Refresh data
      fetchApprovals()
      setSelectedApproval(null)
      setDialogAction(null)
      setApproverName("")
      setComments("")
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const openDialog = (approval: Approval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setDialogAction(action)
    setComments("")
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Approvals" 
        description="Review and approve change orders"
      />

      <div className="p-6 space-y-8">
        {/* Pending Approvals */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Approvals ({pendingApprovals.length})
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingApprovals.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckSquare className="h-12 w-12 text-emerald-500/30 mb-3" />
                <p className="text-muted-foreground">No pending approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map(approval => (
                <Card key={approval.id} className="glass-panel border-amber-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{approval.changeOrder.title}</h3>
                          <Badge className={getStatusColor('PENDING')}>Pending Review</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          {approval.changeOrder.contract.projectName || approval.changeOrder.contract.name}
                        </p>
                        
                        {approval.changeOrder.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {approval.changeOrder.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {approval.changeOrder.submittedBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(approval.changeOrder.createdAt)}
                          </div>
                        </div>
                        
                        {/* Affected Terms Preview */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {approval.changeOrder.termChanges.slice(0, 4).map(tc => (
                            <Badge key={tc.id} variant="secondary" className="gap-1">
                              {getCategoryIcon(tc.term.category)}
                              {tc.term.title}
                            </Badge>
                          ))}
                          {approval.changeOrder.termChanges.length > 4 && (
                            <Badge variant="secondary">
                              +{approval.changeOrder.termChanges.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <Button 
                        onClick={() => openDialog(approval, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => openDialog(approval, 'reject')}
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Link href={`/change-orders/${approval.changeOrder.id}`} className="ml-auto">
                        <Button variant="ghost">
                          <FileText className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed Approvals */}
        {completedApprovals.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
              Completed ({completedApprovals.length})
            </h2>
            
            <div className="space-y-3">
              {completedApprovals.map(approval => (
                <Card key={approval.id} className="term-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          approval.status === 'APPROVED' 
                            ? 'bg-emerald-500/10' 
                            : 'bg-red-500/10'
                        }`}>
                          {approval.status === 'APPROVED' ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{approval.changeOrder.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {approval.approverName || approval.approverRole} • {formatDate(approval.decidedAt || approval.changeOrder.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(approval.status)}>
                        {approval.status}
                      </Badge>
                    </div>
                    {approval.comments && (
                      <p className="mt-3 text-sm text-muted-foreground pl-14">
                        &ldquo;{approval.comments}&rdquo;
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approve Change Order' : 'Reject Change Order'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve' 
                ? 'This will apply all proposed changes to the contract terms.'
                : 'The change order will be rejected and no changes will be made.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name</label>
              <Input
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Comments {dialogAction === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={dialogAction === 'reject' ? "Please provide a reason for rejection..." : "Optional comments..."}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleAction(dialogAction === 'approve' ? 'APPROVED' : 'REJECTED')}
              disabled={submitting || (dialogAction === 'reject' && !comments)}
              className={dialogAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : dialogAction === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Approval
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

