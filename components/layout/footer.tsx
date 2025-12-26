"use client"

import { GraduationCap, Github, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                EduScore
              </span>
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Hệ thống quản lý điểm thi
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/hungtvu113"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="mailto:tranhunggit@gmail.com"
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} EduScore - Đồ án chuyên ngành. Made by hungtvu113
          </p>
        </div>
      </div>
    </footer>
  )
}
