"use client"

import { useToast as useToastContext } from "@/components/ui/toast"

type ToastVariant = "default" | "destructive"

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const toastContext = useToastContext()

  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    if (variant === "destructive") {
      toastContext.error(title, description)
    } else {
      toastContext.success(title, description)
    }
  }

  return { 
    toast, 
    success: toastContext.success,
    error: toastContext.error,
    warning: toastContext.warning,
    info: toastContext.info,
  }
}
