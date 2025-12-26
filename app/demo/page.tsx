"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner, LoadingDots, LoadingPulse } from "@/components/ui/loading-spinner"
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  Heart,
  Star,
  Rocket
} from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            EduScore UI Components
          </h1>
          <p className="text-xl text-muted-foreground">
            Bộ sưu tập components và animations đẹp mắt
          </p>
        </motion.div>

        {/* Buttons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Các kiểu button với animations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button className="group">
                  <Sparkles className="mr-2 w-4 h-4" />
                  With Icon
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                  Gradient Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Các kiểu badge để hiển thị trạng thái</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="success">Success</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Các kiểu loading animations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm text-muted-foreground">Spinner</p>
                </div>
                <div className="text-center space-y-4">
                  <LoadingDots />
                  <p className="text-sm text-muted-foreground">Dots</p>
                </div>
                <div className="text-center space-y-4">
                  <LoadingPulse />
                  <p className="text-sm text-muted-foreground">Pulse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Animated Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Animated Cards</CardTitle>
              <CardDescription>Cards với hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Zap, title: "Fast", color: "from-primary to-primary/60" },
                  { icon: Star, title: "Quality", color: "from-secondary to-secondary/60" },
                  { icon: Rocket, title: "Modern", color: "from-accent to-accent/60" },
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card className="cursor-pointer border-2 hover:border-primary/30 transition-all">
                        <CardContent className="p-6 text-center space-y-4">
                          <motion.div
                            className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Hover để xem animation
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields với animations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" placeholder="Nhập họ tên..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="overflow-hidden relative">
            <CardHeader>
              <CardTitle>Floating Animation</CardTitle>
              <CardDescription>Elements với floating effect</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center relative">
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.div
                  key={index}
                  className="absolute w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-sm"
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 40 - 20, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                  style={{
                    left: `${20 + index * 15}%`,
                    top: "50%",
                  }}
                />
              ))}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <GraduationCap className="w-24 h-24 text-primary" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

