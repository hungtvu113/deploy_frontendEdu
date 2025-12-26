"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileEdit,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  School,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { classesApi, authApi } from "@/lib/api"

export default function TeacherDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalExams: 0,
    ongoingExams: 0,
  })
  const [myClasses, setMyClasses] = useState<any[]>([])
  const [upcomingExams, setUpcomingExams] = useState<any[]>([])

  // Tính trạng thái tự động
  const calculateStatus = (examDate: string, startTime: string, endTime: string): string => {
    if (!examDate) return "upcoming"
    const now = new Date()
    const [year, month, day] = examDate.split("T")[0].split("-").map(Number)
    const [startHour, startMin] = (startTime || "08:00").split(":").map(Number)
    const [endHour, endMin] = (endTime || "10:00").split(":").map(Number)
    const examStart = new Date(year, month - 1, day, startHour, startMin, 0, 0)
    const examEnd = new Date(year, month - 1, day, endHour, endMin, 0, 0)
    if (now < examStart) return "upcoming"
    if (now >= examStart && now <= examEnd) return "ongoing"
    return "completed"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Lấy thông tin user
        const userRes = await authApi.getMe() as { success: boolean; data: any }
        if (userRes.success) {
          setUserName(userRes.data.name)
        }

        // Lấy lớp học của giáo viên
        const classesRes = await classesApi.getAll() as { success: boolean; data: any[] }
        
        if (classesRes.success) {
          // Lọc lớp của giáo viên hiện tại (kiểm tra cả _id và id)
          const userId = userRes.data?._id || userRes.data?.id
          const teacherClasses = classesRes.data.filter((c: any) => {
            const teacherId = c.teacher?._id || c.teacher?.id || c.teacher
            return teacherId === userId
          })
          
          setMyClasses(teacherClasses.slice(0, 5))

          // Tính tổng số học viên
          const totalStudents = teacherClasses.reduce(
            (sum: number, c: any) => sum + (c.students?.length || 0), 0
          )

          // Lấy tất cả kỳ thi từ các lớp
          const allExams: any[] = []
          teacherClasses.forEach((cls: any) => {
            if (cls.exams && Array.isArray(cls.exams)) {
              cls.exams.forEach((exam: any) => {
                // Xử lý cả trường hợp exam là object hoặc string ID
                const examId = typeof exam === "string" ? exam : (exam?._id || exam?.id)
                const examName = typeof exam === "string" ? "" : exam?.name
                
                if (examId) {
                  const examDate = typeof exam === "string" ? "" : exam?.examDate
                  const startTime = typeof exam === "string" ? "08:00" : (exam?.startTime || "08:00")
                  const endTime = typeof exam === "string" ? "10:00" : (exam?.endTime || "10:00")
                  const status = calculateStatus(examDate, startTime, endTime)
                  
                  allExams.push({
                    _id: examId,
                    name: examName || `Kỳ thi`,
                    examDate,
                    startTime,
                    endTime,
                    room: typeof exam === "string" ? "" : (exam?.room || ""),
                    className: cls.name,
                    classCode: cls.code,
                    calculatedStatus: status,
                  })
                }
              })
            }
          })

          // Lọc kỳ thi sắp tới và đang diễn ra
          const upcoming = allExams.filter(e => e.calculatedStatus === "upcoming" || e.calculatedStatus === "ongoing")
          setUpcomingExams(upcoming.slice(0, 5))

          const ongoing = allExams.filter(e => e.calculatedStatus === "ongoing").length

          setStats({
            totalClasses: teacherClasses.length,
            totalStudents,
            totalExams: allExams.length,
            ongoingExams: ongoing,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
  }: {
    icon: any
    title: string
    value: string | number
    subtitle: string
    color: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ongoing: "bg-green-500/10 text-green-500 border-green-500/20",
      upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    const labels: Record<string, string> = {
      ongoing: "Đang diễn ra",
      upcoming: "Sắp thi",
      completed: "Đã kết thúc",
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.upcoming}`}>
        {status === "ongoing" ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
        {labels[status] || status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard Giáo viên</h1>
              <p className="text-muted-foreground">
                Chào mừng trở lại, {userName || "Giáo viên"}
              </p>
            </div>
          </div>
          <Link href="/teacher/scores">
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
              <FileEdit className="w-4 h-4" />
              Nhập điểm
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={School}
          title="Lớp đang dạy"
          value={stats.totalClasses}
          subtitle="Tổng số lớp"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Users}
          title="Học viên"
          value={stats.totalStudents}
          subtitle="Tổng số học viên"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={Calendar}
          title="Kỳ thi"
          value={stats.totalExams}
          subtitle="Tổng số kỳ thi"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Đang diễn ra"
          value={stats.ongoingExams}
          subtitle="Kỳ thi đang thi"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* My Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <School className="w-5 h-5 text-blue-500" />
            Lớp học của tôi
          </h3>
          <Link href="/teacher/classes">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>
        {myClasses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa có lớp học nào</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lớp</TableHead>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Số học viên</TableHead>
                <TableHead>Số kỳ thi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myClasses.map((cls, index) => (
                <motion.tr
                  key={cls._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="group"
                >
                  <TableCell className="font-mono font-medium">{cls.code}</TableCell>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {cls.subject?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{cls.students?.length || 0}</TableCell>
                  <TableCell>{cls.exams?.length || 0}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Upcoming Exams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Kỳ thi sắp tới
          </h3>
        </div>
        {upcomingExams.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Không có kỳ thi sắp tới</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên kỳ thi</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>Ngày thi</TableHead>
                <TableHead>Giờ thi</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingExams.map((exam, index) => (
                <motion.tr
                  key={exam._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="group"
                >
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{exam.className}</TableCell>
                  <TableCell>
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString("vi-VN") : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{exam.startTime} - {exam.endTime}</TableCell>
                  <TableCell>{exam.room || "-"}</TableCell>
                  <TableCell>{getStatusBadge(exam.calculatedStatus)}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  )
}
