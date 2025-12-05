"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  MoreVertical
} from "lucide-react"
import { formatCurrency, formatDate, formatFileSize, getStatusColor } from "@/lib/utils"

interface Contract {
  id: string
  name: string
  fileName: string
  fileSize: number
  status: string
  projectName: string | null
  owner: string | null
  contractor: string | null
  totalValue: number | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  _count: {
    terms: number
    changeOrders: number
  }
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchContracts = () => {
    fetch("/api/contracts")
      .then(res => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          return []
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setContracts(data)
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/contracts/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setContracts(contracts.filter(c => c.id !== deleteTarget.id))
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeleting(false)
    }
  }

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(search.toLowerCase()) ||
    contract.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    contract.contractor?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EXTRACTED":
        return <CheckCircle className="h-4 w-4" />
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "ERROR":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Contracts" 
        description="Manage and analyze your construction contracts"
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
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts by name, project, or contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>

        {/* Contracts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredContracts.length === 0 ? (
          <Card className="glass-panel">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No contracts found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? "Try adjusting your search terms" : "Upload your first contract to get started"}
              </p>
              {!search && (
                <Link href="/contracts/upload">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Upload Contract
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map(contract => (
              <Card key={contract.id} className="h-full term-card hover:shadow-lg transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/contracts/${contract.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold line-clamp-1">{contract.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(contract.fileSize)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={getStatusColor(contract.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(contract.status)}
                          {contract.status}
                        </span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteTarget(contract)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Link href={`/contracts/${contract.id}`} className="block">
                    <div className="space-y-3">
                      {contract.projectName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{contract.projectName}</span>
                        </div>
                      )}
                      
                      {contract.totalValue && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(contract.totalValue)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Uploaded {formatDate(contract.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{contract._count.terms} terms</span>
                        <span>{contract._count.changeOrders} changes</span>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This will also delete all extracted terms, change orders, and approvals associated with this contract. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Contract
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

