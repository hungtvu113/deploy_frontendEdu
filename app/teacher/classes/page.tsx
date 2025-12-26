"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  School,
  Users,
  Calendar,
  Loader2,
  BookOpen,
  Clock,
  MapPin,
} from "lucide-react"
import { classesApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ClassData = {
  _id: string
  code: string
  name: string
  subject: { _id: string; code: string; name: string }
  teacher: { _id: string; name: string; email: string }
  students: { _id: string; name: string; email: string; studentId?: string }[]
  exams: { _id: string; name: string; examDate: string; startTime?: string; endTime?: string; room?: string; status: string }[]
  semester: string
  academicYear: string
  schedule?: string
  room?: string
  maxStudents: number
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
    return { status: "upcoming", label: "Sắp tới", color: "bg-blue-100 text-blue-700" }
  } else if (now >= startDateTime && now <= endDateTime) {
    return { status: "ongoing", label: "Đang diễn ra", color: "bg-yellow-100 text-yellow-700" }
  } else {
    return { status: "completed", label: "Đã kết thúc", color: "bg-green-100 text-green-700" }
  }
}

export default function TeacherClassesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchClasses = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const response = await classesApi.getByTeacher(user.id)
      setClasses(response.data || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
      toast({ title: "Lỗi", description: "Không thể tải danh sách lớp học", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchClasses()
    }
  }, [user])

  const handleViewDetail = (classData: ClassData) => {
    setSelectedClass(classData)
    setIsDetailOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lớp học của tôi</h1>
            <p className="text-muted-foreground">Xem danh sách các lớp bạn đang phụ trách</p>
          </div>
        </div>
      </motion.div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <School className="w-16 h-16 mx-auto opacity-20 mb-4" />
          <p className="text-muted-foreground">Bạn chưa được phân công lớp nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classData, index) => (
            <motion.div
              key={classData._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetail(classData)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{classData.name}</CardTitle>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{classData.code}</span>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {classData.subject?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{classData.students?.length || 0}/{classData.maxStudents} sinh viên</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{classData.exams?.length || 0} kỳ thi</span>
                    </div>
                    {classData.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{classData.schedule}</span>
                      </div>
                    )}
                    {classData.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{classData.room}</span>
                      </div>
                    )}
                    <div className="pt-2 text-xs text-muted-foreground">
                      {classData.semester} - {classData.academicYear}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClass?.name}</DialogTitle>
            <DialogDescription>
              {selectedClass?.code} - {selectedClass?.subject?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Class Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Học kỳ:</span>
                <p className="font-medium">{selectedClass?.semester} - {selectedClass?.academicYear}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phòng học:</span>
                <p className="font-medium">{selectedClass?.room || "-"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Lịch học:</span>
                <p className="font-medium">{selectedClass?.schedule || "-"}</p>
              </div>
            </div>

            {/* Students List */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Danh sách sinh viên ({selectedClass?.students?.length || 0})
              </h3>
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {selectedClass?.students?.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">Chưa có sinh viên</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2">Mã SV</th>
                        <th className="text-left p-2">Họ tên</th>
                        <th className="text-left p-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass?.students?.map((s) => (
                        <tr key={s._id} className="border-t">
                          <td className="p-2 font-mono">{s.studentId || "-"}</td>
                          <td className="p-2">{s.name}</td>
                          <td className="p-2 text-muted-foreground">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Exams List */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Kỳ thi ({selectedClass?.exams?.length || 0})
              </h3>
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {selectedClass?.exams?.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">Chưa có kỳ thi</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2">Tên kỳ thi</th>
                        <th className="text-left p-2">Ngày thi</th>
                        <th className="text-left p-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass?.exams?.map((e) => {
                        const examStatus = calculateExamStatus(e)
                        return (
                          <tr key={e._id} className="border-t">
                            <td className="p-2">{e.name}</td>
                            <td className="p-2">{new Date(e.examDate).toLocaleDateString("vi-VN")}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${examStatus.color}`}>
                                {examStatus.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
