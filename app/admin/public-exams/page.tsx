"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Users,
  Loader2,
  Eye,
  Edit,
  Save,
  X,
  Award,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { examsApi, scoresApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
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
import * as XLSX from "xlsx"

type PublicExam = {
  _id: string
  code: string
  name: string
  examDate: string
  startTime: string
  endTime: string
  room?: string
  status: string
  participants: { _id: string; name: string; studentId: string }[]
  maxParticipants?: number
}

type Participant = {
  _id: string
  name: string
  email: string
  studentId: string
  phone?: string
  score: number | null
  note: string
}

type ImportRow = {
  studentId: string
  studentName: string
  score: number | null
  note: string
  found: boolean
  _id: string | null
}

export default function AdminPublicExamsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exams, setExams] = useState<PublicExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<PublicExam | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState("")
  const [editNote, setEditNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Import states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importData, setImportData] = useState<ImportRow[]>([])
  const [importFileName, setImportFileName] = useState("")

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setIsLoading(true)
      const res = await examsApi.getPublic()
      if (res.success) {
        setExams(res.data)
      }
    } catch (error) {
      console.error("Fetch public exams error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewParticipants = async (exam: PublicExam) => {
    setSelectedExam(exam)
    setIsDialogOpen(true)
    setIsLoadingParticipants(true)
    setSearchQuery("")

    try {
      const res = await examsApi.getParticipants(exam._id)
      if (res.success) {
        setParticipants(res.data.participants || [])
      }
    } catch (error) {
      console.error("Fetch participants error:", error)
      toast({ title: "Lỗi", description: "Không thể tải danh sách", variant: "destructive" })
    } finally {
      setIsLoadingParticipants(false)
    }
  }

  const handleEditScore = (p: Participant) => {
    setEditingId(p._id)
    setEditScore(p.score?.toString() || "")
    setEditNote(p.note || "")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditScore("")
    setEditNote("")
  }

  const handleSaveScore = async (studentId: string) => {
    if (!selectedExam) return
    const scoreValue = parseFloat(editScore)
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 10) {
      toast({ title: "Lỗi", description: "Điểm phải từ 0 đến 10", variant: "destructive" })
      return
    }
    try {
      setIsSaving(true)
      await scoresApi.create({ student: studentId, exam: selectedExam._id, score: scoreValue, note: editNote })
      setParticipants(participants.map((p) => p._id === studentId ? { ...p, score: scoreValue, note: editNote } : p))
      toast({ title: "Thành công", description: "Đã lưu điểm" })
      setEditingId(null)
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể lưu điểm", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Xuất Excel template
  const handleDownloadTemplate = () => {
    if (!selectedExam || participants.length === 0) return
    
    const templateData = participants.map((p, idx) => ({
      "STT": idx + 1,
      "Mã SV": p.studentId,
      "Họ tên": p.name,
      "Email": p.email,
      "Điểm": p.score ?? "",
      "Ghi chú": p.note || "",
    }))
    
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách điểm")
    
    ws["!cols"] = [
      { wch: 5 },  // STT
      { wch: 15 }, // Mã SV
      { wch: 25 }, // Họ tên
      { wch: 25 }, // Email
      { wch: 8 },  // Điểm
      { wch: 30 }, // Ghi chú
    ]
    
    const fileName = `Diem_${selectedExam.code}_${selectedExam.name.replace(/\s+/g, "_")}.xlsx`
    XLSX.writeFile(wb, fileName)
    toast({ title: "Thành công", description: "Đã tải file Excel" })
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
        
        const mappedData: ImportRow[] = jsonData.map((row: any) => {
          const studentId = row["Mã SV"] || row["MaSV"] || row["MSSV"] || row["studentId"] || ""
          const score = row["Điểm"] || row["Diem"] || row["Score"] || row["score"] || null
          const note = row["Ghi chú"] || row["GhiChu"] || row["Note"] || row["note"] || ""
          const nameFromExcel = row["Họ tên"] || row["HoTen"] || row["Name"] || ""
          
          const student = participants.find(s => s.studentId === studentId.toString())
          
          return {
            studentId: studentId.toString(),
            studentName: student?.name || nameFromExcel || "Không tìm thấy",
            score: score !== null && score !== "" ? parseFloat(score) : null,
            note: note.toString(),
            found: !!student,
            _id: student?._id || null,
          }
        })
        
        setImportData(mappedData)
        setIsImportDialogOpen(true)
      } catch {
        toast({ title: "Lỗi", description: "Không thể đọc file Excel", variant: "destructive" })
      }
    }
    reader.readAsBinaryString(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleImportConfirm = async () => {
    if (!selectedExam) return
    const validData = importData.filter(d => d.found && d.score !== null && d._id)
    
    if (validData.length === 0) {
      toast({ title: "Lỗi", description: "Không có dữ liệu hợp lệ", variant: "destructive" })
      return
    }
    
    try {
      setIsSaving(true)
      const res = await scoresApi.import({
        examId: selectedExam._id,
        scores: validData.map(d => ({ studentId: d._id!, score: d.score!, note: d.note })),
      })
      
      if (res.success) {
        toast({ title: "Thành công", description: `Đã import ${validData.length} điểm` })
        // Refresh danh sách
        const refreshRes = await examsApi.getParticipants(selectedExam._id)
        if (refreshRes.success) setParticipants(refreshRes.data.participants || [])
      }
      setIsImportDialogOpen(false)
      setImportData([])
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể import", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Xuất PDF
  const handleExportPDF = () => {
    if (!selectedExam || participants.length === 0) return
    
    const studentsWithScores = participants.filter(s => s.score !== null)
    const avgScore = studentsWithScores.length > 0 
      ? studentsWithScores.reduce((sum, s) => sum + (s.score || 0), 0) / studentsWithScores.length 
      : 0
    const passCount = studentsWithScores.filter(s => (s.score || 0) >= 5).length
    const enteredCount = studentsWithScores.length

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bảng điểm - ${selectedExam.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 20px; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 16pt; margin-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; font-size: 11pt; }
          .stats { display: flex; gap: 20px; margin-bottom: 15px; font-size: 11pt; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 6px; text-align: left; font-size: 10pt; }
          th { background-color: #3b82f6; color: white; }
          tr:nth-child(even) { background-color: #f5f5f5; }
          .score-pass { color: #22c55e; font-weight: bold; }
          .score-fail { color: #ef4444; font-weight: bold; }
          .footer { margin-top: 20px; text-align: right; font-size: 10pt; color: #666; }
          @media print { body { padding: 0; } @page { margin: 1cm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BẢNG ĐIỂM KỲ THI CHUNG</h1>
          <p>${selectedExam.name} (${selectedExam.code})</p>
        </div>
        <div class="info-grid">
          <div><strong>Ngày thi:</strong> ${formatDate(selectedExam.examDate)}</div>
          <div><strong>Giờ thi:</strong> ${selectedExam.startTime} - ${selectedExam.endTime}</div>
          <div><strong>Phòng thi:</strong> ${selectedExam.room || "-"}</div>
          <div><strong>Tổng thí sinh:</strong> ${participants.length}</div>
        </div>
        <div class="stats">
          <span>Đã nhập: ${enteredCount}/${participants.length}</span>
          <span>Đạt: ${passCount}</span>
          <span>TB: ${avgScore.toFixed(2)}</span>
        </div>
        <table>
          <thead><tr><th>STT</th><th>Mã SV</th><th>Họ tên</th><th>Email</th><th>Điểm</th><th>Xếp loại</th><th>Ghi chú</th></tr></thead>
          <tbody>
            ${filteredParticipants.map((p, idx) => {
              const grade = getGrade(p.score)
              const isPass = p.score !== null && p.score >= 5
              return `<tr>
                <td style="text-align:center">${idx + 1}</td>
                <td>${p.studentId}</td>
                <td>${p.name}</td>
                <td>${p.email}</td>
                <td class="${p.score !== null ? (isPass ? 'score-pass' : 'score-fail') : ''}" style="text-align:center">${p.score !== null ? p.score.toFixed(1) : "-"}</td>
                <td style="text-align:center">${grade.label}</td>
                <td>${p.note || "-"}</td>
              </tr>`
            }).join("")}
          </tbody>
        </table>
        <div class="footer">Xuất từ EduScore - ${new Date().toLocaleString("vi-VN")}</div>
      </body>
      </html>
    `
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("vi-VN")
  
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = { upcoming: "bg-blue-100 text-blue-700", ongoing: "bg-green-100 text-green-700", completed: "bg-gray-100 text-gray-700" }
    const labels: Record<string, string> = { upcoming: "Sắp diễn ra", ongoing: "Đang diễn ra", completed: "Đã kết thúc" }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || ""}`}>{labels[status] || status}</span>
  }

  const getGrade = (score: number | null) => {
    if (score === null) return { label: "-", color: "text-gray-500" }
    if (score >= 9.0) return { label: "Xuất sắc", color: "text-purple-600" }
    if (score >= 8.0) return { label: "Giỏi", color: "text-blue-600" }
    if (score >= 7.0) return { label: "Khá", color: "text-green-600" }
    if (score >= 5.5) return { label: "TB", color: "text-yellow-600" }
    return { label: "Yếu", color: "text-red-600" }
  }

  const filteredParticipants = participants.filter(p =>
    p.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enteredCount = participants.filter(p => p.score !== null).length

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="p-8">
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Quản lý Kỳ thi chung
          </h1>
          <p className="text-muted-foreground mt-2">Xem danh sách đăng ký và nhập điểm cho kỳ thi chung</p>
        </div>

        {exams.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có kỳ thi chung nào</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam, index) => (
              <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{exam.name}</CardTitle>
                        <CardDescription>Mã: {exam.code}</CardDescription>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(exam.examDate)}</span>
                      <span className="text-muted-foreground">({exam.startTime} - {exam.endTime})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{exam.participants?.length || 0}{exam.maxParticipants && ` / ${exam.maxParticipants}`} thí sinh</span>
                    </div>
                    <Button className="w-full mt-4" variant="outline" onClick={() => handleViewParticipants(exam)}>
                      <Eye className="w-4 h-4 mr-2" />Xem danh sách & Nhập điểm
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Dialog danh sách thí sinh */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Danh sách thí sinh - {selectedExam?.name}</DialogTitle>
            <DialogDescription>
              Ngày: {selectedExam && formatDate(selectedExam.examDate)} | Giờ: {selectedExam?.startTime} - {selectedExam?.endTime}
              {selectedExam?.room && ` | Phòng: ${selectedExam.room}`}
            </DialogDescription>
          </DialogHeader>

          {/* Actions */}
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2 py-2 border-b">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Tìm theo mã SV, tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}><Download className="w-4 h-4 mr-1" />Xuất Excel</Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-1" />Import Excel</Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}><FileText className="w-4 h-4 mr-1" />Xuất PDF</Button>
            </div>
          )}

          {/* Progress */}
          {participants.length > 0 && (
            <div className="flex items-center gap-4 py-2 px-3 bg-muted/50 rounded-lg text-sm">
              <span>Tiến độ: <strong>{enteredCount}/{participants.length}</strong></span>
              <span className="text-primary font-medium">{participants.length > 0 ? Math.round((enteredCount / participants.length) * 100) : 0}%</span>
            </div>
          )}

          {isLoadingParticipants ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : participants.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Chưa có thí sinh đăng ký</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-20">Điểm</TableHead>
                  <TableHead className="w-24">Xếp loại</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((p, idx) => (
                  <TableRow key={p._id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-mono">{p.studentId}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                    <TableCell>
                      {editingId === p._id ? (
                        <Input type="number" min="0" max="10" step="0.1" value={editScore} onChange={(e) => setEditScore(e.target.value)} className="w-16 h-8" />
                      ) : p.score !== null ? (
                        <span className="font-bold text-primary">{p.score.toFixed(1)}</span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {p.score !== null && <span className={`text-sm font-medium ${getGrade(p.score).color}`}><Award className="w-3 h-3 inline mr-1" />{getGrade(p.score).label}</span>}
                    </TableCell>
                    <TableCell>
                      {editingId === p._id ? (
                        <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Ghi chú..." className="h-8" />
                      ) : <span className="text-sm text-muted-foreground">{p.note || "-"}</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === p._id ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="default" onClick={() => handleSaveScore(p._id)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}><X className="w-4 h-4" /></Button>
                        </div>
                      ) : <Button size="sm" variant="ghost" onClick={() => handleEditScore(p)}><Edit className="w-4 h-4" /></Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import điểm từ Excel</DialogTitle>
            <DialogDescription>File: {importFileName} - Kiểm tra dữ liệu trước khi import</DialogDescription>
          </DialogHeader>
          
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
              {importData.map((row, idx) => (
                <TableRow key={idx} className={!row.found ? "bg-red-50" : ""}>
                  <TableCell className="font-mono">{row.studentId}</TableCell>
                  <TableCell>{row.studentName}</TableCell>
                  <TableCell>{row.score !== null ? row.score.toFixed(1) : "-"}</TableCell>
                  <TableCell className="text-sm">{row.note || "-"}</TableCell>
                  <TableCell>
                    {row.found && row.score !== null ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />Hợp lệ</span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" />{!row.found ? "Không tìm thấy" : "Thiếu điểm"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="py-2 text-sm">
            <span className="text-green-600 font-medium">{importData.filter(d => d.found && d.score !== null).length}</span> hợp lệ / 
            <span className="text-red-600 font-medium ml-1">{importData.filter(d => !d.found || d.score === null).length}</span> lỗi
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleImportConfirm} disabled={isSaving || importData.filter(d => d.found && d.score !== null).length === 0}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import {importData.filter(d => d.found && d.score !== null).length} điểm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
