"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Settings,
  Key,
  Database,
  Upload,
  Bell,
  Palette
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Settings" 
        description="Configure your ContractIQ platform"
      />

      <div className="p-6 max-w-3xl space-y-6">
        {/* API Configuration */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI provider settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Anthropic API Key</label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  placeholder="sk-ant-..." 
                  className="flex-1"
                  defaultValue="••••••••••••••••"
                />
                <Button variant="outline">Update</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored securely in environment variables
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">API Status</p>
                <p className="text-sm text-muted-foreground">Claude Sonnet 4</p>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database
            </CardTitle>
            <CardDescription>
              Database connection and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">PostgreSQL</p>
                <p className="text-sm text-muted-foreground">localhost:5432</p>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upload Settings */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Settings
            </CardTitle>
            <CardDescription>
              Configure file upload behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Maximum File Size</label>
              <div className="flex gap-2 items-center">
                <Input 
                  type="number" 
                  defaultValue="50"
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">MB</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Supported Formats</label>
              <div className="flex gap-2">
                <Badge variant="secondary">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Contract uploaded", enabled: true },
              { label: "Extraction complete", enabled: true },
              { label: "Change order submitted", enabled: true },
              { label: "Approval required", enabled: true },
              { label: "Deadline approaching", enabled: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span>{item.label}</span>
                <div className={`h-6 w-11 rounded-full p-1 cursor-pointer transition-colors ${
                  item.enabled ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    item.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <span>Dark Mode</span>
              <div className="h-6 w-11 rounded-full p-1 cursor-pointer bg-primary">
                <div className="h-4 w-4 rounded-full bg-white translate-x-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

