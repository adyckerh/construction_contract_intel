"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import { formatFileSize } from "@/lib/utils"

type UploadState = "idle" | "uploading" | "processing" | "success" | "error"

export default function UploadContractPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [contractName, setContractName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }
    
    setFile(selectedFile)
    setError(null)
    if (!contractName) {
      setContractName(selectedFile.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploadState("uploading")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", contractName || file.name)
      if (projectName) {
        formData.append("projectName", projectName)
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/contracts", {
        method: "POST",
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const contract = await response.json()
      
      setUploadProgress(100)
      setUploadState("processing")

      // Wait a moment to show processing state
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setUploadState("success")
      
      // Redirect to contract page
      setTimeout(() => {
        router.push(`/contracts/${contract.id}`)
      }, 1000)
    } catch (err) {
      console.error(err)
      setUploadState("error")
      setError("Failed to upload contract. Please try again.")
    }
  }

  const resetUpload = () => {
    setFile(null)
    setContractName("")
    setProjectName("")
    setUploadState("idle")
    setUploadProgress(0)
    setError(null)
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Upload Contract" 
        description="Upload a construction contract for AI-powered analysis"
      />

      <div className="p-6 max-w-2xl mx-auto">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Contract Analysis
            </CardTitle>
            <CardDescription>
              Upload your construction contract and our AI will automatically extract key terms,
              deadlines, payment schedules, and responsibilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : file 
                    ? "border-emerald-500/50 bg-emerald-500/5" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setFile(null)}
                    disabled={uploadState !== "idle"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drop your contract here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Contract Details */}
            {file && uploadState === "idle" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contract Name</label>
                  <Input
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    placeholder="Enter contract name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Name (Optional)</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {(uploadState === "uploading" || uploadState === "processing") && (
              <div className="space-y-4">
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {uploadState === "uploading" 
                      ? "Uploading contract..." 
                      : "AI is analyzing your contract..."}
                  </span>
                </div>
              </div>
            )}

            {/* Success State */}
            {uploadState === "success" && (
              <div className="flex items-center justify-center gap-2 text-emerald-500 py-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Contract uploaded successfully!</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {uploadState === "idle" && (
                <>
                  <Button 
                    className="flex-1" 
                    onClick={handleUpload}
                    disabled={!file}
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze Contract
                  </Button>
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </>
              )}
              
              {uploadState === "error" && (
                <Button className="flex-1" onClick={resetUpload}>
                  Try Again
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-medium mb-3">What our AI extracts:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Deadlines & Milestones
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  Payment Schedules
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Scope of Work
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  Responsibilities
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Specifications
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  Insurance & Warranties
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

