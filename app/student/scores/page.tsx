"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Search, Download, Award, BookOpen, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { scoresApi, authApi } from "@/lib/api"
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

type ExamScore = {
  examId: string
  examName: string
  examDate: string
  startTime: string
  endTime: string
  room: string
  status: string
  subject: {
    _id: string
    code: string
    name: string
  } | null
  class: {
    id: string
    code: string
    name: string
  } | null
  teacher: {
    name: string
    email: string
  } | null
  score: number | null
  isPublicExam?: boolean
}

// Hàm tính trạng thái kỳ thi dựa trên ngày giờ
const calculateExamStatus = (exam: { examDate: string; startTime?: string; endTime?: string }) => {
  const now = new Date()
  const examDate = new Date(exam.examDate)
  
  // Parse startTime và endTime
  const [startHour, startMin] = (exam.startTime || "08:00").split(":").map(Number)
  const [endHour, endMin] = (exam.endTime || "10:00").split(":").map(Number)
  
  // Tạo datetime bắt đầu và kết thúc
  const startDateTime = new Date(examDate)
  startDateTime.setHours(startHour, startMin, 0, 0)
  
  const endDateTime = new Date(examDate)
  endDateTime.setHours(endHour, endMin, 0, 0)
  
  if (now < startDateTime) {
    return "upcoming"
  } else if (now >= startDateTime && now <= endDateTime) {
    return "ongoing"
  } else {
    return "completed"
  }
}

export default function StudentScoresPage() {
  const toast = useToast()
  const [exams, setExams] = useState<ExamScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [userName, setUserName] = useState("")
  const [studentId, setStudentId] = useState("")

  // Lấy danh sách môn học unique từ exams
  const subjects = [
    { id: "all", name: "Tất cả môn thi" },
    ...Array.from(
      new Map(
        exams.map((e) => [e.subject?._id, { id: e.subject?._id, name: e.subject?.name }])
      ).values()
    ).filter((s) => s.id),
  ]

  // Fetch data
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        
        // Lấy thông tin user
        const userRes = await authApi.getMe() as { success: boolean; data: any }
        if (userRes.success) {
          setUserName(userRes.data.name)
          setStudentId(userRes.data.studentId || "")
        }
        
        const response = (await scoresApi.getMyExams()) as {
          success: boolean
          data: ExamScore[]
        }
        if (response.success) {
          setExams(response.data)
        }
      } catch (error: any) {
        toast.error("Lỗi", error.message || "Không thể tải dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }
    fetchExams()
  }, [])

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.examName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.class?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSubject =
      selectedSubject === "all" || exam.subject?._id === selectedSubject

    return matchesSearch && matchesSubject
  })

  // Chỉ tính điểm cho các kỳ thi đã có điểm
  const examsWithScores = filteredExams.filter((e) => e.score !== null)
  const totalExams = filteredExams.length
  const scoredExams = examsWithScores.length
  const averageScore =
    scoredExams > 0
      ? examsWithScores.reduce((sum, e) => sum + (e.score || 0), 0) / scoredExams
      : 0
  const highestScore =
    scoredExams > 0 ? Math.max(...examsWithScores.map((e) => e.score || 0)) : 0
  const lowestScore =
    scoredExams > 0 ? Math.min(...examsWithScores.map((e) => e.score || 0)) : 0

  const getExamStatusBadge = (exam: ExamScore) => {
    // Tính trạng thái tự động dựa trên ngày giờ
    const status = calculateExamStatus(exam)
    
    const badges: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
    }
    const labels: Record<string, string> = {
      upcoming: "Sắp thi",
      ongoing: "Đang thi",
      completed: "Đã thi",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badges[status] || badges.upcoming}`}>
        {labels[status] || status}
      </span>
    )
  }

  const handleExportPDF = () => {
    if (filteredExams.length === 0) {
      toast.error("Lỗi", "Không có dữ liệu để xuất")
      return
    }

    // Tạo nội dung HTML để in
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bảng điểm - ${userName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 20px; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 18pt; margin-bottom: 5px; }
          .header p { font-size: 11pt; color: #666; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-left, .info-right { font-size: 11pt; }
          .info-left p, .info-right p { margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 10pt; }
          th { background-color: #22c55e; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .score { font-weight: bold; color: #22c55e; text-align: center; }
          .no-score { color: #999; text-align: center; }
          .status { text-align: center; }
          .status-completed { color: #22c55e; }
          .status-ongoing { color: #eab308; }
          .status-upcoming { color: #3b82f6; }
          .footer { margin-top: 30px; text-align: right; font-size: 10pt; color: #666; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BẢNG ĐIỂM CÁ NHÂN</h1>
          <p>Hệ thống quản lý điểm thi EduScore</p>
        </div>
        
        <div class="info-section">
          <div class="info-left">
            <p><strong>Họ tên:</strong> ${userName}</p>
            <p><strong>Mã SV:</strong> ${studentId}</p>
            <p><strong>Ngày xuất:</strong> ${new Date().toLocaleDateString("vi-VN")}</p>
          </div>
          <div class="info-right">
            <p><strong>Tổng số kỳ thi:</strong> ${totalExams}</p>
            <p><strong>Điểm trung bình:</strong> ${averageScore.toFixed(2)}</p>
            <p><strong>Điểm cao nhất:</strong> ${highestScore.toFixed(1)}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 5%">STT</th>
              <th style="width: 20%">Tên kỳ thi</th>
              <th style="width: 15%">Môn thi</th>
              <th style="width: 10%">Lớp</th>
              <th style="width: 12%">Ngày thi</th>
              <th style="width: 12%">Giờ thi</th>
              <th style="width: 8%">Phòng</th>
              <th style="width: 10%">Trạng thái</th>
              <th style="width: 8%">Điểm</th>
            </tr>
          </thead>
          <tbody>
            ${filteredExams.map((exam, index) => {
              const status = calculateExamStatus(exam)
              const statusLabel = status === "completed" ? "Đã thi" : status === "ongoing" ? "Đang thi" : "Sắp thi"
              const statusClass = `status-${status}`
              return `
                <tr>
                  <td style="text-align: center">${index + 1}</td>
                  <td>${exam.examName || ""}</td>
                  <td>${exam.subject?.name || ""}</td>
                  <td>${exam.class?.name || ""}</td>
                  <td>${exam.examDate ? new Date(exam.examDate).toLocaleDateString("vi-VN") : "-"}</td>
                  <td>${exam.startTime} - ${exam.endTime}</td>
                  <td style="text-align: center">${exam.room || "-"}</td>
                  <td class="status ${statusClass}">${statusLabel}</td>
                  <td class="${exam.score !== null ? 'score' : 'no-score'}">${exam.score !== null ? exam.score.toFixed(1) : "Chưa có"}</td>
                </tr>
              `
            }).join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Xuất từ hệ thống EduScore - ${new Date().toLocaleString("vi-VN")}</p>
        </div>
      </body>
      </html>
    `

    // Mở cửa sổ in
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      
      // Đợi load xong rồi in
      setTimeout(() => {
        printWindow.print()
      }, 250)
      
      toast.success("Thành công", "Đang mở cửa sổ in PDF")
    } else {
      toast.error("Lỗi", "Không thể mở cửa sổ in. Vui lòng cho phép popup.")
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("vi-VN")
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tra cứu Điểm</h1>
              <p className="text-muted-foreground">
                Xem điểm các kỳ thi từ lớp học đã tham gia
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
            Xuất PDF
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng số kỳ thi</p>
              <p className="text-3xl font-bold">{totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
              <p className="text-3xl font-bold">{averageScore.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm cao nhất</p>
              <p className="text-3xl font-bold">{highestScore.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm thấp nhất</p>
              <p className="text-3xl font-bold">{lowestScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên kỳ thi, môn, lớp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[250px]">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo môn thi" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Exams Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border rounded-lg bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên kỳ thi</TableHead>
              <TableHead>Môn thi</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead>Ngày thi</TableHead>
              <TableHead>Giờ thi</TableHead>
              <TableHead>Phòng thi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExams.length > 0 ? (
              filteredExams.map((exam, index) => (
                <motion.tr
                  key={exam.examId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className="group hover:bg-muted/50"
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {exam.examName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {exam.isPublicExam ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Kỳ thi chung</span>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 text-primary" />
                          {exam.subject?.name || "-"}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{exam.class?.name || (exam.isPublicExam ? "-" : "-")}</span>
                  </TableCell>
                  <TableCell>{formatDate(exam.examDate)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {exam.startTime} - {exam.endTime}
                    </span>
                  </TableCell>
                  <TableCell>
                    {exam.room ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {exam.room}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getExamStatusBadge(exam)}</TableCell>
                  <TableCell>
                    {exam.score !== null ? (
                      <span className="text-lg font-bold text-green-500">
                        {exam.score.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Chưa có</span>
                    )}
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-muted-foreground/20" />
                    <p className="text-muted-foreground">
                      {exams.length === 0
                        ? "Bạn chưa tham gia lớp học nào có kỳ thi"
                        : "Không tìm thấy kỳ thi nào"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Score Chart */}
      {examsWithScores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Biểu đồ điểm
          </h3>
          <div className="space-y-4">
            {examsWithScores.slice(0, 10).map((exam, index) => {
              const percentage = ((exam.score || 0) / 10) * 100
              return (
                <div key={exam.examId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[300px]">
                      {exam.examName} ({exam.subject?.name})
                    </span>
                    <span className="text-muted-foreground">
                      {exam.score?.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-green-500"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
