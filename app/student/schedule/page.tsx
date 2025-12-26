"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Search, Clock, BookOpen, Loader2, School, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { scoresApi } from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ExamSchedule = {
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
  }
  class: {
    id: string
    code: string
    name: string
  }
  teacher: {
    name: string
    email: string
  }
}

export default function StudentSchedulePage() {
  const toast = useToast()
  const [exams, setExams] = useState<ExamSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true)
        const response = (await scoresApi.getMyExams()) as {
          success: boolean
          data: ExamSchedule[]
        }
        if (response.success) {
          setExams(response.data)
        }
      } catch (error: any) {
        toast.error("Lỗi", error.message || "Không thể tải lịch thi")
      } finally {
        setIsLoading(false)
      }
    }
    fetchExams()
  }, [])

  // Tính trạng thái dựa trên ngày/giờ
  const calculateStatus = (examDate: string, startTime: string, endTime: string): string => {
    if (!examDate) return "upcoming"

    const now = new Date()
    const [year, month, day] = examDate.split("T")[0].split("-").map(Number)
    const [startHour, startMin] = (startTime || "08:00").split(":").map(Number)
    const [endHour, endMin] = (endTime || "10:00").split(":").map(Number)

    const examStart = new Date(year, month - 1, day, startHour, startMin, 0, 0)
    const examEnd = new Date(year, month - 1, day, endHour, endMin, 0, 0)

    if (now < examStart) return "upcoming"
    if (now >= examStart && now <= examEnd) return "ongoing"
    return "completed"
  }

  // Filter và tính status
  const processedExams = exams.map((exam) => ({
    ...exam,
    calculatedStatus: calculateStatus(exam.examDate, exam.startTime, exam.endTime),
  }))

  const filteredExams = processedExams.filter(
    (exam) =>
      exam.examName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.class?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingExams = filteredExams.filter((e) => e.calculatedStatus === "upcoming")
  const ongoingExams = filteredExams.filter((e) => e.calculatedStatus === "ongoing")
  const completedExams = filteredExams.filter((e) => e.calculatedStatus === "completed")

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      ongoing: "bg-green-500/10 text-green-500 border-green-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    const labels: Record<string, string> = {
      upcoming: "Sắp thi",
      ongoing: "Đang thi",
      completed: "Đã thi",
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const ExamTable = ({ exams: examList, title, icon: Icon, iconColor }: { exams: typeof filteredExams; title: string; icon: any; iconColor: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {title} ({examList.length})
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên kỳ thi</TableHead>
            <TableHead>Môn thi</TableHead>
            <TableHead>Lớp</TableHead>
            <TableHead>Ngày thi</TableHead>
            <TableHead>Giờ thi</TableHead>
            <TableHead>Phòng thi</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {examList.map((exam, index) => (
            <motion.tr
              key={exam.examId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group hover:bg-muted/50"
            >
              <TableCell className="font-medium max-w-[250px] truncate">
                {exam.examName}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {exam.subject?.name || "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  {exam.class?.name || "-"}
                </div>
              </TableCell>
              <TableCell>{formatDate(exam.examDate)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {exam.startTime} - {exam.endTime}
                </div>
              </TableCell>
              <TableCell>
                {exam.room ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    {exam.room}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(exam.calculatedStatus)}</TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  )

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
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lịch thi</h1>
            <p className="text-muted-foreground">
              Xem lịch thi từ các lớp học đã tham gia
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sắp thi</p>
              <p className="text-3xl font-bold">{upcomingExams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang thi</p>
              <p className="text-3xl font-bold">{ongoingExams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã thi</p>
              <p className="text-3xl font-bold">{completedExams.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên kỳ thi, môn, lớp..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Ongoing Exams */}
      {!isLoading && ongoingExams.length > 0 && (
        <ExamTable exams={ongoingExams} title="Đang diễn ra" icon={Calendar} iconColor="text-green-500" />
      )}

      {/* Upcoming Exams */}
      {!isLoading && upcomingExams.length > 0 && (
        <ExamTable exams={upcomingExams} title="Sắp thi" icon={Clock} iconColor="text-blue-500" />
      )}

      {/* Completed Exams */}
      {!isLoading && completedExams.length > 0 && (
        <ExamTable exams={completedExams} title="Đã thi" icon={Calendar} iconColor="text-gray-500" />
      )}

      {/* Empty State */}
      {!isLoading && filteredExams.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có lịch thi</h3>
          <p className="text-muted-foreground max-w-md">
            {exams.length === 0
              ? "Bạn chưa tham gia lớp học nào có kỳ thi"
              : "Không tìm thấy lịch thi phù hợp với tìm kiếm"}
          </p>
        </motion.div>
      )}
    </div>
  )
}
