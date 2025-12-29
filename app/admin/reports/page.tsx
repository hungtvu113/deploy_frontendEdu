"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  Printer,
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
import { examsApi, usersApi, subjectsApi, scoresApi } from "@/lib/api"

type StatsData = {
  totalStudents: number
  totalExams: number
  totalSubjects: number
  averageScore: number
  gradeDistribution: Record<string, number>
  studentStatus: Record<string, number>
  topStudents: Array<{
    rank: number
    studentCode: string
    studentName: string
    averageScore: number
    totalExams: number
  }>
}

export default function ReportsPage() {
  const [selectedExam, setSelectedExam] = useState("all")
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState<Array<{ _id: string; name: string }>>([])
  const [statsData, setStatsData] = useState<StatsData>({
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
      "Đang hoạt động": 0,
      "Đã vô hiệu hóa": 0,
    },
    topStudents: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [examsRes, usersRes, subjectsRes] = await Promise.all([
          examsApi.getAll(),
          usersApi.getAll(),
          subjectsApi.getAll(),
        ])

        const examsList = examsRes.data || []
        const usersList = usersRes.data || []
        const subjectsList = subjectsRes.data || []

        setExams(examsList)

        // Count students
        const students = usersList.filter((u: any) => u.role === "student")
        const activeStudents = students.filter((s: any) => s.isActive !== false)

        // Fetch all scores
        const allScores: Array<{ studentId: string; studentName: string; studentCode: string; score: number }> = []
        for (const exam of examsList) {
          try {
            const scoresRes = await scoresApi.getByExam(exam._id)
            const examScores = (scoresRes.data || []).map((s: any) => ({
              studentId: s.student?._id,
              studentName: s.student?.name || "",
              studentCode: s.student?.studentId || "",
              score: s.score,
            }))
            allScores.push(...examScores)
          } catch (err) {
            // No scores for this exam
          }
        }

        // Calculate grade distribution
        const gradeDistribution: Record<string, number> = {
          "Xuất sắc": 0,
          "Giỏi": 0,
          "Khá": 0,
          "Trung bình": 0,
          "Yếu": 0,
          "Kém": 0,
        }

        allScores.forEach((s) => {
          if (s.score >= 9.0) gradeDistribution["Xuất sắc"]++
          else if (s.score >= 8.0) gradeDistribution["Giỏi"]++
          else if (s.score >= 7.0) gradeDistribution["Khá"]++
          else if (s.score >= 5.5) gradeDistribution["Trung bình"]++
          else if (s.score >= 4.0) gradeDistribution["Yếu"]++
          else gradeDistribution["Kém"]++
        })

        // Calculate average score
        const avgScore = allScores.length > 0
          ? allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length
          : 0

        // Calculate top students
        const studentScores: Record<string, { name: string; code: string; scores: number[] }> = {}
        allScores.forEach((s) => {
          if (!studentScores[s.studentId]) {
            studentScores[s.studentId] = { name: s.studentName, code: s.studentCode, scores: [] }
          }
          studentScores[s.studentId].scores.push(s.score)
        })

        const topStudents = Object.entries(studentScores)
          .map(([_id, data]) => ({
            studentCode: data.code,
            studentName: data.name,
            averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
            totalExams: data.scores.length,
          }))
          .sort((a, b) => b.averageScore - a.averageScore)
          .slice(0, 10)
          .map((s, i) => ({ ...s, rank: i + 1 }))

        setStatsData({
          totalStudents: students.length,
          totalExams: examsList.length,
          totalSubjects: subjectsList.length,
          averageScore: avgScore,
          gradeDistribution,
          studentStatus: {
            "Đang hoạt động": activeStudents.length,
            "Đã vô hiệu hóa": students.length - activeStudents.length,
          },
          topStudents,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
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

  const getGradeLabel = (score: number) => {
    if (score >= 9.0) return "Xuất sắc"
    if (score >= 8.0) return "Giỏi"
    if (score >= 7.0) return "Khá"
    if (score >= 5.5) return "Trung bình"
    if (score >= 4.0) return "Yếu"
    return "Kém"
  }

  const handleExportReport = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString("vi-VN")
    
    // Build CSV content
    let csvContent = "\uFEFF" // BOM for UTF-8
    csvContent += "BÁO CÁO THỐNG KÊ HỆ THỐNG EDUSCORE\n"
    csvContent += `Ngày xuất: ${dateStr}\n\n`
    
    // Summary stats
    csvContent += "THỐNG KÊ TỔNG QUAN\n"
    csvContent += `Tổng số học viên,${statsData.totalStudents}\n`
    csvContent += `Tổng số kỳ thi,${statsData.totalExams}\n`
    csvContent += `Tổng số môn thi,${statsData.totalSubjects}\n`
    csvContent += `Điểm trung bình,${statsData.averageScore.toFixed(2)}\n\n`
    
    // Grade distribution
    csvContent += "PHÂN BỐ ĐIỂM THEO XẾP LOẠI\n"
    csvContent += "Xếp loại,Số lượng,Tỷ lệ\n"
    const totalGrades = Object.values(statsData.gradeDistribution).reduce((a, b) => a + b, 0)
    Object.entries(statsData.gradeDistribution).forEach(([grade, count]) => {
      const percentage = totalGrades > 0 ? ((count / totalGrades) * 100).toFixed(1) : "0"
      csvContent += `${grade},${count},${percentage}%\n`
    })
    csvContent += "\n"
    
    // Student status
    csvContent += "TRẠNG THÁI TÀI KHOẢN HỌC VIÊN\n"
    csvContent += "Trạng thái,Số lượng,Tỷ lệ\n"
    const totalStatus = Object.values(statsData.studentStatus).reduce((a, b) => a + b, 0)
    Object.entries(statsData.studentStatus).forEach(([status, count]) => {
      const percentage = totalStatus > 0 ? ((count / totalStatus) * 100).toFixed(1) : "0"
      csvContent += `${status},${count},${percentage}%\n`
    })
    csvContent += "\n"
    
    // Top students
    csvContent += "BẢNG XẾP HẠNG HỌC VIÊN (TOP 10)\n"
    csvContent += "Hạng,Mã SV,Họ và tên,Điểm TB,Số kỳ thi,Xếp loại\n"
    statsData.topStudents.forEach((student) => {
      csvContent += `${student.rank},${student.studentCode},${student.studentName},${student.averageScore.toFixed(2)},${student.totalExams},${getGradeLabel(student.averageScore)}\n`
    })
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `BaoCao_EduScore_${now.toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString("vi-VN")
    const totalGrades = Object.values(statsData.gradeDistribution).reduce((a, b) => a + b, 0)
    const totalStatus = Object.values(statsData.studentStatus).reduce((a, b) => a + b, 0)

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo thống kê - EduScore</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 20px; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .header h1 { font-size: 22pt; color: #1e40af; margin-bottom: 5px; }
          .header p { font-size: 11pt; color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14pt; font-weight: bold; color: #1e40af; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
          .stat-box { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; background: #f8fafc; }
          .stat-box .value { font-size: 24pt; font-weight: bold; color: #3b82f6; }
          .stat-box .label { font-size: 10pt; color: #666; margin-top: 5px; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .chart-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .chart-box h4 { font-size: 12pt; margin-bottom: 10px; color: #333; }
          .bar-item { margin-bottom: 10px; }
          .bar-label { display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 3px; }
          .bar-track { height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
          .bar-fill { height: 100%; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 10pt; }
          th { background-color: #3b82f6; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .rank-1 { color: #f59e0b; font-weight: bold; }
          .rank-2 { color: #6b7280; font-weight: bold; }
          .rank-3 { color: #b45309; font-weight: bold; }
          .footer { margin-top: 30px; text-align: right; font-size: 10pt; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BÁO CÁO THỐNG KÊ HỆ THỐNG</h1>
          <p>Hệ thống quản lý điểm thi EduScore</p>
          <p style="margin-top: 5px">Ngày xuất: ${dateStr}</p>
        </div>
        
        <div class="section">
          <div class="section-title">THỐNG KÊ TỔNG QUAN</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="value">${statsData.totalStudents}</div>
              <div class="label">Tổng số học viên</div>
            </div>
            <div class="stat-box">
              <div class="value">${statsData.totalExams}</div>
              <div class="label">Tổng số kỳ thi</div>
            </div>
            <div class="stat-box">
              <div class="value">${statsData.totalSubjects}</div>
              <div class="label">Tổng số môn thi</div>
            </div>
            <div class="stat-box">
              <div class="value">${statsData.averageScore.toFixed(1)}</div>
              <div class="label">Điểm trung bình</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="two-col">
            <div class="chart-box">
              <h4>📊 Phân bố điểm theo xếp loại</h4>
              ${Object.entries(statsData.gradeDistribution).map(([grade, count]) => {
                const percentage = totalGrades > 0 ? (count / totalGrades) * 100 : 0
                const colors: Record<string, string> = {
                  "Xuất sắc": "#a855f7",
                  "Giỏi": "#3b82f6",
                  "Khá": "#22c55e",
                  "Trung bình": "#eab308",
                  "Yếu": "#f97316",
                  "Kém": "#ef4444",
                }
                return `
                  <div class="bar-item">
                    <div class="bar-label">
                      <span>${grade}</span>
                      <span>${count} (${percentage.toFixed(0)}%)</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" style="width: ${percentage}%; background: ${colors[grade]}"></div>
                    </div>
                  </div>
                `
              }).join("")}
            </div>
            <div class="chart-box">
              <h4>👥 Trạng thái tài khoản học viên</h4>
              ${Object.entries(statsData.studentStatus).map(([status, count]) => {
                const percentage = totalStatus > 0 ? (count / totalStatus) * 100 : 0
                const color = status === "Đang hoạt động" ? "#22c55e" : "#ef4444"
                return `
                  <div class="bar-item">
                    <div class="bar-label">
                      <span>${status}</span>
                      <span>${count} (${percentage.toFixed(0)}%)</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" style="width: ${percentage}%; background: ${color}"></div>
                    </div>
                  </div>
                `
              }).join("")}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">BẢNG XẾP HẠNG HỌC VIÊN (TOP 10)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 8%">Hạng</th>
                <th style="width: 15%">Mã SV</th>
                <th style="width: 30%">Họ và tên</th>
                <th style="width: 12%">Điểm TB</th>
                <th style="width: 15%">Số kỳ thi</th>
                <th style="width: 20%">Xếp loại</th>
              </tr>
            </thead>
            <tbody>
              ${statsData.topStudents.map((student) => {
                const rankClass = student.rank <= 3 ? `rank-${student.rank}` : ""
                const rankIcon = student.rank === 1 ? "🥇" : student.rank === 2 ? "🥈" : student.rank === 3 ? "🥉" : `#${student.rank}`
                return `
                  <tr>
                    <td style="text-align: center" class="${rankClass}">${rankIcon}</td>
                    <td>${student.studentCode}</td>
                    <td>${student.studentName}</td>
                    <td style="text-align: center; font-weight: bold; color: #3b82f6">${student.averageScore.toFixed(1)}</td>
                    <td style="text-align: center">${student.totalExams}</td>
                    <td style="text-align: center">${getGradeLabel(student.averageScore)}</td>
                  </tr>
                `
              }).join("")}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Xuất từ hệ thống EduScore - ${now.toLocaleString("vi-VN")}</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
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
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} disabled={loading} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Xuất PDF
            </Button>
            <Button onClick={handleExportReport} disabled={loading} className="gap-2">
              <Download className="w-4 h-4" />
              Xuất CSV
            </Button>
          </div>
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
            <SelectItem value="all">Tất cả kỳ thi</SelectItem>
            {exams.map((exam) => (
              <SelectItem key={exam._id} value={exam._id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Đang tải dữ liệu...</span>
        </div>
      ) : (
      <>
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
            Trạng thái tài khoản học viên
          </h3>
          <div className="space-y-4">
            {Object.entries(statsData.studentStatus).map(([status, count]) => {
              const total = Object.values(statsData.studentStatus).reduce(
                (a, b) => a + b,
                0
              )
              const percentage = total > 0 ? (count / total) * 100 : 0
              const colors: Record<string, string> = {
                "Đang hoạt động": "bg-green-500",
                "Đã vô hiệu hóa": "bg-red-500",
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
      </>
      )}
    </div>
  )
}

