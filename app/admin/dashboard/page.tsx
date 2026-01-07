"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Loader2,
  School,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { usersApi, examsApi, subjectsApi, classesApi, scoresApi } from "@/lib/api"

type ExamStatus = "completed" | "ongoing" | "upcoming"

const statusConfig: Record<ExamStatus, {
  label: string
  color: string
  icon: typeof CheckCircle2
}> = {
  completed: {
    label: "Đã kết thúc",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  ongoing: {
    label: "Đang diễn ra",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  upcoming: {
    label: "Sắp diễn ra",
    color: "bg-blue-100 text-blue-700",
    icon: AlertCircle,
  },
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    totalSubjects: 0,
    totalClasses: 0,
    ongoingExams: 0,
    upcomingExams: 0,
    completedExams: 0,
  })
  const [recentExams, setRecentExams] = useState<any[]>([])
  const [scoreStats, setScoreStats] = useState({
    excellent: 0,
    good: 0,
    average: 0,
    weak: 0,
    total: 0,
  })
  const [subjectStats, setSubjectStats] = useState<{name: string; count: number}[]>([])

  const calculateStatus = (examDate: string, startTime: string, endTime: string): ExamStatus => {
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
        const [usersRes, examsRes, subjectsRes, classesRes] = await Promise.all([
          usersApi.getAll() as Promise<{ success: boolean; data: any[] }>,
          examsApi.getAll() as Promise<{ success: boolean; data: any[] }>,
          subjectsApi.getAll() as Promise<{ success: boolean; data: any[] }>,
          classesApi.getAll() as Promise<{ success: boolean; data: any[] }>,
        ])

        const students = usersRes.data?.filter((u: any) => u.role === "student") || []
        const teachers = usersRes.data?.filter((u: any) => u.role === "teacher") || []

        const examsWithStatus = (examsRes.data || []).map((exam: any) => ({
          ...exam,
          calculatedStatus: calculateStatus(exam.examDate, exam.startTime, exam.endTime)
        }))

        const ongoing = examsWithStatus.filter((e: any) => e.calculatedStatus === "ongoing").length
        const upcoming = examsWithStatus.filter((e: any) => e.calculatedStatus === "upcoming").length
        const completed = examsWithStatus.filter((e: any) => e.calculatedStatus === "completed").length

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalExams: examsRes.data?.length || 0,
          totalSubjects: subjectsRes.data?.length || 0,
          totalClasses: classesRes.data?.length || 0,
          ongoingExams: ongoing,
          upcomingExams: upcoming,
          completedExams: completed,
        })

        setRecentExams(examsWithStatus.slice(0, 5))

        // Thống kê số kỳ thi theo môn học
        const subjectCounts: Record<string, number> = {}
        examsRes.data?.forEach((exam: any) => {
          const subjectName = exam.subject?.name || "Khác"
          subjectCounts[subjectName] = (subjectCounts[subjectName] || 0) + 1
        })
        const sortedSubjects = Object.entries(subjectCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setSubjectStats(sortedSubjects)

        // Fetch scores để thống kê
        try {
          let allScores: number[] = []
          for (const exam of examsWithStatus.filter((e: any) => e.calculatedStatus === "completed").slice(0, 10)) {
            try {
              const scoresRes = await scoresApi.getByExam(exam._id)
              if (scoresRes.success && scoresRes.data) {
                allScores = [...allScores, ...scoresRes.data.map((s: any) => s.score)]
              }
            } catch {}
          }
          
          setScoreStats({
            excellent: allScores.filter(s => s >= 8.5).length,
            good: allScores.filter(s => s >= 7 && s < 8.5).length,
            average: allScores.filter(s => s >= 5 && s < 7).length,
            weak: allScores.filter(s => s < 5).length,
            total: allScores.length,
          })
        } catch (error) {
          console.error("Error fetching scores:", error)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getScorePercentage = (value: number) => {
    if (scoreStats.total === 0) return 0
    return Math.round((value / scoreStats.total) * 100)
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
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Admin</h1>
            <p className="text-muted-foreground">Tổng quan hệ thống quản lý</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: GraduationCap, color: "green", value: stats.totalStudents, label: "Học viên" },
          { icon: Users, color: "blue", value: stats.totalTeachers, label: "Giáo viên" },
          { icon: School, color: "purple", value: stats.totalClasses, label: "Lớp học" },
          { icon: BookOpen, color: "orange", value: stats.totalSubjects, label: "Môn học" },
          { icon: Calendar, color: "cyan", value: stats.totalExams, label: "Kỳ thi" },
          { icon: TrendingUp, color: "yellow", value: stats.ongoingExams, label: "Đang thi" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ phân loại điểm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Phân loại kết quả học tập
              </CardTitle>
              <CardDescription>Thống kê điểm số của học viên</CardDescription>
            </CardHeader>
            <CardContent>
              {scoreStats.total === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu điểm</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12"
                          strokeDasharray={`${getScorePercentage(scoreStats.excellent) * 2.51} 251`} strokeDashoffset="0" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12"
                          strokeDasharray={`${getScorePercentage(scoreStats.good) * 2.51} 251`}
                          strokeDashoffset={`${-getScorePercentage(scoreStats.excellent) * 2.51}`} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="12"
                          strokeDasharray={`${getScorePercentage(scoreStats.average) * 2.51} 251`}
                          strokeDashoffset={`${-(getScorePercentage(scoreStats.excellent) + getScorePercentage(scoreStats.good)) * 2.51}`} />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12"
                          strokeDasharray={`${getScorePercentage(scoreStats.weak) * 2.51} 251`}
                          strokeDashoffset={`${-(getScorePercentage(scoreStats.excellent) + getScorePercentage(scoreStats.good) + getScorePercentage(scoreStats.average)) * 2.51}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold">{scoreStats.total}</span>
                        <span className="text-xs text-muted-foreground">Bài thi</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Xuất sắc (≥8.5): {scoreStats.excellent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Khá (≥7): {scoreStats.good}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>TB (≥5): {scoreStats.average}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Yếu (&lt;5): {scoreStats.weak}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Biểu đồ kỳ thi theo môn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Kỳ thi theo môn học
              </CardTitle>
              <CardDescription>Top 5 môn có nhiều kỳ thi nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {subjectStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu</div>
              ) : (
                <div className="space-y-3">
                  {subjectStats.map((subject, index) => {
                    const maxCount = subjectStats[0]?.count || 1
                    const percentage = (subject.count / maxCount) * 100
                    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-cyan-500"]
                    return (
                      <div key={subject.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate">{subject.name}</span>
                          <span className="text-muted-foreground">{subject.count} kỳ thi</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                            className={`h-full ${colors[index]} rounded-full`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Exam Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kỳ thi sắp tới</p>
              <p className="text-3xl font-bold text-blue-500">{stats.upcomingExams}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500/30" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đang diễn ra</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.ongoingExams}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500/30" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đã kết thúc</p>
              <p className="text-3xl font-bold text-green-500">{stats.completedExams}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500/30" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Exams & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Kỳ thi gần đây
              </CardTitle>
              <CardDescription>Danh sách các kỳ thi mới nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentExams.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có kỳ thi nào</p>
                ) : (
                  recentExams.map((exam, index) => {
                    const status = statusConfig[exam.calculatedStatus as ExamStatus]
                    const StatusIcon = status.icon
                    return (
                      <motion.div
                        key={exam._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{exam.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(exam.examDate).toLocaleDateString("vi-VN")} • {exam.startTime} - {exam.endTime}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </motion.div>
                    )
                  })
                )}
              </div>
              <div className="mt-4">
                <Link href="/admin/exams">
                  <Button variant="outline" className="w-full">Xem tất cả kỳ thi</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>Truy cập nhanh các chức năng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/exams" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  Quản lý kỳ thi
                </Button>
              </Link>
              <Link href="/admin/classes" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <School className="w-4 h-4 text-purple-500" />
                  Quản lý lớp học
                </Button>
              </Link>
              <Link href="/admin/subjects" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  Quản lý môn học
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Quản lý người dùng
                </Button>
              </Link>
              <Link href="/admin/reports" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Báo cáo thống kê
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
