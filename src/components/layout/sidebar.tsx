"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileText, 
  GitBranch, 
  CheckSquare, 
  Bell,
  Settings,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Contracts", href: "/contracts", icon: FileText },
  { name: "Change Orders", href: "/change-orders", icon: GitBranch },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
]

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-56 border-r border-border bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <h1 className="text-base font-semibold text-foreground">ContractIQ</h1>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Secondary Navigation */}
        <div className="border-t border-border px-2 py-3">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
        
        {/* User */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
              PM
            </div>
            <div>
              <p className="text-sm text-foreground">Project Manager</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
