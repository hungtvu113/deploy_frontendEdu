"use client"

import { motion } from "framer-motion"
import { 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  Search,
  Upload,
  Download,
  Shield,
  Clock
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Quản lý Lớp học",
    description: "Tạo lớp học, phân công giáo viên, thêm học viên với mật khẩu tham gia.",
    color: "bg-blue-500",
  },
  {
    icon: Calendar,
    title: "Quản lý Kỳ thi",
    description: "Tạo kỳ thi, đặt lịch thi, phòng thi và thêm vào lớp học.",
    color: "bg-green-500",
  },
  {
    icon: Upload,
    title: "Import điểm Excel",
    description: "Nhập điểm hàng loạt từ file Excel, tiết kiệm thời gian nhập liệu.",
    color: "bg-purple-500",
  },
  {
    icon: Search,
    title: "Tra cứu điểm",
    description: "Học viên tra cứu điểm nhanh chóng theo lớp và kỳ thi.",
    color: "bg-orange-500",
  },
  {
    icon: Download,
    title: "Xuất báo cáo PDF",
    description: "Xuất bảng điểm, danh sách lớp ra file PDF chuyên nghiệp.",
    color: "bg-pink-500",
  },
  {
    icon: FileSpreadsheet,
    title: "Thống kê điểm",
    description: "Xem thống kê điểm trung bình, tỷ lệ đạt/không đạt.",
    color: "bg-cyan-500",
  },
  {
    icon: Shield,
    title: "Phân quyền rõ ràng",
    description: "3 vai trò: Admin, Giáo viên, Học viên với quyền hạn riêng.",
    color: "bg-red-500",
  },
  {
    icon: Clock,
    title: "Trạng thái tự động",
    description: "Tự động cập nhật trạng thái kỳ thi: Sắp thi, Đang thi, Đã thi.",
    color: "bg-indigo-500",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Tính năng chính
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Đầy đủ công cụ để quản lý điểm thi hiệu quả
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
