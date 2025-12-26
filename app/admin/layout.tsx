"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  UserCog,
  School,
  GraduationCap,
  Settings,
  User,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quản lý Môn thi",
    href: "/admin/subjects",
    icon: BookOpen,
  },
  {
    name: "Quản lý Lớp học",
    href: "/admin/classes",
    icon: School,
  },
  {
    name: "Quản lý Kỳ thi",
    href: "/admin/exams",
    icon: Calendar,
  },
  {
    name: "Quản lý Điểm",
    href: "/admin/scores",
    icon: FileText,
  },
  {
    name: "Thống kê & Báo cáo",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Quản lý Người dùng",
    href: "/admin/users",
    icon: UserCog,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="h-screen bg-muted/30 flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-background border-r transition-transform duration-300 ease-in-out flex-shrink-0",
          "lg:translate-x-0 lg:relative lg:z-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EduScore
                </span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Link href="/admin/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                  Cài đặt
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="flex-shrink-0 z-30 flex items-center gap-4 border-b bg-background px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduScore
            </span>
          </div>
        </header>

        {/* Page content - Scrollable */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

