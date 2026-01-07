"use client"

import Image from "next/image"

export default function PosterPage() {
  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .poster-container {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex justify-center items-center p-5 print:bg-white print:p-0 print:m-0">
        <div className="poster-container w-[210mm] h-[297mm] bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-6 py-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <Image
              src="/Logo_Trường_Đại_học_Trà_Vinh (1).png"
              alt="Logo TVU"
              width={55}
              height={55}
              className="object-contain"
            />
          </div>
          <div className="text-white text-center flex-1">
            <h1 className="text-xl font-bold text-cyan-300 uppercase tracking-wide">
              Trường Đại học Trà Vinh
            </h1>
            <p className="text-sm italic mt-0.5 text-cyan-100">
              Trường Kỹ thuật & Công nghệ
            </p>
            <p className="text-xs italic text-cyan-200">
              Khoa Công nghệ Thông tin
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 px-6 py-5 text-center">
          <p className="text-xs text-white uppercase tracking-[3px] mb-1">
            Đồ án chuyên ngành
          </p>
          <h2 className="text-xl font-bold text-white uppercase leading-tight drop-shadow-md">
            Xây dựng Website Quản lý các Kỳ thi
            <br />
            của Trung tâm Ngoại ngữ - Tin học
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <InfoBox label="Sinh viên thực hiện" value="Trần Tấn Hưng" />
            <InfoBox label="Mã số sinh viên" value="110122081" />
            <InfoBox label="Giảng viên hướng dẫn" value="ThS. Võ Thành C" />
            <InfoBox label="Năm học" value="2024 - 2025" />
          </div>

          {/* Giới thiệu */}
          <Section title="Giới thiệu đề tài">
            <p className="text-xs leading-relaxed text-gray-600 text-justify">
              Xây dựng hệ thống website quản lý kỳ thi giúp số hóa quy trình quản lý 
              thông tin kỳ thi, học viên và điểm số cho các trung tâm Ngoại ngữ - Tin học. 
              Hệ thống hỗ trợ 3 vai trò: Quản trị viên, Giáo viên và Học viên.
            </p>
          </Section>

          {/* Chức năng */}
          <Section title="Chức năng chính">
            <div className="grid grid-cols-3 gap-2">
              <FeatureItem icon="📋" name="Quản lý kỳ thi, môn thi" />
              <FeatureItem icon="👥" name="Quản lý học viên, lớp" />
              <FeatureItem icon="📝" name="Nhập điểm, import Excel" />
              <FeatureItem icon="📊" name="Thống kê, báo cáo" />
              <FeatureItem icon="🔍" name="Tra cứu điểm thi" />
              <FeatureItem icon="📤" name="Xuất Excel, PDF" />
            </div>
          </Section>

          {/* Công nghệ */}
          <Section title="Công nghệ sử dụng">
            <div className="grid grid-cols-2 gap-2">
              <TechItem label="Frontend" items="Next.js, TypeScript, Tailwind CSS" />
              <TechItem label="Backend" items="Node.js, Express.js, JWT" />
              <TechItem label="Database" items="MongoDB, Mongoose" />
              <TechItem label="Deployment" items="Vercel, Render" />
            </div>
          </Section>

          {/* Screenshots */}
          <Section title="Kết quả đạt được">
            <div className="grid grid-cols-2 gap-2">
              <ScreenshotItem src="/trangchuwwebsite.jpg" label="Trang chủ Website" />
              <ScreenshotItem src="/trangchuadmin.jpg" label="Trang Admin" />
              <ScreenshotItem src="/trangchugiaovien.jpg" label="Trang Giáo viên" />
              <ScreenshotItem src="/trangchusinhvien.jpg" label="Trang Sinh viên" />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-6 py-3 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=https://edu-score-five.vercel.app"
                alt="QR Code"
                width={50}
                height={50}
              />
            </div>
            <div className="text-white">
              <p className="text-[10px] text-cyan-300 mb-0.5">Website Demo</p>
              <p className="text-xs font-medium">edu-score-five.vercel.app</p>
            </div>
          </div>
          <div className="text-right text-cyan-100 text-[10px] space-y-0.5">
            <p>📧 110122081@tvu.edu.vn</p>
            <p>📍 Vĩnh Long, Việt Nam</p>
            <p>📅 Tháng 12/2025</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border-l-4 border-blue-400">
      <p className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-teal-700">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2 pb-1 border-b-2 border-blue-400 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function FeatureItem({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-center text-white">
      <div className="text-base mb-0.5">{icon}</div>
      <p className="text-[9px] font-semibold">{name}</p>
    </div>
  )
}

function TechItem({ label, items }: { label: string; items: string }) {
  return (
    <div className="bg-gray-50 p-2 rounded-lg">
      <p className="text-[9px] text-gray-500 uppercase mb-0.5">{label}</p>
      <p className="text-[10px] text-teal-700 font-medium">{items}</p>
    </div>
  )
}

function ScreenshotItem({ src, label }: { src: string; label: string }) {
  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div className="h-24 bg-gray-100 relative">
        <Image
          src={src}
          alt={label}
          fill
          className="object-contain object-top"
        />
      </div>
      <div className="bg-gray-50 py-0.5 text-center">
        <p className="text-[9px] font-medium text-gray-600">{label}</p>
      </div>
    </div>
  )
}
