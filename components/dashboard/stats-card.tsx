"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "primary" | "secondary" | "accent" | "destructive"
  delay?: number
}

const colorClasses = {
  primary: "from-primary to-primary/60",
  secondary: "from-secondary to-secondary/60",
  accent: "from-accent to-accent/60",
  destructive: "from-destructive to-destructive/60",
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/30 transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className="text-3xl font-bold"
              >
                {value}
              </motion.p>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={cn(
                      "font-medium",
                      trend.isPositive ? "text-accent" : "text-destructive"
                    )}
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value}%
                  </span>
                  <span className="text-muted-foreground">so với tháng trước</span>
                </div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: delay + 0.1 }}
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                colorClasses[color]
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

