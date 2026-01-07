"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { examsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type PublicExam = {
  _id: string
  code: string
  name: string
  examDate: string
  startTime: string
  endTime: string
  room?: string
  description?: string
  participants: { _id: string; name: string; studentId: string }[]
  maxParticipants?: number
  status: string
}

export default function PublicExamsPage() {
  const { toast } = useToast()
  const [exams, setExams] = useState<PublicExam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedExam, setSelectedExam] = useState<PublicExam | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Lấy user ID từ localStorage
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)
      setUserId(parsed.id || parsed._id)
    }
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

  const isRegistered = (exam: PublicExam) => {
    if (!userId) return false
    return exam.participants.some((p) => p._id === userId)
  }

  const handleRegisterClick = (exam: PublicExam) => {
    setSelectedExam(exam)
    setIsDialogOpen(true)
  }

  const handleRegister = async () => {
    if (!selectedExam) return

    try {
      setIsProcessing(true)
      const registered = isRegistered(selectedExam)

      if (registered) {
        await examsApi.unregister(selectedExam._id)
        toast({ title: "Thành công", description: "Đã hủy đăng ký kỳ thi" })
      } else {
        await examsApi.register(selectedExam._id)
        toast({ title: "Thành công", description: "Đăng ký kỳ thi thành công!" })
      }

      await fetchExams()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Kỳ thi chung
          </h1>
          <p className="text-muted-foreground mt-2">
            Đăng ký tham gia các kỳ thi chung của trung tâm
          </p>
        </div>

        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Hiện không có kỳ thi chung nào đang mở đăng ký
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam, index) => {
              const registered = isRegistered(exam)
              const isFull = exam.maxParticipants && exam.participants.length >= exam.maxParticipants

              return (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`hover:shadow-md transition-shadow ${registered ? "border-green-500 border-2" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{exam.name}</CardTitle>
                          <CardDescription>Mã: {exam.code}</CardDescription>
                        </div>
                        {registered && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã đăng ký
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(exam.examDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{exam.startTime} - {exam.endTime}</span>
                      </div>
                      {exam.room && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{exam.room}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {exam.participants.length}
                          {exam.maxParticipants && ` / ${exam.maxParticipants}`} đã đăng ký
                        </span>
                      </div>
                      {exam.description && (
                        <p className="text-sm text-muted-foreground">{exam.description}</p>
                      )}

                      <Button
                        className="w-full mt-4"
                        variant={registered ? "outline" : "default"}
                        disabled={!registered && !!isFull}
                        onClick={() => handleRegisterClick(exam)}
                      >
                        {registered ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Hủy đăng ký
                          </>
                        ) : isFull ? (
                          "Đã đủ số lượng"
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Đăng ký tham gia
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Dialog xác nhận */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedExam && isRegistered(selectedExam) ? "Hủy đăng ký" : "Xác nhận đăng ký"}
            </DialogTitle>
            <DialogDescription>
              {selectedExam && isRegistered(selectedExam)
                ? `Bạn có chắc muốn hủy đăng ký kỳ thi "${selectedExam?.name}"?`
                : `Bạn có chắc muốn đăng ký kỳ thi "${selectedExam?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          {selectedExam && (
            <div className="py-4 space-y-2 text-sm">
              <p><strong>Ngày thi:</strong> {formatDate(selectedExam.examDate)}</p>
              <p><strong>Giờ thi:</strong> {selectedExam.startTime} - {selectedExam.endTime}</p>
              {selectedExam.room && <p><strong>Phòng thi:</strong> {selectedExam.room}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Hủy
            </Button>
            <Button
              onClick={handleRegister}
              disabled={isProcessing}
              variant={selectedExam && isRegistered(selectedExam) ? "destructive" : "default"}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedExam && isRegistered(selectedExam) ? "Hủy đăng ký" : "Đăng ký"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
