"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Search, Loader2, School, Mail, Phone } from "lucide-react"
import { classesApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Student = {
  _id: string
  name: string
  email: string
  studentId?: string
  phone?: string
  className: string
  classCode: string
}

type ClassData = {
  _id: string
  code: string
  name: string
  students: { _id: string; name: string; email: string; studentId?: string; phone?: string }[]
}

export default function TeacherStudentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const response = await classesApi.getByTeacher(user.id)
      const classesData = response.data || []
      setClasses(classesData)

      // Flatten students from all classes
      const allStudents: Student[] = []
      classesData.forEach((c: ClassData) => {
        c.students?.forEach((s) => {
          // Avoid duplicates
          if (!allStudents.find((existing) => existing._id === s._id && existing.classCode === c.code)) {
            allStudents.push({
              ...s,
              className: c.name,
              classCode: c.code,
            })
          }
        })
      })
      setStudents(allStudents)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user])

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesClass = selectedClass === "all" || s.classCode === selectedClass

    return matchesSearch && matchesClass
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Danh sách Sinh viên</h1>
            <p className="text-muted-foreground">Xem sinh viên trong các lớp bạn phụ trách</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, mã SV, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c._id} value={c.code}>{c.code} - {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <TableHead>Mã SV</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Lớp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Users className="w-12 h-12 opacity-20 mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {students.length === 0 ? "Chưa có sinh viên trong các lớp" : "Không tìm thấy sinh viên"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student, index) => (
                <motion.tr
                  key={`${student._id}-${student.classCode}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="group"
                >
                  <TableCell className="font-mono">{student.studentId || "-"}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      <School className="w-3 h-3" />
                      {student.classCode}
                    </span>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Summary */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          Hiển thị {filteredStudents.length} / {students.length} sinh viên
        </motion.div>
      )}
    </div>
  )
}

