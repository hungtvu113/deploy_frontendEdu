"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Award,
  Filter,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { examsApi, usersApi, scoresApi } from "@/lib/api"

type Score = {
  id: string
  examId: string
  examName: string
  studentId: string
  studentCode: string
  studentName: string
  score: number
  notes: string
  enteredBy: string
  enteredDate: string
  createdAt: string
}

type Exam = {
  _id: string
  name: string
  subject?: { code: string; name: string }
}

type Student = {
  _id: string
  studentId: string
  name: string
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterExamId, setFilterExamId] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [deletingScore, setDeletingScore] = useState<Score | null>(null)
  const [formData, setFormData] = useState({
    examId: "",
    studentId: "",
    score: "",
    notes: "",
  })

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [examsRes, usersRes] = await Promise.all([
          examsApi.getAll(),
          usersApi.getAll(),
        ])
        
        setExams(examsRes.data || [])
        // Filter only students
        const studentUsers = (usersRes.data || []).filter((u: any) => u.role === "student")
        setStudents(studentUsers)
        
        // Fetch scores for all exams
        const allScores: Score[] = []
        for (const exam of examsRes.data || []) {
          try {
            const scoresRes = await scoresApi.getByExam(exam._id)
            const examScores = (scoresRes.data || []).map((s: any) => ({
              id: s._id,
              examId: exam._id,
              examName: exam.name,
              studentId: s.student?._id || "",
              studentCode: s.student?.studentId || "",
              studentName: s.student?.name || "",
              score: s.score,
              notes: s.note || "",
              enteredBy: s.enteredBy?.name || "Admin",
              enteredDate: s.enteredAt || s.createdAt,
              createdAt: s.createdAt,
            }))
            allScores.push(...examScores)
          } catch (err) {
            console.log(`No scores for exam ${exam._id}`)
          }
        }
        setScores(allScores)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredScores = scores.filter((score) => {
    const matchesSearch =
      score.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      score.examName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterExamId === "all" || score.examId === filterExamId

    return matchesSearch && matchesFilter
  })

  const handleAdd = () => {
    setEditingScore(null)
    setFormData({
      examId: "",
      studentId: "",
      score: "",
      notes: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (score: Score) => {
    setEditingScore(score)
    setFormData({
      examId: score.examId,
      studentId: score.studentId,
      score: score.score.toString(),
      notes: score.notes,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (score: Score) => {
    setDeletingScore(score)
    setIsDeleteDialogOpen(true)
  }

  const handleSave = async () => {
    const exam = exams.find((e) => e._id === formData.examId)
    const student = students.find((s) => s._id === formData.studentId)

    if (!exam || !student) return

    try {
      if (editingScore) {
        // Update score - API chưa có update, tạm thời update local
        setScores(
          scores.map((s) =>
            s.id === editingScore.id
              ? {
                  ...s,
                  examId: formData.examId,
                  examName: exam.name,
                  studentId: formData.studentId,
                  studentCode: student.studentId || "",
                  studentName: student.name,
                  score: parseFloat(formData.score),
                  notes: formData.notes,
                  enteredDate: new Date().toISOString().split("T")[0],
                }
              : s
          )
        )
      } else {
        // Create new score
        await scoresApi.create({
          student: formData.studentId,
          exam: formData.examId,
          score: parseFloat(formData.score),
          note: formData.notes,
        })
        
        const newScore: Score = {
          id: Date.now().toString(),
          examId: formData.examId,
          examName: exam.name,
          studentId: formData.studentId,
          studentCode: student.studentId || "",
          studentName: student.name,
          score: parseFloat(formData.score),
          notes: formData.notes,
          enteredBy: "Admin User",
          enteredDate: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString().split("T")[0],
        }
        setScores([...scores, newScore])
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra")
    }
  }

  const confirmDelete = async () => {
    if (deletingScore) {
      try {
        await scoresApi.delete(deletingScore.id)
        setScores(scores.filter((s) => s.id !== deletingScore.id))
        setIsDeleteDialogOpen(false)
        setDeletingScore(null)
      } catch (error: any) {
        alert(error.message || "Không thể xóa điểm")
      }
    }
  }

  const handleCleanup = async () => {
    if (!confirm("Bạn có chắc muốn xóa tất cả điểm không có kỳ thi hợp lệ?")) return
    
    try {
      const res = await scoresApi.cleanupOrphans()
      alert(res.message || "Đã dọn dẹp xong!")
      // Reload data
      window.location.reload()
    } catch (error: any) {
      alert(error.message || "Không thể dọn dẹp dữ liệu")
    }
  }

  const getGrade = (score: number) => {
    if (score >= 9.0) return { label: "Xuất sắc", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" }
    if (score >= 8.0) return { label: "Giỏi", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" }
    if (score >= 7.0) return { label: "Khá", color: "text-green-500 bg-green-500/10 border-green-500/20" }
    if (score >= 5.5) return { label: "Trung bình", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" }
    if (score >= 4.0) return { label: "Yếu", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" }
    return { label: "Kém", color: "text-red-500 bg-red-500/10 border-red-500/20" }
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
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quản lý Điểm</h1>
            <p className="text-muted-foreground">
              Quản lý điểm thi của học viên
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
              placeholder="Tìm kiếm theo mã SV, tên, kỳ thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 min-w-[250px]">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterExamId} onValueChange={setFilterExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo kỳ thi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kỳ thi</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    {exam.subject?.code || ""} - {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCleanup} variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Dọn dẹp
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Nhập điểm
          </Button>
        </div>
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
              <TableHead>Mã SV</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Kỳ thi</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Xếp loại</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Người nhập</TableHead>
              <TableHead>Ngày nhập</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredScores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-12 h-12 opacity-20" />
                    <p>Không tìm thấy điểm nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredScores.map((score, index) => {
                const grade = getGrade(score.score)
                return (
                  <motion.tr
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell className="font-mono font-medium">
                      {score.studentCode}
                    </TableCell>
                    <TableCell className="font-medium">{score.studentName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {score.examName}
                    </TableCell>
                    <TableCell>
                      <span className="text-lg font-bold text-primary">
                        {score.score.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${grade.color}`}
                      >
                        <Award className="w-3 h-3" />
                        {grade.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                      {score.notes || "-"}
                    </TableCell>
                    <TableCell className="text-sm">{score.enteredBy}</TableCell>
                    <TableCell>
                      {new Date(score.enteredDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(score)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(score)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingScore ? "Chỉnh sửa điểm" : "Nhập điểm mới"}
            </DialogTitle>
            <DialogDescription>
              {editingScore
                ? "Cập nhật điểm thi của học viên"
                : "Nhập điểm thi cho học viên"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="examId">
                Kỳ thi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.examId}
                onValueChange={(value) => setFormData({ ...formData, examId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỳ thi" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.subject?.code || ""} - {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">
                Học viên <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => setFormData({ ...formData, studentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn học viên" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.studentId} - {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (value >= 0 && value <= 10) {
                    setFormData({ ...formData, score: e.target.value })
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Thang điểm 0-10</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Nhận xét về bài thi..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.examId || !formData.studentId || !formData.score}
            >
              {editingScore ? "Cập nhật" : "Lưu"}
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
              Bạn có chắc chắn muốn xóa điểm của học viên{" "}
              <span className="font-semibold">{deletingScore?.studentName}</span> trong
              kỳ thi <span className="font-semibold">{deletingScore?.examName}</span>?
              Hành động này không thể hoàn tác.
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
    </div>
  )
}

