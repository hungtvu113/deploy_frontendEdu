"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  UserCog,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  GraduationCap,
  Key,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { usersApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type UserAccount = {
  id: string
  role: string
  email: string
  fullName: string
  username: string
  status: string
  createdAt: string
  lastLogin: string
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null)
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    role: "",
    username: "",
    fullName: "",
    password: "",
    status: "Hoạt động",
  })

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await usersApi.getAll() as { success: boolean; data: any[] }
      if (response.success) {
        const mappedUsers: UserAccount[] = response.data.map((user: any) => ({
          id: user._id || user.id,
          role: user.role === "admin" ? "Admin" : user.role === "teacher" ? "Giáo viên" : "Học viên",
          email: user.email,
          fullName: user.name,
          username: user.email.split("@")[0],
          status: user.isActive ? "Hoạt động" : "Vô hiệu hóa",
          createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("vi-VN") : "Chưa đăng nhập",
        }))
        setUsers(mappedUsers)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesFilter
  })

  const handleAdd = () => {
    setEditingUser(null)
    setFormData({
      role: "",
      username: "",
      fullName: "",
      password: "",
      status: "Hoạt động",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (user: UserAccount) => {
    setEditingUser(user)
    setFormData({
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      password: "",
      status: user.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (user: UserAccount) => {
    setDeletingUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleResetPassword = (user: UserAccount) => {
    setResettingUser(user)
    setIsResetPasswordDialogOpen(true)
  }

  const generateEmail = (username: string) => {
    return `${username}@gmail.com`
  }

  const getRoleValue = (role: string): "admin" | "teacher" | "student" => {
    if (role === "Admin") return "admin"
    if (role === "Giáo viên") return "teacher"
    return "student"
  }

  const handleSave = async () => {
    if (!formData.username || !formData.fullName || !formData.role) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    if (!editingUser && !formData.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mật khẩu cho người dùng mới",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const email = generateEmail(formData.username)

    try {
      if (editingUser) {
        // Update user
        await usersApi.update(editingUser.id, {
          name: formData.fullName,
          isActive: formData.status === "Hoạt động",
        })
        toast({
          title: "Thành công",
          description: "Đã cập nhật người dùng",
        })
      } else {
        // Create new user
        await usersApi.create({
          email,
          password: formData.password,
          name: formData.fullName,
          role: getRoleValue(formData.role),
        })
        toast({
          title: "Thành công",
          description: "Đã thêm người dùng mới",
        })
      }
      setIsDialogOpen(false)
      fetchUsers() // Refresh list
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu người dùng",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (deletingUser) {
      try {
        await usersApi.delete(deletingUser.id)
        toast({
          title: "Thành công",
          description: "Đã xóa người dùng",
        })
        fetchUsers() // Refresh list
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xóa người dùng",
          variant: "destructive",
        })
      }
      setIsDeleteDialogOpen(false)
      setDeletingUser(null)
    }
  }

  const confirmResetPassword = () => {
    // TODO: Implement reset password API
    toast({
      title: "Thông báo",
      description: "Chức năng đặt lại mật khẩu đang được phát triển",
    })
    setIsResetPasswordDialogOpen(false)
    setResettingUser(null)
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      Admin: "bg-red-500/10 text-red-500 border-red-500/20",
      "Giáo viên": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Học viên": "bg-green-500/10 text-green-500 border-green-500/20",
    }
    return styles[role as keyof typeof styles] || styles["Học viên"]
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Shield className="w-3 h-3" />
      case "Giáo viên":
        return <User className="w-3 h-3" />
      case "Học viên":
        return <GraduationCap className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Hoạt động"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }

  const getStatusIcon = (status: string) => {
    return status === "Hoạt động" ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <XCircle className="w-3 h-3" />
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
            <p className="text-muted-foreground">
              Quản lý tài khoản Admin, Giáo viên và Học viên
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo email, tên, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                <SelectItem value="Học viên">Học viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border rounded-lg bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vai trò</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Đăng nhập cuối</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserCog className="w-12 h-12 opacity-20" />
                    <p>Không tìm thấy người dùng nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        user.status
                      )}`}
                    >
                      {getStatusIcon(user.status)}
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin === "-"
                      ? "-"
                      : new Date(user.lastLogin).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResetPassword(user)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Reset mật khẩu"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        disabled={user.role === "Admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Cập nhật thông tin người dùng"
                : "Tạo tài khoản mới cho hệ thống"}
            </DialogDescription>
          </DialogHeader>

          <form autoComplete="off" className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Vai trò <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => {
                  setFormData({ ...formData, role: value, username: "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                  <SelectItem value="Học viên">Học viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  {formData.role === "Học viên" ? "Mã sinh viên" : "Tên tài khoản"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder={
                    formData.role === "Học viên"
                      ? "123456789"
                      : formData.role === "Admin"
                      ? "admin"
                      : "nguyenvana"
                  }
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/\s/g, "")
                    if (formData.role === "Học viên") {
                      const numValue = value.replace(/\D/g, "").slice(0, 9)
                      setFormData({ ...formData, username: numValue })
                    } else {
                      setFormData({ ...formData, username: value })
                    }
                  }}
                  maxLength={formData.role === "Học viên" ? 9 : undefined}
                  autoComplete="off"
                />
                {formData.role === "Học viên" && (
                  <p className="text-xs text-muted-foreground">9 chữ số</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Tự động)</Label>
                <Input
                  id="email"
                  value={
                    formData.username
                      ? generateEmail(formData.username)
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                autoComplete="off"
              />
            </div>

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mật khẩu mặc định: 123456 (có thể thay đổi sau)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                  <SelectItem value="Vô hiệu hóa">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !formData.role ||
                !formData.username ||
                !formData.fullName ||
                (!editingUser && !formData.password)
              }
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingUser ? "Cập nhật" : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <span className="font-semibold">{deletingUser?.fullName}</span> (
              {deletingUser?.email})? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset mật khẩu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn reset mật khẩu cho tài khoản{" "}
              <span className="font-semibold">{resettingUser?.fullName}</span>?
              Mật khẩu mới sẽ là: <span className="font-mono font-bold">123456</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              Reset mật khẩu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

