"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { 
  Upload, 
  FileText, 
  X,
  Loader2,
  GitBranch,
  AlertCircle
} from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface Contract {
  id: string
  name: string
  projectName: string | null
}

function NewChangeOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedContractId = searchParams.get("contractId")
  
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [contractId, setContractId] = useState(preselectedContractId || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [submittedBy, setSubmittedBy] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetch("/api/contracts")
      .then(res => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          return []
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setContracts(data.filter((c: Contract & { status: string }) => c.status === "EXTRACTED"))
        }
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false))
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.pdf')) {
        setError('Please upload a PDF file')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contractId || !title || !submittedBy) {
      setError("Please fill in all required fields")
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append("contractId", contractId)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("submittedBy", submittedBy)
      if (file) {
        formData.append("file", file)
      }
      
      const response = await fetch("/api/change-orders", {
        method: "POST",
        body: formData
      })
      
      if (!response.ok) {
        throw new Error("Failed to submit change order")
      }
      
      const changeOrder = await response.json()
      router.push(`/change-orders/${changeOrder.id}`)
    } catch (err) {
      console.error(err)
      setError("Failed to submit change order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="New Change Order" 
        description="Submit a change order for an existing contract"
      />

      <div className="p-6 max-w-2xl mx-auto">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Change Order Details
            </CardTitle>
            <CardDescription>
              Provide information about the proposed change. If you upload a document, 
              our AI will analyze it to identify affected contract terms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contract Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Contract <span className="text-red-500">*</span>
                </label>
                {loading ? (
                  <div className="h-10 bg-secondary rounded-lg animate-pulse" />
                ) : (
                  <Select value={contractId} onValueChange={setContractId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map(contract => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.projectName || contract.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Foundation Design Modification"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the proposed changes..."
                  rows={4}
                />
              </div>

              {/* Submitted By */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Submitted By <span className="text-red-500">*</span>
                </label>
                <Input
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  placeholder="Your name or role"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Supporting Document (Optional)
                </label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  file ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-primary/50"
                }`}>
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-emerald-500" />
                        <div className="text-left">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop a PDF here or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 rounded-lg p-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <GitBranch className="h-4 w-4" />
                      Submit Change Order
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewChangeOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NewChangeOrderContent />
    </Suspense>
  )
}

