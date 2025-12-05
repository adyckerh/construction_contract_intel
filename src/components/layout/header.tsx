"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="border-b border-border bg-white">
      <div className="flex h-14 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          {actions}
        </div>
      </div>
    </header>
  )
}
