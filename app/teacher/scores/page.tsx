"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  FileEdit,
  Search,
  Upload,
  Download,
  Loader2,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  School,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
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
import { classesApi, scoresApi, authApi } from "@/lib/api"
import * as XLSX from "xlsx"

type StudentScore = {
  _id: string
  studentId: string
  name: string
  email: string
  score: number | null
  note: string
  status: string
}

type ExamOption = {
  _id: string
  name: string
  examDate: string
  startTime: string
  endTime: string
  room: string
  className: string
  classId: string
  subjectName: string
}

export default function TeacherScoresPage() {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [exams, setExams] = useState<ExamOption[]>([])
  const [selectedExam, setSelectedExam] = useState("")
  const [students, setStudents] = useState<StudentScore[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentScore | null>(null)
  const [formData, setFormData] = useState({ score: "", note: "" })
  const [importData, setImportData] = useState<any[]>([])
  const [importFileName, setImportFileName] = useState("")

  // Fetch exams từ các lớp của giáo viên
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        const userRes = (await authApi.getMe()) as {
          success: boolean
          data: any
        }
        const classesRes = (await classesApi.getAll()) as {
          success: boolean
          data: any[]
        }

        console.log("User:", userRes.data)
        console.log("All classes:", classesRes.data)

        if (classesRes.success && userRes.success) {
          // Lọc lớp của giáo viên
          const teacherClasses = classesRes.data.filter((c: any) => {
            const teacherId = c.teacher?._id || c.teacher?.id || c.teacher
            const userId = userRes.data?._id || userRes.data?.id
            console.log("Comparing teacher:", teacherId, "with user:", userId)
            return teacherId === userId
          })

          console.log("Teacher classes:", teacherClasses)

          // Lấy tất cả kỳ thi từ các lớp
          const allExams: ExamOption[] = []
          teacherClasses.forEach((cls: any) => {
            console.log("Class:", cls.name, "Exams raw:", cls.exams)
            if (cls.exams && Array.isArray(cls.exams)) {
              cls.exams.forEach((exam: any) => {
                console.log("Processing exam:", exam)
                // Xử lý cả trường hợp exam là object đầy đủ hoặc chỉ là ObjectId string
                const examId = typeof exam === "string" ? exam : (exam?._id || exam?.id)
                const examName = typeof exam === "string" ? "" : exam?.name
                
                if (examId) {
                  // Nếu exam chỉ là string (ObjectId), vẫn thêm vào nhưng với thông tin hạn chế
                  allExams.push({
                    _id: examId,
                    name: examName || `Kỳ thi ${allExams.length + 1}`,
                    examDate: exam?.examDate || "",
                    startTime: exam?.startTime || "08:00",
                    endTime: exam?.endTime || "10:00",
                    room: exam?.room || "",
                    className: cls.name,
                    classId: cls._id,
                    subjectName: cls.subject?.name || exam?.subject?.name || "",
                  })
                }
              })
            }
          })
          console.log("Final exams list:", allExams)
          setExams(allExams)
        }
      } catch (error) {
        console.error("Error fetching exams:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchExams()
  }, [])

  // Fetch students khi chọn kỳ thi
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedExam) {
        setStudents([])
        return
      }
      
      try {
        setIsLoading(true)
        const res = await scoresApi.getStudentsForExam(selectedExam) as { 
          success: boolean
          data: { students: StudentScore[] }
        }
        
        if (res.success) {
          setStudents(res.data.students || [])
        }
      } catch (error: any) {
        toast.error("Lỗi", error.message || "Không thể tải danh sách sinh viên")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [selectedExam])

  const filteredStudents = students.filter(
    (student) =>
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (student: StudentScore) => {
    setEditingStudent(student)
    setFormData({
      score: student.score?.toString() || "",
      note: student.note || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingStudent || !formData.score) return
    
    try {
      setIsSaving(true)
      await scoresApi.create({
        student: editingStudent._id,
        exam: selectedExam,
        score: parseFloat(formData.score),
        note: formData.note,
      })
      
      // Cập nhật local state
      setStudents(students.map(s => 
        s._id === editingStudent._id 
          ? { ...s, score: parseFloat(formData.score), note: formData.note, status: "entered" }
          : s
      ))
      
      toast.success("Thành công", "Đã lưu điểm")
      setIsDialogOpen(false)
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể lưu điểm")
    } finally {
      setIsSaving(false)
    }
  }

  // Xử lý import Excel
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFileName(file.name)
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)
        
        // Map dữ liệu từ Excel
        const mappedData = jsonData.map((row: any) => {
          // Tìm sinh viên theo mã SV - hỗ trợ nhiều tên cột
          const studentId = 
            row["Mã SV"] || row["MaSV"] || row["Mã sinh viên"] || 
            row["MSSV"] || row["Ma SV"] || row["studentId"] || 
            row["StudentId"] || row["ID"] || row["id"] || ""
          
          // Điểm - hỗ trợ nhiều tên cột
          const score = 
            row["Điểm"] || row["Diem"] || row["Score"] || row["score"] || 
            row["Điểm số"] || row["DiemSo"] || row["Point"] || row["point"] || null
          
          // Ghi chú - hỗ trợ nhiều tên cột
          const note = 
            row["Ghi chú"] || row["GhiChu"] || row["Ghi chu"] || 
            row["Note"] || row["note"] || row["Nhận xét"] || row["NhanXet"] || ""
          
          // Họ tên - hỗ trợ nhiều tên cột
          const nameFromExcel = 
            row["Họ tên"] || row["HoTen"] || row["Ho ten"] || row["Họ và tên"] ||
            row["Name"] || row["name"] || row["Tên"] || row["Ten"] || ""
          
          const student = students.find(s => s.studentId === studentId.toString())
          
          return {
            studentId: studentId.toString(),
            studentName: student?.name || nameFromExcel || "Không tìm thấy",
            score: score !== null && score !== "" ? parseFloat(score) : null,
            note,
            found: !!student,
            _id: student?._id || null,
          }
        })
        
        setImportData(mappedData)
        setIsImportDialogOpen(true)
      } catch (error) {
        toast.error("Lỗi", "Không thể đọc file Excel")
      }
    }
    reader.readAsBinaryString(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImportConfirm = async () => {
    const validData = importData.filter(d => d.found && d.score !== null && d._id)
    
    if (validData.length === 0) {
      toast.error("Lỗi", "Không có dữ liệu hợp lệ để import")
      return
    }
    
    try {
      setIsSaving(true)
      const res = await scoresApi.import({
        examId: selectedExam,
        scores: validData.map(d => ({
          studentId: d._id,
          score: d.score,
          note: d.note,
        })),
      }) as { success: boolean; message: string; data: any }
      
      if (res.success) {
        toast.success("Thành công", res.message)
        
        // Refresh danh sách
        const refreshRes = await scoresApi.getStudentsForExam(selectedExam) as { 
          success: boolean
          data: { students: StudentScore[] }
        }
        if (refreshRes.success) {
          setStudents(refreshRes.data.students || [])
        }
      }
      
      setIsImportDialogOpen(false)
      setImportData([])
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể import điểm")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadTemplate = () => {
    // Tạo template Excel
    const templateData = students.map(s => ({
      "Mã SV": s.studentId,
      "Họ tên": s.name,
      "Điểm": s.score ?? "",
      "Ghi chú": s.note || "",
    }))
    
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Điểm")
    
    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Mã SV
      { wch: 30 }, // Họ tên
      { wch: 10 }, // Điểm
      { wch: 30 }, // Ghi chú
    ]
    
    const examName = exams.find(e => e._id === selectedExam)?.name || "exam"
    XLSX.writeFile(wb, `Template_Diem_${examName.replace(/\s+/g, "_")}.xlsx`)
    
    toast.success("Thành công", "Đã tải template Excel")
  }

  // Xuất PDF danh sách điểm
  const handleExportPDF = () => {
    if (!selectedExam || students.length === 0) {
      toast.error("Lỗi", "Vui lòng chọn kỳ thi và có sinh viên để xuất")
      return
    }

    const exam = exams.find(e => e._id === selectedExam)
    if (!exam) return

    // Tính thống kê
    const studentsWithScores = students.filter(s => s.score !== null)
    const avgScore = studentsWithScores.length > 0 
      ? studentsWithScores.reduce((sum, s) => sum + (s.score || 0), 0) / studentsWithScores.length 
      : 0
    const passCount = studentsWithScores.filter(s => (s.score || 0) >= 5).length
    const failCount = studentsWithScores.filter(s => (s.score || 0) < 5).length

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bảng điểm - ${exam.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 20px; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 18pt; margin-bottom: 5px; }
          .header p { font-size: 11pt; color: #666; }
          .info-section { margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
          .info-item { font-size: 11pt; }
          .info-item strong { color: #333; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .stat-box { border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; }
          .stat-box .value { font-size: 18pt; font-weight: bold; color: #3b82f6; }
          .stat-box .label { font-size: 9pt; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 10pt; }
          th { background-color: #3b82f6; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .score { font-weight: bold; text-align: center; }
          .score-pass { color: #22c55e; }
          .score-fail { color: #ef4444; }
          .no-score { color: #999; text-align: center; }
          .grade { text-align: center; }
          .footer { margin-top: 30px; text-align: right; font-size: 10pt; color: #666; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BẢNG ĐIỂM KỲ THI</h1>
          <p>Hệ thống quản lý điểm thi EduScore</p>
        </div>
        
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item"><strong>Tên kỳ thi:</strong> ${exam.name}</div>
            <div class="info-item"><strong>Lớp:</strong> ${exam.className}</div>
            <div class="info-item"><strong>Môn thi:</strong> ${exam.subjectName || "-"}</div>
            <div class="info-item"><strong>Phòng thi:</strong> ${exam.room || "-"}</div>
            <div class="info-item"><strong>Ngày thi:</strong> ${exam.examDate ? new Date(exam.examDate).toLocaleDateString("vi-VN") : "-"}</div>
            <div class="info-item"><strong>Giờ thi:</strong> ${exam.startTime} - ${exam.endTime}</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="value">${students.length}</div>
              <div class="label">Tổng sinh viên</div>
            </div>
            <div class="stat-box">
              <div class="value">${enteredCount}/${totalCount}</div>
              <div class="label">Đã nhập điểm</div>
            </div>
            <div class="stat-box">
              <div class="value" style="color: #22c55e">${passCount}</div>
              <div class="label">Đạt (≥5)</div>
            </div>
            <div class="stat-box">
              <div class="value" style="color: #ef4444">${failCount}</div>
              <div class="label">Không đạt (<5)</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 5%">STT</th>
              <th style="width: 15%">Mã SV</th>
              <th style="width: 25%">Họ và tên</th>
              <th style="width: 10%">Điểm</th>
              <th style="width: 15%">Xếp loại</th>
              <th style="width: 20%">Ghi chú</th>
              <th style="width: 10%">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents.map((student, index) => {
              const grade = getGrade(student.score)
              const isPass = student.score !== null && student.score >= 5
              return `
                <tr>
                  <td style="text-align: center">${index + 1}</td>
                  <td>${student.studentId}</td>
                  <td>${student.name}</td>
                  <td class="score ${student.score !== null ? (isPass ? 'score-pass' : 'score-fail') : 'no-score'}">
                    ${student.score !== null ? student.score.toFixed(1) : "-"}
                  </td>
                  <td class="grade">${grade.label}</td>
                  <td>${student.note || "-"}</td>
                  <td style="text-align: center">${student.status === "entered" ? "Đã nhập" : "Chưa nhập"}</td>
                </tr>
              `
            }).join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Điểm trung bình: <strong>${avgScore.toFixed(2)}</strong> | Tỷ lệ đạt: <strong>${studentsWithScores.length > 0 ? ((passCount / studentsWithScores.length) * 100).toFixed(1) : 0}%</strong></p>
          <p style="margin-top: 5px">Xuất từ hệ thống EduScore - ${new Date().toLocaleString("vi-VN")}</p>
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
      
      toast.success("Thành công", "Đang mở cửa sổ in PDF")
    } else {
      toast.error("Lỗi", "Không thể mở cửa sổ in. Vui lòng cho phép popup.")
    }
  }

  const getGrade = (score: number | null) => {
    if (score === null) return { label: "-", color: "text-gray-500" }
    if (score >= 9.0) return { label: "Xuất sắc", color: "text-purple-500" }
    if (score >= 8.0) return { label: "Giỏi", color: "text-blue-500" }
    if (score >= 7.0) return { label: "Khá", color: "text-green-500" }
    if (score >= 5.5) return { label: "Trung bình", color: "text-yellow-500" }
    if (score >= 4.0) return { label: "Yếu", color: "text-orange-500" }
    return { label: "Kém", color: "text-red-500" }
  }

  const enteredCount = students.filter((s) => s.score !== null).length
  const totalCount = students.length

  return (
    <div className="p-6 space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <FileEdit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Nhập điểm</h1>
            <p className="text-muted-foreground">
              Nhập điểm cho học viên hoặc import từ Excel
            </p>
          </div>
        </div>
      </motion.div>

      {/* Exam Selection & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card border rounded-lg p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="exam">Chọn kỳ thi</Label>
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kỳ thi để nhập điểm" />
              </SelectTrigger>
              <SelectContent>
                {exams.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Chưa có kỳ thi nào
                  </div>
                ) : (
                  exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} - {exam.className}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownloadTemplate}
              disabled={!selectedExam || students.length === 0}
            >
              <Download className="w-4 h-4" />
              Tải template
            </Button>
            <Button
              className="gap-2 bg-blue-500 hover:bg-blue-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedExam || students.length === 0}
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportPDF}
              disabled={!selectedExam || students.length === 0}
            >
              <FileText className="w-4 h-4" />
              Xuất PDF
            </Button>
          </div>
        </div>

        {selectedExam && students.length > 0 && (
          <div className="space-y-4">
            {/* Thông tin kỳ thi */}
            {(() => {
              const exam = exams.find(e => e._id === selectedExam)
              if (!exam) return null
              return (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Thông tin kỳ thi đang nhập điểm
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Tên kỳ thi</p>
                        <p className="font-medium">{exam.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Lớp</p>
                        <p className="font-medium">{exam.className}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Ngày thi</p>
                        <p className="font-medium">
                          {exam.examDate ? new Date(exam.examDate).toLocaleDateString("vi-VN") : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Giờ thi</p>
                        <p className="font-medium">{exam.startTime} - {exam.endTime}</p>
                      </div>
                    </div>
                    {exam.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-muted-foreground">Phòng thi</p>
                          <p className="font-medium">{exam.room}</p>
                        </div>
                      </div>
                    )}
                    {exam.subjectName && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Môn thi</p>
                          <p className="font-medium">{exam.subjectName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Tiến độ */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tiến độ nhập điểm</p>
                  <p className="text-2xl font-bold">
                    {enteredCount}/{totalCount}
                  </p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {totalCount > 0 ? Math.round((enteredCount / totalCount) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Search */}
      {selectedExam && students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã SV, tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Students Table */}
      {!isLoading && selectedExam && students.length > 0 && (
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
                <TableHead>Mã SV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Xếp loại</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => {
                const grade = getGrade(student.score)
                return (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="group"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono font-medium">
                      {student.studentId}
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      {student.score !== null ? (
                        <span className="text-lg font-bold text-blue-500">
                          {student.score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${grade.color}`}>
                        {grade.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {student.note || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        student.status === "entered" 
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                      }`}>
                        {student.status === "entered" ? "Đã nhập" : "Chưa nhập"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(student)}
                      >
                        <FileEdit className="w-4 h-4 mr-2" />
                        Nhập điểm
                      </Button>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Empty States */}
      {!isLoading && !selectedExam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <FileEdit className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {exams.length === 0 ? "Chưa có kỳ thi nào" : "Chọn kỳ thi để bắt đầu"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {exams.length === 0 
              ? "Bạn chưa được phân công lớp học nào có kỳ thi. Vui lòng liên hệ Admin để được thêm vào lớp và kỳ thi."
              : "Vui lòng chọn kỳ thi từ dropdown ở trên để bắt đầu nhập điểm cho học viên"
            }
          </p>
        </motion.div>
      )}

      {!isLoading && selectedExam && students.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <AlertCircle className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có sinh viên</h3>
          <p className="text-muted-foreground max-w-md">
            Lớp học chưa có sinh viên nào tham gia
          </p>
        </motion.div>
      )}

      {/* Edit Score Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập điểm</DialogTitle>
            <DialogDescription>
              Nhập điểm cho học viên {editingStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã sinh viên</Label>
                <Input value={editingStudent?.studentId || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <Input value={editingStudent?.name || ""} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">
                Điểm <span className="text-destructive">*</span>
              </Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="8.5"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Thang điểm 0-10</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Nhận xét về bài thi..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!formData.score || isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu điểm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              Xem trước dữ liệu import
            </DialogTitle>
            <DialogDescription>
              File: {importFileName} - {importData.length} dòng dữ liệu
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{row.studentId}</TableCell>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell>
                      {row.score !== null ? (
                        <span className="font-bold text-blue-500">{row.score}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.note || "-"}
                    </TableCell>
                    <TableCell>
                      {row.found ? (
                        row.score !== null ? (
                          <span className="inline-flex items-center gap-1 text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-500">
                            <AlertCircle className="w-4 h-4" />
                            Thiếu điểm
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          Không tìm thấy
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">
                {importData.filter(d => d.found && d.score !== null).length}
              </span> hợp lệ / {importData.length} dòng
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button 
                onClick={handleImportConfirm} 
                disabled={isSaving || importData.filter(d => d.found && d.score !== null).length === 0}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import {importData.filter(d => d.found && d.score !== null).length} điểm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
