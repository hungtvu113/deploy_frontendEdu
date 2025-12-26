"use client"

import { motion } from "framer-motion"
import { Mail, Github, BookOpen } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Thông tin dự án
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            EduScore - Hệ thống quản lý điểm thi cho Trung tâm Ngoại ngữ - Tin học
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.a
            href="mailto:tranhunggit@gmail.com"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">tranhunggit@gmail.com</p>
          </motion.a>

          <motion.a
            href="https://github.com/hungtvu113"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Github className="w-7 h-7 text-gray-700 dark:text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">GitHub</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">hungtvu113</p>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl border"
          >
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Dự án</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Đồ án chuyên ngành</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
