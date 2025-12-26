"use client"

import { GraduationCap } from "lucide-react"
import { SeasonalEvent } from "@/hooks/use-seasonal-event"

interface SeasonalLogoProps {
  event: SeasonalEvent
  size?: "sm" | "md" | "lg"
}

export function SeasonalLogo({ event, size = "md" }: SeasonalLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-20 h-20",
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-10 h-10",
  }

  const decorSizes = {
    sm: "text-xs -top-1 -right-1",
    md: "text-sm -top-1 -right-1",
    lg: "text-2xl -top-2 -right-2",
  }

  // Màu nền theo sự kiện
  const bgColors: Record<string, string> = {
    christmas: "bg-gradient-to-br from-red-500 to-green-600",
    newyear: "bg-gradient-to-br from-yellow-500 to-orange-500",
    tet: "bg-gradient-to-br from-red-500 to-yellow-500",
    valentine: "bg-gradient-to-br from-pink-500 to-rose-500",
    default: "bg-blue-500",
  }

  // Decoration theo sự kiện
  const decorations: Record<string, string> = {
    christmas: "🎅",
    newyear: "🎉",
    tet: "🧧",
    valentine: "💕",
  }

  const bgColor = event ? bgColors[event] : bgColors.default

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-lg flex items-center justify-center relative shadow-lg`}>
      <GraduationCap className={`${iconSizes[size]} text-white`} />
      
      {/* Decoration */}
      {event && (
        <span className={`absolute ${decorSizes[size]}`}>
          {decorations[event]}
        </span>
      )}
    </div>
  )
}
