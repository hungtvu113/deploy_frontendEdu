"use client"

import { useState, useEffect } from "react"

export type SeasonalEvent = "christmas" | "newyear" | "tet" | "valentine" | null

interface SeasonalEventInfo {
  event: SeasonalEvent
  name: string
  emoji: string
  colors: {
    primary: string
    secondary: string
  }
}

// Kiểm tra sự kiện theo ngày
function getCurrentEvent(): SeasonalEventInfo {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // Giáng sinh: 15/12 - 31/12
  if (month === 12 && day >= 15) {
    return {
      event: "christmas",
      name: "Giáng sinh",
      emoji: "🎄",
      colors: { primary: "#dc2626", secondary: "#16a34a" }
    }
  }

  // Năm mới: 1/1 - 15/1
  if (month === 1 && day <= 15) {
    return {
      event: "newyear",
      name: "Năm mới",
      emoji: "🎆",
      colors: { primary: "#eab308", secondary: "#f97316" }
    }
  }

  // Valentine: 10/2 - 16/2 (ưu tiên hơn Tết)
  if (month === 2 && day >= 10 && day <= 16) {
    return {
      event: "valentine",
      name: "Valentine",
      emoji: "💕",
      colors: { primary: "#ec4899", secondary: "#f43f5e" }
    }
  }

  // Tết Nguyên Đán: 16/1 - 28/2 (trừ Valentine)
  if ((month === 1 && day >= 16) || month === 2) {
    return {
      event: "tet",
      name: "Tết Nguyên Đán",
      emoji: "🧧",
      colors: { primary: "#dc2626", secondary: "#eab308" }
    }
  }

  return {
    event: null,
    name: "",
    emoji: "",
    colors: { primary: "#3b82f6", secondary: "#3b82f6" }
  }
}

export function useSeasonalEvent() {
  const [eventInfo, setEventInfo] = useState<SeasonalEventInfo>({
    event: null,
    name: "",
    emoji: "",
    colors: { primary: "#3b82f6", secondary: "#3b82f6" }
  })
  const [effectsEnabled, setEffectsEnabled] = useState(true)

  useEffect(() => {
    // Lấy sự kiện hiện tại
    setEventInfo(getCurrentEvent())

    // Đọc setting từ localStorage
    const saved = localStorage.getItem("seasonal-effects")
    if (saved !== null) {
      setEffectsEnabled(saved === "true")
    }
  }, [])

  const toggleEffects = () => {
    const newValue = !effectsEnabled
    setEffectsEnabled(newValue)
    localStorage.setItem("seasonal-effects", String(newValue))
  }

  return {
    ...eventInfo,
    effectsEnabled,
    toggleEffects,
    hasEvent: eventInfo.event !== null
  }
}
