"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, User, Lock, Save, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { authApi } from "@/lib/api"

interface UserInfo {
  id: string
  name: string
  email: string
  phone?: string
  studentId?: string
  role: string
}

export function SettingsPage() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  
  // User info
  const [user, setUser] = useState<UserInfo | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })

  // Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      setIsLoading(true)
      const res = await authApi.getMe() as { success: boolean; data: UserInfo }
      if (res.success) {
        setUser(res.data)
        setFormData({
          name: res.data.name || "",
          phone: res.data.phone || "",
        })
      }
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể tải thông tin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Lỗi", "Vui lòng nhập họ tên")
      return
    }

    try {
      setIsSaving(true)
      const res = await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
      }) as { success: boolean; message: string }
      
      if (res.success) {
        toast.success("Thành công", "Đã cập nhật thông tin")
        // Update localStorage
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          userData.name = formData.name
          localStorage.setItem("user", JSON.stringify(userData))
        }
        fetchUserInfo()
      }
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể cập nhật")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Lỗi", "Vui lòng điền đầy đủ thông tin")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Lỗi", "Mật khẩu xác nhận không khớp")
      return
    }

    try {
      setIsSaving(true)
      const res = await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      ) as { success: boolean; message: string }
      
      if (res.success) {
        toast.success("Thành công", "Đã đổi mật khẩu")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể đổi mật khẩu")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Cài đặt</h1>
            <p className="text-muted-foreground">Quản lý tài khoản</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-card border rounded-lg p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-card border rounded-lg p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Thông tin cá nhân</h2>
                  <p className="text-sm text-muted-foreground">Cập nhật thông tin tài khoản của bạn</p>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ""} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                    </div>
                    {user?.studentId && (
                      <div className="space-y-2">
                        <Label>Mã sinh viên</Label>
                        <Input value={user.studentId} disabled className="bg-muted" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </Button>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Đổi mật khẩu</h2>
                  <p className="text-sm text-muted-foreground">Cập nhật mật khẩu để bảo mật tài khoản</p>
                </div>

                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleChangePassword} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Đổi mật khẩu
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
