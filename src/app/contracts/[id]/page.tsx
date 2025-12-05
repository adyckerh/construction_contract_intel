"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  ArrowLeft,
  Building2,
  User,
  DollarSign,
  Calendar,
  FileText,
  Search,
  GitBranch,
  Plus,
  ChevronDown,
  ChevronUp,
  Quote,
  MapPin,
  AlertCircle,
  Trash2,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  formatCurrency, 
  formatDate, 
  getCategoryColor, 
  getCategoryIcon, 
  getStatusColor,
  getConfidenceColor,
  truncateText
} from "@/lib/utils"

interface Term {
  id: string
  category: string
  title: string
  description: string
  value: string | null
  dueDate: string | null
  parties: string[]
  sourceSection: string | null
  sourcePage: number | null
  confidence: number
  originalText: string | null
  isActive: boolean
}

interface ChangeOrder {
  id: string
  title: string
  status: string
  submittedBy: string
  createdAt: string
}

interface Contract {
  id: string
  name: string
  fileName: string
  status: string
  projectName: string | null
  owner: string | null
  contractor: string | null
  totalValue: number | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  terms: Term[]
  changeOrders: ChangeOrder[]
}

const CATEGORIES = [
  { value: "all", label: "All Terms" },
  { value: "DEADLINE", label: "Deadlines" },
  { value: "PAYMENT", label: "Payments" },
  { value: "SCOPE", label: "Scope" },
  { value: "RESPONSIBILITY", label: "Responsibilities" },
  { value: "SPECIFICATION", label: "Specifications" },
  { value: "WARRANTY", label: "Warranties" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "PENALTY", label: "Penalties" },
  { value: "OTHER", label: "Other" },
]

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/contracts')
      }
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setDeleting(false)
    }
  }

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/contracts/${id}`)
      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
        return null
      }
      const data = await res.json()
      if (data) setContract(data)
      return data
    } catch {
      setContract(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContract()
  }, [id])

  // Poll for updates while processing
  useEffect(() => {
    if (!contract || (contract.status !== 'PROCESSING' && contract.status !== 'PENDING')) {
      return
    }

    const interval = setInterval(async () => {
      const data = await fetchContract()
      if (data && data.status !== 'PROCESSING' && data.status !== 'PENDING') {
        clearInterval(interval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [contract?.status, id])

  const filteredTerms = contract?.terms.filter(term => {
    if (!term.isActive) return false
    if (activeCategory !== "all" && term.category !== activeCategory) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        term.title.toLowerCase().includes(searchLower) ||
        term.description.toLowerCase().includes(searchLower) ||
        term.value?.toLowerCase().includes(searchLower)
      )
    }
    return true
  }) || []

  const toggleTermExpanded = (termId: string) => {
    setExpandedTerms(prev => {
      const next = new Set(prev)
      if (next.has(termId)) {
        next.delete(termId)
      } else {
        next.add(termId)
      }
      return next
    })
  }

  const termCountsByCategory = contract?.terms.reduce((acc, term) => {
    if (term.isActive) {
      acc[term.category] = (acc[term.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen">
        <Header title="Contract Not Found" />
        <div className="p-6">
          <Card className="glass-panel">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Contract not found</h3>
              <Link href="/contracts">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Contracts
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
        title={contract.name}
        description={contract.projectName || "Construction Contract"}
        actions={
          <div className="flex gap-2">
            <Link href={`/change-orders/new?contractId=${contract.id}`}>
              <Button variant="outline">
                <GitBranch className="h-4 w-4" />
                Submit Change Order
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Back Link */}
        <Link href="/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Contracts
        </Link>

        {/* Contract Overview */}
        <Card className="glass-panel">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contract.projectName && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="font-medium">{contract.projectName}</p>
                  </div>
                </div>
              )}
              
              {contract.owner && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Owner</p>
                    <p className="font-medium">{contract.owner}</p>
                  </div>
                </div>
              )}
              
              {contract.totalValue && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contract Value</p>
                    <p className="font-medium">{formatCurrency(contract.totalValue)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatDate(contract.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Badge */}
        {contract.status === "PROCESSING" && (
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <div>
                <p className="font-medium">AI is analyzing your contract</p>
                <p className="text-sm text-muted-foreground">This may take a few minutes for large documents</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="terms" className="space-y-6">
          <TabsList>
            <TabsTrigger value="terms">
              <FileText className="h-4 w-4 mr-2" />
              Extracted Terms ({contract.terms.filter(t => t.isActive).length})
            </TabsTrigger>
            <TabsTrigger value="changes">
              <GitBranch className="h-4 w-4 mr-2" />
              Change Orders ({contract.changeOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="space-y-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.value)}
                  className="gap-2"
                >
                  {cat.value !== "all" && (
                    <span>{getCategoryIcon(cat.value)}</span>
                  )}
                  {cat.label}
                  {cat.value !== "all" && termCountsByCategory[cat.value] && (
                    <Badge variant="secondary" className="ml-1">
                      {termCountsByCategory[cat.value]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 max-w-md"
              />
            </div>

            {/* Terms List */}
            {filteredTerms.length === 0 ? (
              <Card className="glass-panel">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No terms found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTerms.map(term => {
                  const isExpanded = expandedTerms.has(term.id)
                  
                  return (
                    <Card key={term.id} className="term-card overflow-hidden">
                      <CardContent className="p-0">
                        <button
                          className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
                          onClick={() => toggleTermExpanded(term.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="text-2xl mt-0.5">{getCategoryIcon(term.category)}</div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{term.title}</h4>
                                  <Badge className={getCategoryColor(term.category)}>
                                    {term.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {term.description}
                                </p>
                                {term.value && (
                                  <p className="text-sm font-medium mt-2 text-primary">
                                    {term.value}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${getConfidenceColor(term.confidence)}`}>
                                {Math.round(term.confidence * 100)}%
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border mt-2">
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {term.parties.length > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Parties</p>
                                  <div className="flex flex-wrap gap-1">
                                    {term.parties.map((party, i) => (
                                      <Badge key={i} variant="secondary">{party}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {term.dueDate && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                                  <p className="font-medium">{formatDate(term.dueDate)}</p>
                                </div>
                              )}
                              
                              {term.sourceSection && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{term.sourceSection}</span>
                                  {term.sourcePage && (
                                    <span className="text-muted-foreground">
                                      (Page {term.sourcePage})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {term.originalText && (
                              <div className="bg-secondary/50 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-muted-foreground italic">
                                    &ldquo;{truncateText(term.originalText, 300)}&rdquo;
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="changes" className="space-y-4">
            {contract.changeOrders.length === 0 ? (
              <Card className="glass-panel">
                <CardContent className="py-12 text-center">
                  <GitBranch className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <h3 className="font-semibold mb-2">No Change Orders Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Submit a change order to track modifications to this contract
                  </p>
                  <Link href={`/change-orders/new?contractId=${contract.id}`}>
                    <Button>
                      <Plus className="h-4 w-4" />
                      Submit Change Order
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {contract.changeOrders.map(co => (
                  <Link key={co.id} href={`/change-orders/${co.id}`}>
                    <Card className="term-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                            <GitBranch className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{co.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Submitted by {co.submittedBy} on {formatDate(co.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(co.status)}>{co.status}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{contract.name}&quot;? This will also delete all {contract.terms.length} extracted terms and {contract.changeOrders.length} change orders. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
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

