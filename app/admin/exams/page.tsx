"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Calendar, Clock, BookOpen, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subjectsApi, examsApi } from "@/lib/api"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Exam = {
  id: string
  code: string
  name: string
  subjectId: string
  subjectName: string
  examDate: string
  startTime: string // Giờ bắt đầu (HH:mm)
  endTime: string // Giờ kết thúc (HH:mm)
  room: string // Phòng thi
  duration: number
  description: string
  status: string
  createdAt: string
}

type Subject = {
  id: string
  code: string
  name: string
}

export default function ExamsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    subjectId: "",
    examDate: "",
    startTime: "08:00", // Giờ bắt đầu mặc định
    endTime: "10:00", // Giờ kết thúc mặc định
    room: "", // Phòng thi
    duration: "",
    description: "",
    semester: "HK1",
    academicYear: "2024-2025",
    status: "auto", // auto = tự động tính theo ngày/giờ, hoặc upcoming/ongoing/completed
  })

  // Tính trạng thái tự động dựa trên ngày và giờ thi
  const calculateStatus = (examDate: string, startTime: string, endTime: string): string => {
    if (!examDate) return "upcoming"

    const now = new Date()

    // Parse ngày thi - tách ra year, month, day để tránh vấn đề timezone
    const [year, month, day] = examDate.split("-").map(Number)

    // Parse giờ bắt đầu
    const [startHour, startMin] = (startTime || "08:00").split(":").map(Number)
    const examStart = new Date(year, month - 1, day, startHour, startMin, 0, 0)

    // Parse giờ kết thúc
    const [endHour, endMin] = (endTime || "10:00").split(":").map(Number)
    const examEnd = new Date(year, month - 1, day, endHour, endMin, 0, 0)

    console.log("Debug status:", { now: now.toISOString(), examStart: examStart.toISOString(), examEnd: examEnd.toISOString() })

    if (now < examStart) {
      return "upcoming" // Sắp diễn ra
    } else if (now >= examStart && now <= examEnd) {
      return "ongoing" // Đang diễn ra
    } else {
      return "completed" // Đã kết thúc
    }
  }

  // Fetch subjects từ API
  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll() as { success: boolean; data: any[] }
      if (response.success) {
        const mappedSubjects: Subject[] = response.data.map((s: any) => ({
          id: s._id || s.id,
          code: s.code,
          name: s.name,
        }))
        setSubjects(mappedSubjects)
      }
    } catch (error: any) {
      console.error("Error fetching subjects:", error)
    }
  }

  // Fetch exams từ API
  const fetchExams = async () => {
    try {
      setIsLoading(true)
      const response = await examsApi.getAll() as { success: boolean; data: any[] }
      if (response.success) {
        const mappedExams: Exam[] = response.data.map((e: any) => {
          const examDate = e.examDate ? new Date(e.examDate).toISOString().split("T")[0] : ""
          const startTime = e.startTime || "08:00"
          const endTime = e.endTime || "10:00"
          const duration = e.duration || 120
          // Luôn tính trạng thái tự động dựa trên ngày/giờ hiện tại
          const autoStatus = calculateStatus(examDate, startTime, endTime)

          return {
            id: e._id || e.id,
            code: e.code || `EX${Date.now()}`,
            name: e.name,
            subjectId: e.subject?._id || e.subject,
            subjectName: e.subject?.name || "N/A",
            examDate,
            startTime,
            endTime,
            room: e.room || "",
            duration,
            description: e.description || "",
            status: autoStatus, // Luôn dùng trạng thái tự động tính
            createdAt: e.createdAt ? new Date(e.createdAt).toLocaleDateString("vi-VN") : "",
          }
        })
        setExams(mappedExams)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách kỳ thi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
    fetchExams()
  }, [])

  // Lọc kỳ thi theo tìm kiếm
  const filteredExams = exams.filter(
    (exam) =>
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mở dialog thêm kỳ thi
  const handleAdd = () => {
    setEditingExam(null)
    setFormData({
      code: "",
      name: "",
      subjectId: "",
      examDate: "",
      startTime: "08:00",
      endTime: "10:00",
      room: "",
      duration: "",
      description: "",
      semester: "HK1",
      academicYear: "2024-2025",
      status: "auto",
    })
    setIsDialogOpen(true)
  }

  // Mở dialog sửa kỳ thi
  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      code: exam.code,
      name: exam.name,
      subjectId: exam.subjectId,
      examDate: exam.examDate,
      startTime: exam.startTime || "08:00",
      endTime: exam.endTime || "10:00",
      room: exam.room || "",
      duration: exam.duration.toString(),
      description: exam.description,
      semester: (exam as any).semester || "HK1",
      academicYear: (exam as any).academicYear || "2024-2025",
      status: exam.status || "auto",
    })
    setIsDialogOpen(true)
  }

  // Mở dialog xác nhận xóa
  const handleDeleteClick = (exam: Exam) => {
    setDeletingExam(exam)
    setIsDeleteDialogOpen(true)
  }

  // Xóa kỳ thi
  const handleDelete = async () => {
    if (!deletingExam) return

    try {
      setIsSaving(true)
      await examsApi.delete(deletingExam.id)
      toast({
        title: "Thành công",
        description: "Đã xóa kỳ thi",
      })
      setExams(exams.filter((e) => e.id !== deletingExam.id))
      setIsDeleteDialogOpen(false)
      setDeletingExam(null)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa kỳ thi",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Lưu kỳ thi (thêm hoặc sửa)
  const handleSave = async () => {
    if (!formData.name || !formData.examDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    // Validate thời gian
    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Lỗi",
        description: "Giờ kết thúc phải sau giờ bắt đầu",
        variant: "destructive",
      })
      return
    }

    // Tự động tính duration từ startTime và endTime
    const [startH, startM] = formData.startTime.split(":").map(Number)
    const [endH, endM] = formData.endTime.split(":").map(Number)
    const calculatedDuration = (endH * 60 + endM) - (startH * 60 + startM)

    try {
      setIsSaving(true)

      if (editingExam) {
        // Sửa kỳ thi
        await examsApi.update(editingExam.id, {
          name: formData.name,
          subject: formData.subjectId && formData.subjectId !== "none" ? formData.subjectId : undefined,
          examDate: formData.examDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room || undefined,
          duration: calculatedDuration,
          semester: formData.semester,
          academicYear: formData.academicYear,
          description: formData.description,
          status: formData.status === "auto" ? undefined : formData.status,
        })
        toast({
          title: "Thành công",
          description: "Đã cập nhật kỳ thi",
        })
      } else {
        // Thêm kỳ thi mới
        await examsApi.create({
          name: formData.name,
          subject: formData.subjectId && formData.subjectId !== "none" ? formData.subjectId : undefined,
          examDate: formData.examDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room || undefined,
          duration: calculatedDuration,
          semester: formData.semester,
          academicYear: formData.academicYear,
          description: formData.description,
          status: formData.status === "auto" ? undefined : formData.status,
        })
        toast({
          title: "Thành công",
          description: "Đã thêm kỳ thi mới",
        })
      }

      // Reload danh sách
      await fetchExams()
      setIsDialogOpen(false)
      setFormData({
        code: "",
        name: "",
        subjectId: "",
        examDate: "",
        startTime: "08:00",
        endTime: "10:00",
        room: "",
        duration: "",
        description: "",
        semester: "HK1",
        academicYear: "2024-2025",
        status: "auto",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu kỳ thi",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Lấy badge status
  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: "bg-blue-100 text-blue-700",
      ongoing: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
    }
    const labels = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Quản lý Kỳ thi
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý thông tin các kỳ thi của trung tâm
            </p>
          </div>
          <Button onClick={handleAdd} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Thêm kỳ thi
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã kỳ thi hoặc môn thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã kỳ thi</TableHead>
                <TableHead>Tên kỳ thi</TableHead>
                <TableHead>Môn thi</TableHead>
                <TableHead>Ngày thi</TableHead>
                <TableHead>Giờ thi</TableHead>
                <TableHead>Phòng thi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "Không tìm thấy kỳ thi nào" : "Chưa có kỳ thi nào"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam, index) => (
                  <motion.tr
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{exam.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{exam.name}</div>
                      {exam.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {exam.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        {exam.subjectName}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(exam.examDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {exam.startTime} - {exam.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      {exam.room ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {exam.room}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(exam)}
                          className="gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(exam)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? "Chỉnh sửa kỳ thi" : "Thêm kỳ thi mới"}
            </DialogTitle>
            <DialogDescription>
              {editingExam
                ? "Cập nhật thông tin kỳ thi"
                : "Nhập thông tin kỳ thi mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mã kỳ thi</Label>
              <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center text-muted-foreground">
                {editingExam ? editingExam.code : "Tự động tạo khi lưu"}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Môn thi</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn thi (không bắt buộc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không chọn môn (Kỳ thi chung) --</SelectItem>
                  {subjects.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Chưa có môn thi nào
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Kỳ thi không có môn sẽ hiển thị thông báo chung ở trang chủ
              </p>
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên kỳ thi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: Kỳ thi Tiếng Anh Cơ bản - Tháng 1/2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="examDate">
                  Ngày thi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">
                  Học kỳ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HK1">Học kỳ 1</SelectItem>
                    <SelectItem value="HK2">Học kỳ 2</SelectItem>
                    <SelectItem value="HK3">Học kỳ hè</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  Giờ bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  Giờ kết thúc <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Phòng thi</Label>
                <Input
                  id="room"
                  placeholder="VD: P.101, Hội trường A"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian thi</Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center">
                  {(() => {
                    if (!formData.startTime || !formData.endTime) return <span className="text-muted-foreground">--</span>
                    const [startH, startM] = formData.startTime.split(":").map(Number)
                    const [endH, endM] = formData.endTime.split(":").map(Number)
                    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                    if (totalMinutes <= 0) return <span className="text-destructive">Giờ không hợp lệ</span>
                    const hours = Math.floor(totalMinutes / 60)
                    const mins = totalMinutes % 60
                    return (
                      <span className="font-medium">
                        {hours > 0 && `${hours} giờ `}{mins > 0 && `${mins} phút`}
                        <span className="text-muted-foreground ml-2">({totalMinutes} phút)</span>
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">
                  Năm học <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn năm học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Tự động (theo ngày thi)</SelectItem>
                    <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                    <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                    <SelectItem value="completed">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về kỳ thi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name || !formData.examDate}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingExam ? "Cập nhật" : "Thêm kỳ thi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác nhận Xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa kỳ thi{" "}
              <span className="font-semibold text-foreground">
                {deletingExam?.name}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

