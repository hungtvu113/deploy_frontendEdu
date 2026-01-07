"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

export default function QRCodePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const websiteUrl = "https://edu-score-five.vercel.app"

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, websiteUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
    }
  }, [])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = "eduscore-qrcode.png"
      link.href = canvasRef.current.toDataURL("image/png")
      link.click()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Mã QR - EduScore</h1>
      <p className="text-gray-600 mb-6">{websiteUrl}</p>
      
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <canvas ref={canvasRef} />
      </div>
      
      <button
        onClick={handleDownload}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Tải mã QR (PNG)
      </button>
    </div>
  )
}
