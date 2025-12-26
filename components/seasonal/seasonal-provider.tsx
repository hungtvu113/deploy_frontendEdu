"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type SeasonalEvent = "christmas" | "newyear" | "tet" | "valentine" | null

interface SeasonalContextType {
  event: SeasonalEvent
  name: string
  emoji: string
  effectsEnabled: boolean
  toggleEffects: () => void
  hasEvent: boolean
}

const SeasonalContext = createContext<SeasonalContextType | null>(null)

// Kiểm tra sự kiện theo ngày
function getCurrentEvent(): { event: SeasonalEvent; name: string; emoji: string } {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // Giáng sinh: 15/12 - 31/12
  if (month === 12 && day >= 15) {
    return { event: "christmas", name: "Giáng sinh", emoji: "🎄" }
  }

  // Năm mới: 1/1 - 15/1
  if (month === 1 && day <= 15) {
    return { event: "newyear", name: "Năm mới", emoji: "🎆" }
  }

  // Valentine: 10/2 - 16/2 (ưu tiên hơn Tết trong khoảng này)
  if (month === 2 && day >= 10 && day <= 16) {
    return { event: "valentine", name: "Valentine", emoji: "💕" }
  }

  // Tết Nguyên Đán: 16/1 - 28/2 (trừ Valentine)
  if ((month === 1 && day >= 16) || month === 2) {
    return { event: "tet", name: "Tết Nguyên Đán", emoji: "🧧" }
  }

  return { event: null, name: "", emoji: "" }
}

export function SeasonalProvider({ children }: { children: ReactNode }) {
  const [eventInfo, setEventInfo] = useState<{ event: SeasonalEvent; name: string; emoji: string }>({
    event: null,
    name: "",
    emoji: "",
  })
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  // Tránh hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SeasonalContext.Provider
      value={{
        ...eventInfo,
        effectsEnabled,
        toggleEffects,
        hasEvent: eventInfo.event !== null,
      }}
    >
      {children}
    </SeasonalContext.Provider>
  )
}

export function useSeasonalContext() {
  const context = useContext(SeasonalContext)
  if (!context) {
    // Return default values if not in provider
    return {
      event: null as SeasonalEvent,
      name: "",
      emoji: "",
      effectsEnabled: true,
      toggleEffects: () => {},
      hasEvent: false,
    }
  }
  return context
}
