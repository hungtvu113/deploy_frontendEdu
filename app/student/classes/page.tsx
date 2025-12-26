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
  User,
  LogIn,
  LogOut,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { classesApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type ClassData = {
  _id: string
  code: string
  name: string
  subject: { _id: string; code: string; name: string }
  teacher: { _id: string; name: string; email: string }
  students: { _id: string; name: string; email: string; studentId?: string }[]
  exams: { _id: string; name: string; examDate: string; startTime?: string; endTime?: string; status: string }[]
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

export default function StudentClassesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [allClasses, setAllClasses] = useState<ClassData[]>([])
  const [myClasses, setMyClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [joinPassword, setJoinPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const fetchClasses = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      // Fetch all classes and my classes in parallel
      const [allRes, myRes] = await Promise.all([
        classesApi.getAll(),
        classesApi.getByStudent(user.id)
      ])
      setAllClasses(allRes.data || [])
      setMyClasses(myRes.data || [])
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

  const isJoinedClass = (classId: string) => {
    return myClasses.some((c) => c._id === classId)
  }

  const handleViewDetail = (classData: ClassData) => {
    setSelectedClass(classData)
    setIsDetailOpen(true)
  }

  const handleJoinClick = (classData: ClassData) => {
    setSelectedClass(classData)
    setJoinPassword("")
    setShowPassword(false)
    setIsJoinDialogOpen(true)
  }

  const handleJoinClass = async () => {
    if (!selectedClass || !joinPassword) return
    try {
      setIsJoining(true)
      const response = await classesApi.join(selectedClass._id, joinPassword)
      if (response.success) {
        toast({ title: "Thành công", description: "Tham gia lớp thành công!" })
        setIsJoinDialogOpen(false)
        fetchClasses()
      } else {
        toast({ title: "Lỗi", description: response.message || "Không thể tham gia lớp", variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Mật khẩu không đúng", variant: "destructive" })
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveClass = async (classData: ClassData) => {
    try {
      const response = await classesApi.leave(classData._id)
      if (response.success) {
        toast({ title: "Thành công", description: "Rời khỏi lớp thành công!" })
        fetchClasses()
        setIsDetailOpen(false)
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể rời khỏi lớp", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const renderClassCard = (classData: ClassData, index: number, showJoinButton: boolean = false) => {
    const joined = isJoinedClass(classData._id)
    return (
      <motion.div
        key={classData._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
        <Card className="hover:shadow-lg transition-shadow h-full">
          <CardHeader className="cursor-pointer" onClick={() => joined && handleViewDetail(classData)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{classData.name}</CardTitle>
              <div className="flex items-center gap-2">
                {joined && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Đã tham gia
                  </span>
                )}
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{classData.code}</span>
              </div>
            </div>
            <CardDescription className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {classData.subject?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>GV: {classData.teacher?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{classData.students?.length || 0}/{classData.maxStudents} sinh viên</span>
              </div>
              {classData.schedule && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{classData.schedule}</span>
                </div>
              )}
              <div className="pt-2 text-xs text-muted-foreground">
                {classData.semester} - {classData.academicYear}
              </div>
              {showJoinButton && !joined && (
                <Button
                  className="w-full mt-3"
                  onClick={(e) => { e.stopPropagation(); handleJoinClick(classData) }}
                >
                  <LogIn className="w-4 h-4 mr-2" /> Tham gia lớp
                </Button>
              )}
              {showJoinButton && joined && (
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={(e) => { e.stopPropagation(); handleViewDetail(classData) }}
                >
                  Xem chi tiết
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lớp học</h1>
            <p className="text-muted-foreground">Tham gia lớp học bằng mật khẩu do giáo viên cung cấp</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả lớp học ({allClasses.length})</TabsTrigger>
          <TabsTrigger value="my">Lớp của tôi ({myClasses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {allClasses.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-16 h-16 mx-auto opacity-20 mb-4" />
              <p className="text-muted-foreground">Chưa có lớp học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allClasses.map((classData, index) => renderClassCard(classData, index, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {myClasses.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-16 h-16 mx-auto opacity-20 mb-4" />
              <p className="text-muted-foreground">Bạn chưa tham gia lớp nào</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab("all")}>
                Xem danh sách lớp học
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClasses.map((classData, index) => renderClassCard(classData, index, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
                <span className="text-muted-foreground">Giáo viên:</span>
                <p className="font-medium">{selectedClass?.teacher?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedClass?.teacher?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Học kỳ:</span>
                <p className="font-medium">{selectedClass?.semester} - {selectedClass?.academicYear}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phòng học:</span>
                <p className="font-medium">{selectedClass?.room || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Lịch học:</span>
                <p className="font-medium">{selectedClass?.schedule || "-"}</p>
              </div>
            </div>

            {/* Exams List */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Lịch thi ({selectedClass?.exams?.length || 0})
              </h3>
              <div className="border rounded-lg overflow-hidden">
                {selectedClass?.exams?.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">Chưa có kỳ thi nào</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3">Tên kỳ thi</th>
                        <th className="text-left p-3">Ngày thi</th>
                        <th className="text-left p-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass?.exams?.map((e) => {
                        const examStatus = calculateExamStatus(e)
                        return (
                          <tr key={e._id} className="border-t">
                            <td className="p-3 font-medium">{e.name}</td>
                            <td className="p-3">{new Date(e.examDate).toLocaleDateString("vi-VN")}</td>
                            <td className="p-3">
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

            {/* Classmates count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Sĩ số lớp: {selectedClass?.students?.length || 0}/{selectedClass?.maxStudents} sinh viên</span>
            </div>
          </div>

          <DialogFooter>
            {selectedClass && isJoinedClass(selectedClass._id) && (
              <Button
                variant="destructive"
                onClick={() => selectedClass && handleLeaveClass(selectedClass)}
              >
                <LogOut className="w-4 h-4 mr-2" /> Rời khỏi lớp
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Tham gia lớp học
            </DialogTitle>
            <DialogDescription>
              Nhập mật khẩu để tham gia lớp <strong>{selectedClass?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mật khẩu lớp</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Nhập mật khẩu do giáo viên cung cấp"
                  onKeyDown={(e) => e.key === "Enter" && handleJoinClass()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleJoinClass} disabled={!joinPassword || isJoining}>
              {isJoining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />}
              Tham gia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
