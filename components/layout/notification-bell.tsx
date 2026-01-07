"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notificationsApi } from "@/lib/api"

interface Notification {
  _id: string
  title: string
  message: string
  type: "exam" | "score" | "class" | "system"
  targetUser?: string
  readBy: string[]
  createdAt: string
}

interface NotificationBellProps {
  userId?: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // Nếu đã đăng nhập, lấy thông báo riêng + chung
      // Nếu chưa đăng nhập, chỉ lấy thông báo chung
      const res = userId 
        ? await notificationsApi.getMy()
        : await notificationsApi.getAll()
      
      if (res.success) {
        setNotifications(res.data || [])
        if (userId) {
          const unread = (res.data || []).filter(
            (n: Notification) => !n.readBy?.includes(userId)
          ).length
          setUnreadCount(unread)
        } else {
          setUnreadCount((res.data || []).length)
        }
      }
    } catch {
      // Nếu lỗi, thử lấy thông báo chung (không cần auth)
      try {
        const res = await notificationsApi.getAll()
        if (res.success) {
          setNotifications(res.data || [])
          setUnreadCount((res.data || []).length)
        }
      } catch {
        // Backend không chạy hoặc lỗi mạng - im lặng
        setNotifications([])
        setUnreadCount(0)
      }
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = async () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)
    
    if (newOpen && userId && unreadCount > 0) {
      try {
        await notificationsApi.markAllAsRead()
        setUnreadCount(0)
        setNotifications(prev =>
          prev.map(n => ({
            ...n,
            readBy: n.readBy?.includes(userId) ? n.readBy : [...(n.readBy || []), userId]
          }))
        )
      } catch {
        // Ignore error
      }
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString("vi-VN")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exam": return "📋"
      case "score": return "📊"
      case "class": return "👥"
      default: return "🔔"
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" className="relative" onClick={handleToggle}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg border z-50">
          <div className="px-3 py-2 font-semibold text-sm border-b">
            Thông báo
          </div>
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              Không có thông báo nào
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => {
                const isRead = userId ? notification.readBy?.includes(userId) : false
                return (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-2 p-3 ${
                      !isRead ? "bg-blue-50 dark:bg-blue-950" : ""
                    }`}
                  >
                    <span className="text-lg">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {notifications.length > 10 && (
            <div className="px-3 py-2 text-center text-xs text-muted-foreground border-t">
              Hiển thị 10/{notifications.length} thông báo
            </div>
          )}
        </div>
      )}
    </div>
  )
}
