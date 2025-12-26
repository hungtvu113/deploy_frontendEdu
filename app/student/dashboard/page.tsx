"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  School,
  BookOpen,
  MapPin,
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
import { scoresApi, authApi } from "@/lib/api"

export default function StudentDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalExams: 0,
    averageScore: 0,
    highestScore: 0,
  })
  const [myClasses, setMyClasses] = useState<any[]>([])
  const [upcomingExams, setUpcomingExams] = useState<any[]>([])
  const [recentScores, setRecentScores] = useState<any[]>([])

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

        // Lấy kỳ thi và điểm của sinh viên
        const examsRes = await scoresApi.getMyExams() as { success: boolean; data: any[] }
        
        if (examsRes.success) {
          const examsData = examsRes.data || []
          
          // Tính status cho từng kỳ thi
          const examsWithStatus = examsData.map((exam: any) => ({
            ...exam,
            calculatedStatus: calculateStatus(exam.examDate, exam.startTime, exam.endTime)
          }))

          // Lọc kỳ thi sắp tới và đang diễn ra
          const upcoming = examsWithStatus.filter(
            (e: any) => e.calculatedStatus === "upcoming" || e.calculatedStatus === "ongoing"
          )
          setUpcomingExams(upcoming.slice(0, 5))

          // Lọc kỳ thi đã có điểm
          const withScores = examsWithStatus.filter((e: any) => e.score !== null)
          setRecentScores(withScores.slice(0, 5))

          // Tính thống kê
          const scores = withScores.map((e: any) => e.score).filter((s: any) => s !== null)
          const avgScore = scores.length > 0 
            ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length 
            : 0
          const highScore = scores.length > 0 ? Math.max(...scores) : 0

          // Lấy danh sách lớp unique từ exams data
          const uniqueClasses = new Map()
          examsData.forEach((exam: any) => {
            if (exam.class?.id && !uniqueClasses.has(exam.class.id)) {
              uniqueClasses.set(exam.class.id, {
                _id: exam.class.id,
                code: exam.class.code,
                name: exam.class.name,
                subject: exam.subject,
                teacher: exam.teacher,
              })
            }
          })
          setMyClasses(Array.from(uniqueClasses.values()).slice(0, 5))
          
          setStats({
            totalClasses: uniqueClasses.size,
            totalExams: examsData.length,
            averageScore: avgScore,
            highestScore: highScore,
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
      ongoing: "Đang thi",
      upcoming: "Sắp thi",
      completed: "Đã thi",
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.upcoming}`}>
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard Học viên</h1>
              <p className="text-muted-foreground">
                Chào mừng trở lại, {userName || "Học viên"}
              </p>
            </div>
          </div>
          <Link href="/student/scores">
            <Button className="gap-2 bg-green-500 hover:bg-green-600">
              <FileText className="w-4 h-4" />
              Xem điểm
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={School}
          title="Lớp đã tham gia"
          value={stats.totalClasses}
          subtitle="Tổng số lớp"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={Calendar}
          title="Kỳ thi"
          value={stats.totalExams}
          subtitle="Tổng số kỳ thi"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Điểm trung bình"
          value={stats.averageScore.toFixed(2)}
          subtitle="Tất cả kỳ thi"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Award}
          title="Điểm cao nhất"
          value={stats.highestScore.toFixed(1)}
          subtitle="Thành tích tốt nhất"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Upcoming Exams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Kỳ thi sắp tới
          </h3>
          <Link href="/student/schedule">
            <Button variant="outline" size="sm">
              Xem lịch thi
            </Button>
          </Link>
        </div>
        {upcomingExams.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Không có kỳ thi sắp tới</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên kỳ thi</TableHead>
                <TableHead>Môn thi</TableHead>
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
                  key={exam.examId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="group"
                >
                  <TableCell className="font-medium">{exam.examName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {exam.subject?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{exam.class?.name || "-"}</TableCell>
                  <TableCell>
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString("vi-VN") : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{exam.startTime} - {exam.endTime}</TableCell>
                  <TableCell>
                    {exam.room ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        {exam.room}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(exam.calculatedStatus)}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Recent Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Kết quả thi gần đây
          </h3>
          <Link href="/student/scores">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>
        {recentScores.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa có kết quả thi nào</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên kỳ thi</TableHead>
                <TableHead>Môn thi</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>Ngày thi</TableHead>
                <TableHead>Điểm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentScores.map((exam, index) => (
                <motion.tr
                  key={exam.examId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <TableCell className="font-medium">{exam.examName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {exam.subject?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell>{exam.class?.name || "-"}</TableCell>
                  <TableCell>
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString("vi-VN") : "-"}
                  </TableCell>
                  <TableCell>
                    <span className="text-lg font-bold text-green-500">
                      {exam.score?.toFixed(1)}
                    </span>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* My Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <School className="w-5 h-5 text-green-500" />
            Lớp học của tôi
          </h3>
          <Link href="/student/classes">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>
        {myClasses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa tham gia lớp học nào</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lớp</TableHead>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Giáo viên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myClasses.map((cls, index) => (
                <motion.tr
                  key={cls._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
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
                  <TableCell>{cls.teacher?.name || "-"}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  )
}
