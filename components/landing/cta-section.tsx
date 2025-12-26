"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Bắt đầu sử dụng ngay
          </h2>

          <p className="text-lg text-blue-100 mb-8">
            Đăng nhập để trải nghiệm hệ thống quản lý điểm thi hiện đại
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="gap-2 px-8">
                <LogIn className="w-5 h-5" />
                Đăng nhập
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="gap-2 px-8 bg-transparent text-white border-white hover:bg-white/10">
                <UserPlus className="w-5 h-5" />
                Đăng ký học viên
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Miễn phí sử dụng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Dễ dàng sử dụng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span>Hỗ trợ tiếng Việt</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
