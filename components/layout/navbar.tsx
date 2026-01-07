"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn, UserPlus, User, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useSeasonalContext } from "@/components/seasonal/seasonal-provider"
import { SeasonalLogo } from "@/components/seasonal/seasonal-logo"
import { EffectToggle } from "@/components/seasonal/effect-toggle"
import { NotificationBell } from "@/components/layout/notification-bell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserInfo {
  id?: string
  _id?: string
  name: string
  email: string
  role: "admin" | "teacher" | "student"
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [mounted, setMounted] = useState(false)
  const { event, name, effectsEnabled, toggleEffects, hasEvent } = useSeasonalContext()

  useEffect(() => {
    setMounted(true)
    // Kiểm tra token và user trong localStorage
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        setUser(null)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    window.location.href = "/"
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "admin": return "/admin/dashboard"
      case "teacher": return "/teacher/dashboard"
      case "student": return "/student/dashboard"
      default: return "/login"
    }
  }

  const getRoleName = () => {
    if (!user) return ""
    switch (user.role) {
      case "admin": return "Quản trị viên"
      case "teacher": return "Giáo viên"
      case "student": return "Học viên"
      default: return ""
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Tránh hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b h-16" />
    )
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? getDashboardLink() : "/"} className="flex items-center gap-2">
            <SeasonalLogo event={event} size="md" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              EduScore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Effect Toggle */}
            {hasEvent && (
              <EffectToggle 
                enabled={effectsEnabled} 
                onToggle={toggleEffects}
                eventName={name}
              />
            )}

            {/* Notification Bell */}
            <NotificationBell userId={user?.id || user?._id} />
            
            {user ? (
              // Đã đăng nhập - hiện avatar và dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-500 text-white text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleName()}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Chưa đăng nhập
              <>
                <Link href="/login">
                  <Button variant="ghost" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                    <UserPlus className="w-4 h-4" />
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {hasEvent && (
              <EffectToggle 
                enabled={effectsEnabled} 
                onToggle={toggleEffects}
                eventName={name}
              />
            )}
            <NotificationBell userId={user?.id || user?._id} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t bg-white dark:bg-gray-950"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{getRoleName()}</p>
                    </div>
                  </div>
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600">
                      <UserPlus className="w-4 h-4" />
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
