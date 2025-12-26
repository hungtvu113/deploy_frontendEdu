"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Trash2, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
  icon?: React.ReactNode
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = React.createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmDialogOptions | null>(null)
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null)

  const confirm = React.useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolveRef.current?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolveRef.current?.(false)
  }

  const typeStyles = {
    danger: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      buttonVariant: "destructive" as const,
    },
    warning: {
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      buttonVariant: "default" as const,
    },
    info: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      buttonVariant: "default" as const,
    },
  }

  const currentType = options?.type || "danger"
  const styles = typeStyles[currentType]

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            {/* Dialog */}
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-background rounded-xl shadow-2xl border max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-full", styles.iconBg)}>
                      {options.icon || (
                        currentType === "danger" ? (
                          <Trash2 className={cn("h-6 w-6", styles.iconColor)} />
                        ) : (
                          <AlertTriangle className={cn("h-6 w-6", styles.iconColor)} />
                        )
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {options.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {options.message}
                      </p>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="p-1 rounded-md hover:bg-muted transition-colors"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                {/* Footer */}
                <div className="px-6 py-4 bg-muted/50 flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    {options.cancelText || "Hủy"}
                  </Button>
                  <Button variant={styles.buttonVariant} onClick={handleConfirm}>
                    {options.confirmText || "Xác nhận"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = React.useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider")
  }
  return context.confirm
}
