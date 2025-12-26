"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Lock, User, ArrowRight, IdCard, Phone, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [studentId, setStudentId] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate student ID
    if (!/^\d{9}$/.test(studentId)) {
      setError("Mã sinh viên phải là 9 chữ số.")
      return
    }

    // Validate name
    if (name.trim().length < 2) {
      setError("Vui lòng nhập họ tên đầy đủ.")
      return
    }

    // Validate password
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.")
      return
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsLoading(true)

    const result = await register({
      studentId,
      name: name.trim(),
      password,
      phone: phone.trim(),
    })

    if (result.success) {
      router.push("/student/dashboard")
    } else {
      setError(result.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-secondary/5 via-accent/5 to-primary/5">
      {/* Animated background */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">Đăng ký tài khoản</CardTitle>
              <CardDescription className="text-base mt-2">
                Đăng ký tài khoản dành cho sinh viên
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
              {/* Student ID */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="space-y-2"
              >
                <Label htmlFor="studentId">Mã sinh viên</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="studentId"
                    name="studentId"
                    type="text"
                    placeholder="123456789"
                    className="pl-10"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    maxLength={9}
                    autoComplete="off"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email tự động: {studentId || "123456789"}@gmail.com
                </p>
              </motion.div>

              {/* Full Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="fullname"
                    type="text"
                    placeholder="Nguyễn Văn An"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="space-y-2"
              >
                <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="0901234567"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
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
                <p className="text-xs text-muted-foreground">Tối thiểu 6 ký tự</p>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  className="w-full group"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center text-sm"
            >
              <span className="text-muted-foreground">Đã có tài khoản? </span>
              <Link href="/login" className="text-primary font-medium hover:underline">
                Đăng nhập
              </Link>
            </motion.div>

            {/* Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg"
            >
              <p>📌 <strong>Lưu ý:</strong> Chức năng đăng ký chỉ dành cho sinh viên.</p>
              <p className="mt-1">Giáo viên và Quản trị viên liên hệ phòng đào tạo để được cấp tài khoản.</p>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Quay lại trang chủ
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

