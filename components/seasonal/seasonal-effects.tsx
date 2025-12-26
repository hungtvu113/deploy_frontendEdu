"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { SeasonalEvent } from "@/hooks/use-seasonal-event"

interface SeasonalEffectsProps {
  event: SeasonalEvent
  enabled: boolean
}

// Component tuyết rơi cho Giáng sinh
function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; x: number; delay: number; duration: number; size: number }>>([])

  useEffect(() => {
    const flakes = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      size: 10 + Math.random() * 16,
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-blue-300 drop-shadow-md"
          style={{
            left: `${flake.x}%`,
            fontSize: flake.size,
            textShadow: "0 0 5px rgba(59, 130, 246, 0.5)",
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "100vh",
            opacity: [0, 1, 1, 0.8],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  )
}

// Component pháo hoa cho Năm mới
function Fireworks() {
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const fw = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 50,
      delay: Math.random() * 3,
    }))
    setFireworks(fw)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {fireworks.map((fw) => (
        <motion.div
          key={fw.id}
          className="absolute text-3xl"
          style={{ 
            left: `${fw.x}%`, 
            top: `${fw.y}%`,
            filter: "drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))"
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.8, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: fw.delay,
            repeat: Infinity,
            repeatDelay: 1.5 + Math.random() * 2,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  )
}

// Component hoa đào cho Tết
function PeachBlossoms() {
  const [petals, setPetals] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const p = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 7,
    }))
    setPetals(p)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute text-pink-400 text-xl"
          style={{ 
            left: `${petal.x}%`,
            filter: "drop-shadow(0 0 3px rgba(244, 114, 182, 0.6))"
          }}
          initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: "100vh",
            x: [0, 30, -20, 10, 0],
            opacity: [0, 1, 1, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          🌸
        </motion.div>
      ))}
    </div>
  )
}

// Component trái tim cho Valentine
function Hearts() {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number; duration: number; size: number }>>([])

  useEffect(() => {
    const h = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
      size: 16 + Math.random() * 16,
    }))
    setHearts(h)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-500"
          style={{ 
            left: `${heart.x}%`, 
            fontSize: heart.size,
            filter: "drop-shadow(0 0 5px rgba(236, 72, 153, 0.6))"
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: -50,
            opacity: [0, 1, 1, 0.8],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  )
}

export function SeasonalEffects({ event, enabled }: SeasonalEffectsProps) {
  if (!enabled || !event) return null

  switch (event) {
    case "christmas":
      return <Snowfall />
    case "newyear":
      return <Fireworks />
    case "tet":
      return <PeachBlossoms />
    case "valentine":
      return <Hearts />
    default:
      return null
  }
}
