"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  FileText,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

// Mock data đã được xóa - dữ liệu sẽ được lấy từ API
const mockExams = [
  { id: "all", name: "Tất cả kỳ thi" },
]

const statsData = {
  totalStudents: 0,
  totalExams: 0,
  totalSubjects: 0,
  averageScore: 0,
  gradeDistribution: {
    "Xuất sắc": 0,
    "Giỏi": 0,
    "Khá": 0,
    "Trung bình": 0,
    "Yếu": 0,
    "Kém": 0,
  },
  studentStatus: {
    "Đang học": 0,
    "Tạm nghỉ": 0,
    "Đã tốt nghiệp": 0,
  },
  topStudents: [] as { rank: number; studentCode: string; studentName: string; averageScore: number; totalExams: number }[],
}

export default function ReportsPage() {
  const [selectedExam, setSelectedExam] = useState("all")

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

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      "Xuất sắc": "bg-purple-500",
      "Giỏi": "bg-blue-500",
      "Khá": "bg-green-500",
      "Trung bình": "bg-yellow-500",
      "Yếu": "bg-orange-500",
      "Kém": "bg-red-500",
    }
    return colors[grade] || "bg-gray-500"
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Thống kê & Báo cáo</h1>
              <p className="text-muted-foreground">
                Tổng quan và phân tích dữ liệu hệ thống
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-2 max-w-md"
      >
        <FileText className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn kỳ thi" />
          </SelectTrigger>
          <SelectContent>
            {mockExams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Tổng số học viên"
          value={statsData.totalStudents}
          subtitle="Đang hoạt động"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Calendar}
          title="Tổng số kỳ thi"
          value={statsData.totalExams}
          subtitle="Đã tổ chức"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={BookOpen}
          title="Tổng số môn thi"
          value={statsData.totalSubjects}
          subtitle="Đang mở"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Điểm trung bình"
          value={statsData.averageScore.toFixed(1)}
          subtitle="Toàn hệ thống"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Phân bố điểm theo xếp loại
          </h3>
          <div className="space-y-4">
            {Object.entries(statsData.gradeDistribution).map(([grade, count]) => {
              const total = Object.values(statsData.gradeDistribution).reduce(
                (a, b) => a + b,
                0
              )
              const percentage = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={grade} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{grade}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${getGradeColor(grade)}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Student Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Trạng thái học viên
          </h3>
          <div className="space-y-4">
            {Object.entries(statsData.studentStatus).map(([status, count]) => {
              const total = Object.values(statsData.studentStatus).reduce(
                (a, b) => a + b,
                0
              )
              const percentage = total > 0 ? (count / total) * 100 : 0
              const colors: Record<string, string> = {
                "Đang học": "bg-green-500",
                "Tạm nghỉ": "bg-yellow-500",
                "Đã tốt nghiệp": "bg-blue-500",
              }
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{status}</span>
                    <span className="text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${colors[status]}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-card border rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Bảng xếp hạng học viên
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Hạng</TableHead>
              <TableHead>Mã SV</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Điểm TB</TableHead>
              <TableHead>Số kỳ thi</TableHead>
              <TableHead>Xếp loại</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statsData.topStudents.map((student, index) => {
              const getGrade = (score: number) => {
                if (score >= 9.0) return "Xuất sắc"
                if (score >= 8.0) return "Giỏi"
                if (score >= 7.0) return "Khá"
                if (score >= 5.5) return "Trung bình"
                if (score >= 4.0) return "Yếu"
                return "Kém"
              }
              const grade = getGrade(student.averageScore)
              return (
                <motion.tr
                  key={student.studentCode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="group hover:bg-muted/50"
                >
                  <TableCell>
                    <span className="text-2xl">{getRankBadge(student.rank)}</span>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {student.studentCode}
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.studentName}
                  </TableCell>
                  <TableCell>
                    <span className="text-lg font-bold text-primary">
                      {student.averageScore.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>{student.totalExams}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        grade === "Xuất sắc"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : grade === "Giỏi"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-green-500/10 text-green-500 border-green-500/20"
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      {grade}
                    </span>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}

