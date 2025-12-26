"use client"

import { Sparkles, SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EffectToggleProps {
  enabled: boolean
  onToggle: () => void
  eventName: string
}

export function EffectToggle({ enabled, onToggle, eventName }: EffectToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="gap-2 text-xs"
      title={enabled ? "Tắt hiệu ứng" : "Bật hiệu ứng"}
    >
      {enabled ? (
        <>
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="hidden sm:inline">{eventName}</span>
        </>
      ) : (
        <>
          <SparklesIcon className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">Hiệu ứng tắt</span>
        </>
      )}
    </Button>
  )
}
