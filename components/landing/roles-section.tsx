"use client"

import { motion } from "framer-motion"
import { ShieldCheck, UserCheck, GraduationCap, Check } from "lucide-react"

const roles = [
  {
    icon: ShieldCheck,
    title: "Admin",
    subtitle: "Quản trị viên",
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    features: [
      "Quản lý môn học, lớp học",
      "Tạo và quản lý kỳ thi",
      "Quản lý tài khoản giáo viên",
      "Xem thống kê tổng quan",
      "Xuất báo cáo hệ thống",
    ],
  },
  {
    icon: UserCheck,
    title: "Giáo viên",
    subtitle: "Giảng viên",
    color: "bg-green-500",
    borderColor: "border-green-500",
    features: [
      "Xem lớp học được phân công",
      "Nhập điểm thủ công",
      "Import điểm từ Excel",
      "Xuất bảng điểm PDF",
      "Xem lịch sử nhập điểm",
    ],
  },
  {
    icon: GraduationCap,
    title: "Học viên",
    subtitle: "Sinh viên",
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    features: [
      "Đăng ký tài khoản",
      "Tham gia lớp học bằng mật khẩu",
      "Xem lịch thi sắp tới",
      "Tra cứu điểm thi",
      "Xuất bảng điểm cá nhân",
    ],
  },
]

export function RolesSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Dành cho mọi đối tượng
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Mỗi vai trò có giao diện và chức năng riêng biệt
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl border-t-4 ${role.borderColor} shadow-sm hover:shadow-lg transition-shadow overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 ${role.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 ${role.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
