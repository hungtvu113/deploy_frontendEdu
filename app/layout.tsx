import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduScore - Hệ thống Quản lý Điểm thi",
  description: "Hệ thống quản lý điểm thi toàn diện cho các Trung tâm Ngoại ngữ - Tin học. Số hóa quy trình quản lý điểm, giảm thiểu sai sót, nâng cao hiệu quả.",
  keywords: ["quản lý điểm thi", "hệ thống điểm", "ngoại ngữ", "tin học", "eduscore"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              {children}
            </ConfirmDialogProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
