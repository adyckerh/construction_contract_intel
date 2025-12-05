"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Bell,
  FileText,
  CheckCircle,
  XCircle,
  GitBranch,
  AlertCircle,
  Clock,
  CheckCheck
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
  contract: {
    name: string
  } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          return []
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setNotifications(data)
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    if (unreadIds.length === 0) return
    
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds })
      })
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error(error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONTRACT_UPLOADED':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'EXTRACTION_COMPLETE':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'CHANGE_ORDER_SUBMITTED':
        return <GitBranch className="h-5 w-5 text-purple-500" />
      case 'APPROVAL_REQUIRED':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'APPROVAL_DECISION':
        return <CheckCheck className="h-5 w-5 text-emerald-500" />
      case 'DEADLINE_APPROACHING':
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen">
      <Header 
        title="Notifications" 
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          )
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="glass-panel">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                You&apos;ll see updates about your contracts here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                getIcon={getIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationItem({ 
  notification, 
  getIcon 
}: { 
  notification: Notification
  getIcon: (type: string) => React.ReactNode
}) {
  const content = (
    <Card className={`term-card transition-all ${
      !notification.isRead ? 'border-primary/30 bg-primary/5' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            !notification.isRead ? 'bg-primary/10' : 'bg-secondary'
          }`}>
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </h4>
                {notification.contract && (
                  <p className="text-xs text-muted-foreground">
                    {notification.contract.name}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDateTime(notification.createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          </div>
          {!notification.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
}

