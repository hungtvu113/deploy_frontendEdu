"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subjectsApi } from "@/lib/api"
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

type Subject = {
  id: string
  code: string
  name: string
  description: string
  credits: number
  createdAt: string
}

export default function SubjectsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    credits: 3,
  })

  // Fetch subjects từ API
  const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      const response = await subjectsApi.getAll() as { success: boolean; data: any[] }
      if (response.success) {
        const mappedSubjects: Subject[] = response.data.map((s: any) => ({
          id: s._id || s.id,
          code: s.code,
          name: s.name,
          description: s.description || "",
          credits: s.credits || 0,
          createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString("vi-VN") : "",
        }))
        setSubjects(mappedSubjects)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách môn thi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  // Lọc môn thi theo tìm kiếm
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mở dialog thêm mới
  const handleAdd = () => {
    setEditingSubject(null)
    setFormData({ code: "", name: "", description: "", credits: 3 })
    setIsDialogOpen(true)
  }

  // Mở dialog chỉnh sửa
  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description,
      credits: subject.credits,
    })
    setIsDialogOpen(true)
  }

  // Mở dialog xóa
  const handleDelete = (subject: Subject) => {
    setDeletingSubject(subject)
    setIsDeleteDialogOpen(true)
  }

  // Xác nhận xóa
  const confirmDelete = async () => {
    if (!deletingSubject) return

    try {
      setIsSaving(true)
      await subjectsApi.delete(deletingSubject.id)
      toast({
        title: "Thành công",
        description: "Đã xóa môn thi",
      })
      setSubjects(subjects.filter((s) => s.id !== deletingSubject.id))
      setIsDeleteDialogOpen(false)
      setDeletingSubject(null)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa môn thi",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Lưu (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ mã và tên môn thi",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingSubject) {
        // Cập nhật
        await subjectsApi.update(editingSubject.id, formData)
        toast({
          title: "Thành công",
          description: "Đã cập nhật môn thi",
        })
      } else {
        // Thêm mới
        await subjectsApi.create(formData)
        toast({
          title: "Thành công",
          description: "Đã thêm môn thi mới",
        })
      }

      // Reload danh sách
      await fetchSubjects()
      setIsDialogOpen(false)
      setFormData({ code: "", name: "", description: "", credits: 3 })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu môn thi",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Quản lý Môn thi</h1>
        </div>
        <p className="text-muted-foreground">
          Quản lý danh sách các môn thi trong hệ thống
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã môn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm môn thi
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border rounded-lg overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã môn</TableHead>
              <TableHead>Tên môn thi</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Số tín chỉ</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "Không tìm thấy môn thi nào" : "Chưa có môn thi nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubjects.map((subject, index) => (
                <motion.tr
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <TableCell className="font-medium">{subject.code}</TableCell>
                  <TableCell className="font-semibold">{subject.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{subject.description}</TableCell>
                  <TableCell className="text-center">{subject.credits}</TableCell>
                  <TableCell>{subject.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subject)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subject)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Dialog Thêm/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Chỉnh sửa môn thi" : "Thêm môn thi mới"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? "Cập nhật thông tin môn thi"
                : "Nhập thông tin môn thi mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Mã môn *</Label>
              <Input
                id="code"
                placeholder="VD: ENG101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên môn thi *</Label>
              <Input
                id="name"
                placeholder="VD: Tiếng Anh Cơ bản"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về môn thi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">Số tín chỉ</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.code || !formData.name}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingSubject ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa môn thi{" "}
              <span className="font-semibold">{deletingSubject?.name}</span>?
              <br />
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

