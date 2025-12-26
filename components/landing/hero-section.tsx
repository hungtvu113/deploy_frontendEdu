"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-[10%] w-16 h-16 bg-blue-500/10 rounded-2xl"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-[15%] w-12 h-12 bg-green-500/10 rounded-full"
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 left-[20%] w-20 h-20 bg-purple-500/10 rounded-3xl"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            Hệ thống Quản lý{" "}
            <span className="text-blue-500">Điểm thi</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-4"
          >
            Dành cho Trung tâm Ngoại ngữ - Tin học
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base text-gray-500 dark:text-gray-500 mb-10 max-w-2xl mx-auto"
          >
            Quản lý lớp học, kỳ thi và điểm số một cách đơn giản, hiệu quả. 
            Hỗ trợ nhập điểm từ Excel, tra cứu điểm nhanh chóng và xuất báo cáo PDF.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/login">
              <Button size="lg" className="gap-2 bg-blue-500 hover:bg-blue-600 px-8">
                Đăng nhập
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8">
                Đăng ký học viên
              </Button>
            </Link>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { icon: BookOpen, label: "Quản lý lớp học", desc: "Tạo lớp, thêm kỳ thi" },
              { icon: Users, label: "Quản lý học viên", desc: "Theo dõi điểm số" },
              { icon: Award, label: "Tra cứu điểm", desc: "Nhanh chóng, chính xác" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-gray-800 border shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
