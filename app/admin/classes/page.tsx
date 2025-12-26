"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  School,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  Loader2,
  UserPlus,
  BookOpen,
} from "lucide-react"
import { classesApi, subjectsApi, usersApi, examsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ClassData = {
  _id: string
  code: string
  name: string
  subject: { _id: string; code: string; name: string }
  teacher: { _id: string; name: string; email: string }
  students: { _id: string; name: string; email: string; studentId?: string }[]
  exams: { _id: string; name: string; examDate: string; status: string }[]
  semester: string
  academicYear: string
  schedule?: string
  room?: string
  maxStudents: number
  password?: string
  isActive: boolean
}

type Subject = { _id: string; code: string; name: string }
type Teacher = { _id: string; name: string; email: string }
type Student = { _id: string; name: string; email: string; studentId?: string }
type Exam = { _id: string; name: string; examDate: string; status: string }

export default function ClassesPage() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false)
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [deletingClass, setDeletingClass] = useState<ClassData | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    subject: "",
    teacher: "",
    semester: "HK1",
    academicYear: "2024-2025",
    schedule: "",
    room: "",
    maxStudents: 50,
    password: "",
  })
  const [scheduleDays, setScheduleDays] = useState<string[]>([])
  const [scheduleStartTime, setScheduleStartTime] = useState("08:00")
  const [scheduleEndTime, setScheduleEndTime] = useState("10:00")

  const daysOfWeek = [
    { value: "2", label: "Thứ 2" },
    { value: "3", label: "Thứ 3" },
    { value: "4", label: "Thứ 4" },
    { value: "5", label: "Thứ 5" },
    { value: "6", label: "Thứ 6" },
    { value: "7", label: "Thứ 7" },
    { value: "CN", label: "CN" },
  ]

  const timeOptions = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00"
  ]

  // Tạo chuỗi lịch học từ các ngày và giờ đã chọn
  const buildScheduleString = () => {
    if (scheduleDays.length === 0) return ""
    const daysStr = scheduleDays.map(d => d === "CN" ? "CN" : `Thứ ${d}`).join(", ")
    return `${daysStr}, ${scheduleStartTime} - ${scheduleEndTime}`
  }

  // Parse chuỗi lịch học thành các ngày và giờ
  const parseScheduleString = (schedule: string) => {
    if (!schedule) {
      setScheduleDays([])
      setScheduleStartTime("08:00")
      setScheduleEndTime("10:00")
      return
    }
    
    // Parse days
    const days: string[] = []
    daysOfWeek.forEach(d => {
      if (d.value === "CN" && schedule.includes("CN")) {
        days.push("CN")
      } else if (schedule.includes(`Thứ ${d.value}`)) {
        days.push(d.value)
      }
    })
    setScheduleDays(days)
    
    // Parse time
    const timeMatch = schedule.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
    if (timeMatch) {
      setScheduleStartTime(timeMatch[1])
      setScheduleEndTime(timeMatch[2])
    }
  }

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [classesRes, subjectsRes, usersRes, examsRes] = await Promise.all([
        classesApi.getAll(),
        subjectsApi.getAll(),
        usersApi.getAll(),
        examsApi.getAll(),
      ])
      setClasses(classesRes.data || [])
      setSubjects(subjectsRes.data || [])
      setTeachers((usersRes.data || []).filter((u: any) => u.role === "teacher"))
      setStudents((usersRes.data || []).filter((u: any) => u.role === "student"))
      setExams(examsRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredClasses = classes.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setEditingClass(null)
    setFormData({
      code: "",
      name: "",
      subject: "",
      teacher: "",
      semester: "HK1",
      academicYear: "2024-2025",
      schedule: "",
      room: "",
      maxStudents: 50,
      password: "",
    })
    setScheduleDays([])
    setScheduleStartTime("08:00")
    setScheduleEndTime("10:00")
    setIsDialogOpen(true)
  }

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData)
    setFormData({
      code: classData.code,
      name: classData.name,
      subject: classData.subject?._id || "",
      teacher: classData.teacher?._id || "",
      semester: classData.semester,
      academicYear: classData.academicYear,
      schedule: classData.schedule || "",
      room: classData.room || "",
      maxStudents: classData.maxStudents,
      password: classData.password || "",
    })
    parseScheduleString(classData.schedule || "")
    setIsDialogOpen(true)
  }

  const handleDelete = (classData: ClassData) => {
    setDeletingClass(classData)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const scheduleStr = buildScheduleString()
      const submitData = { ...formData, schedule: scheduleStr }
      
      if (editingClass) {
        await classesApi.update(editingClass._id, submitData)
        toast({ title: "Thành công", description: "Cập nhật lớp học thành công" })
      } else {
        await classesApi.create(submitData)
        toast({ title: "Thành công", description: "Tạo lớp học thành công" })
      }
      setIsDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Đã xảy ra lỗi", variant: "destructive" })
    }
  }

  const confirmDelete = async () => {
    if (deletingClass) {
      try {
        await classesApi.delete(deletingClass._id)
        toast({ title: "Thành công", description: "Xóa lớp học thành công" })
        setIsDeleteDialogOpen(false)
        setDeletingClass(null)
        fetchData()
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Đã xảy ra lỗi", variant: "destructive" })
      }
    }
  }

  const handleAddStudents = (classData: ClassData) => {
    setSelectedClass(classData)
    setSelectedStudents([])
    setIsStudentDialogOpen(true)
  }

  const submitAddStudents = async () => {
    if (selectedClass && selectedStudents.length > 0) {
      try {
        await classesApi.addStudents(selectedClass._id, selectedStudents)
        toast({ title: "Thành công", description: "Thêm sinh viên vào lớp thành công" })
        setIsStudentDialogOpen(false)
        fetchData()
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Đã xảy ra lỗi", variant: "destructive" })
      }
    }
  }

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    try {
      await classesApi.removeStudent(classId, studentId)
      toast({ title: "Thành công", description: "Đã xóa sinh viên khỏi lớp" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Đã xảy ra lỗi", variant: "destructive" })
    }
  }

  const handleAddExam = (classData: ClassData) => {
    setSelectedClass(classData)
    setSelectedExam("")
    setIsExamDialogOpen(true)
  }

  const submitAddExam = async () => {
    if (selectedClass && selectedExam) {
      try {
        await classesApi.addExam(selectedClass._id, selectedExam)
        toast({ title: "Thành công", description: "Thêm kỳ thi vào lớp thành công" })
        setIsExamDialogOpen(false)
        fetchData()
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Đã xảy ra lỗi", variant: "destructive" })
      }
    }
  }

  // Get available students (not in class)
  const getAvailableStudents = () => {
    if (!selectedClass) return students
    const existingIds = selectedClass.students.map((s) => s._id)
    return students.filter((s) => !existingIds.includes(s._id))
  }

  // Get available exams (not in class)
  const getAvailableExams = () => {
    if (!selectedClass) return exams
    // Lấy ID của các kỳ thi đã có trong lớp (có thể là string hoặc object)
    const existingIds = selectedClass.exams.map((e) => {
      if (typeof e === "string") return e
      return e._id || (e as any).id
    })
    // Lọc bỏ các kỳ thi đã có trong lớp
    return exams.filter((e) => !existingIds.includes(e._id))
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
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quản lý Lớp học</h1>
            <p className="text-muted-foreground">Quản lý các lớp học, sinh viên và kỳ thi</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Add */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm lớp học
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border rounded-lg overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Mã lớp</TableHead>
              <TableHead>Tên lớp</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Giáo viên</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead>Kỳ thi</TableHead>
              <TableHead>Học kỳ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <School className="w-12 h-12 opacity-20 mx-auto mb-2" />
                  <p className="text-muted-foreground">Chưa có lớp học nào</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((classData, index) => (
                <motion.tr
                  key={classData._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <TableCell className="font-mono font-medium">{classData.code}</TableCell>
                  <TableCell className="font-medium">{classData.name}</TableCell>
                  <TableCell>{classData.subject?.name || "-"}</TableCell>
                  <TableCell>{classData.teacher?.name || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleAddStudents(classData)}>
                      <Users className="w-4 h-4 mr-1" />
                      {classData.students?.length || 0}/{classData.maxStudents}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleAddExam(classData)}>
                      <Calendar className="w-4 h-4 mr-1" />
                      {classData.exams?.length || 0}
                    </Button>
                  </TableCell>
                  <TableCell>{classData.semester} - {classData.academicYear}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(classData)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(classData)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin lớp học</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Mã lớp *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: ENG101-A"
              />
            </div>
            <div className="space-y-2">
              <Label>Tên lớp *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Tiếng Anh cơ bản - Lớp A"
              />
            </div>
            <div className="space-y-2">
              <Label>Môn học *</Label>
              <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn môn học" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{s.code} - {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giáo viên *</Label>
              <Select value={formData.teacher} onValueChange={(v) => setFormData({ ...formData, teacher: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn giáo viên" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Học kỳ *</Label>
              <Select value={formData.semester} onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HK1">Học kỳ 1</SelectItem>
                  <SelectItem value="HK2">Học kỳ 2</SelectItem>
                  <SelectItem value="HKH">Học kỳ hè</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Năm học *</Label>
              <Select value={formData.academicYear} onValueChange={(v) => setFormData({ ...formData, academicYear: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Lịch học</Label>
              <div className="space-y-3">
                {/* Chọn ngày */}
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        if (scheduleDays.includes(day.value)) {
                          setScheduleDays(scheduleDays.filter(d => d !== day.value))
                        } else {
                          setScheduleDays([...scheduleDays, day.value])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                        scheduleDays.includes(day.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-input"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {/* Chọn giờ */}
                <div className="flex items-center gap-2">
                  <Select value={scheduleStartTime} onValueChange={setScheduleStartTime}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">đến</span>
                  <Select value={scheduleEndTime} onValueChange={setScheduleEndTime}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Preview */}
                {scheduleDays.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Lịch học: <span className="font-medium text-foreground">{buildScheduleString()}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phòng học</Label>
              <Input
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="VD: P.201"
              />
            </div>
            <div className="space-y-2">
              <Label>Sĩ số tối đa</Label>
              <Input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Mật khẩu lớp *</Label>
              <Input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mật khẩu để sinh viên tham gia lớp"
              />
              <p className="text-xs text-muted-foreground">Sinh viên cần nhập mật khẩu này để tham gia lớp học</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit}>{editingClass ? "Cập nhật" : "Tạo lớp"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa lớp <strong>{deletingClass?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Students Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý sinh viên - {selectedClass?.name}</DialogTitle>
            <DialogDescription>Thêm hoặc xóa sinh viên khỏi lớp</DialogDescription>
          </DialogHeader>

          {/* Current students */}
          <div className="space-y-2">
            <Label>Sinh viên trong lớp ({selectedClass?.students?.length || 0})</Label>
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {selectedClass?.students?.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">Chưa có sinh viên nào</p>
              ) : (
                selectedClass?.students?.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-2 border-b last:border-0">
                    <span>{s.name} ({s.studentId || s.email})</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(selectedClass._id, s._id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add new students */}
          <div className="space-y-2">
            <Label>Thêm sinh viên</Label>
            <div className="border rounded-lg max-h-40 overflow-y-auto">
              {getAvailableStudents().length === 0 ? (
                <p className="p-4 text-center text-muted-foreground">Không còn sinh viên khả dụng</p>
              ) : (
                getAvailableStudents().map((s) => (
                  <div key={s._id} className="flex items-center gap-2 p-2 border-b last:border-0">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, s._id])
                        } else {
                          setSelectedStudents(selectedStudents.filter((id) => id !== s._id))
                        }
                      }}
                    />
                    <span>{s.name} ({s.studentId || s.email})</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStudentDialogOpen(false)}>Đóng</Button>
            <Button onClick={submitAddStudents} disabled={selectedStudents.length === 0}>
              <UserPlus className="w-4 h-4 mr-2" /> Thêm {selectedStudents.length} sinh viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm kỳ thi - {selectedClass?.name}</DialogTitle>
            <DialogDescription>Chọn kỳ thi để thêm vào lớp</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current exams */}
            <div className="space-y-2">
              <Label>Kỳ thi hiện tại ({selectedClass?.exams?.length || 0})</Label>
              <div className="border rounded-lg max-h-32 overflow-y-auto">
                {selectedClass?.exams?.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">Chưa có kỳ thi nào</p>
                ) : (
                  selectedClass?.exams?.map((e) => (
                    <div key={e._id} className="p-2 border-b last:border-0">
                      {e.name} - {new Date(e.examDate).toLocaleDateString("vi-VN")}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Select new exam */}
            <div className="space-y-2">
              <Label>Chọn kỳ thi</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger><SelectValue placeholder="Chọn kỳ thi" /></SelectTrigger>
                <SelectContent>
                  {getAvailableExams().map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.name} - {new Date(e.examDate).toLocaleDateString("vi-VN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExamDialogOpen(false)}>Đóng</Button>
            <Button onClick={submitAddExam} disabled={!selectedExam}>
              <BookOpen className="w-4 h-4 mr-2" /> Thêm kỳ thi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

