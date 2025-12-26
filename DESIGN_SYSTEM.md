# 🎨 QuizHub Design System

## Tổng quan

Design system của QuizHub được thiết kế với mục tiêu tạo ra trải nghiệm người dùng nhất quán, hiện đại và chuyên nghiệp cho hệ thống quản lý kỳ thi.

## 🎨 Color Palette

### Primary Colors (Blue - Giáo dục)
- **Primary**: `hsl(221.2, 83.2%, 53.3%)` - Màu chủ đạo, thể hiện sự chuyên nghiệp và tin cậy
- **Primary Foreground**: `hsl(210, 40%, 98%)` - Text trên nền primary

### Secondary Colors (Purple - Học thuật)
- **Secondary**: `hsl(262.1, 83.3%, 57.8%)` - Màu phụ, thể hiện sự sáng tạo và học thuật
- **Secondary Foreground**: `hsl(210, 40%, 98%)` - Text trên nền secondary

### Accent Colors (Teal - Thành công)
- **Accent**: `hsl(173.4, 80.4%, 40%)` - Màu nhấn, thể hiện sự thành công và tích cực
- **Accent Foreground**: `hsl(0, 0%, 100%)` - Text trên nền accent

### Semantic Colors
- **Destructive**: `hsl(0, 84.2%, 60.2%)` - Màu cảnh báo/lỗi
- **Muted**: `hsl(210, 40%, 96.1%)` - Màu nền nhạt
- **Border**: `hsl(214.3, 31.8%, 91.4%)` - Màu viền

## 📐 Typography

### Font Families
- **Sans**: Geist Sans - Font chính cho toàn bộ UI
- **Mono**: Geist Mono - Font cho code và số liệu

### Font Sizes
- **Heading 1**: `text-5xl md:text-7xl` (48px - 72px)
- **Heading 2**: `text-4xl md:text-5xl` (36px - 48px)
- **Heading 3**: `text-3xl` (30px)
- **Body Large**: `text-lg md:text-xl` (18px - 20px)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Extra Small**: `text-xs` (12px)

## 🎭 Components

### Buttons

#### Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### With Icons
```tsx
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Button Text
</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Badges

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="success">Success</Badge>
```

### Input Fields

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>
```

## ✨ Animations

### Framer Motion Variants

#### Fade In Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

#### Scale In
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

#### Hover Effects
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -5 }}
  whileTap={{ scale: 0.95 }}
>
  Content
</motion.div>
```

#### Stagger Children
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
</motion.div>
```

## 🎪 Loading States

### Spinner
```tsx
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
```

### Dots
```tsx
<LoadingDots />
```

### Pulse
```tsx
<LoadingPulse />
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Usage
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Content */}
</div>
```

## 🎯 Best Practices

### 1. Consistency
- Sử dụng components từ design system
- Tuân thủ color palette đã định nghĩa
- Giữ spacing nhất quán (4px, 8px, 16px, 24px, 32px)

### 2. Accessibility
- Luôn có label cho input fields
- Sử dụng semantic HTML
- Đảm bảo contrast ratio đủ cao
- Hỗ trợ keyboard navigation

### 3. Performance
- Lazy load images và components
- Sử dụng `whileInView` cho animations khi scroll
- Tối ưu animations với `will-change`

### 4. Animations
- Giữ animations mượt mà (0.3s - 0.5s)
- Không lạm dụng animations
- Sử dụng `ease-in-out` cho transitions tự nhiên

## 🎨 Gradient Backgrounds

### Primary Gradient
```tsx
className="bg-gradient-to-br from-primary to-primary/60"
```

### Secondary Gradient
```tsx
className="bg-gradient-to-br from-secondary to-secondary/60"
```

### Accent Gradient
```tsx
className="bg-gradient-to-br from-accent to-accent/60"
```

### Multi-color Gradient
```tsx
className="bg-gradient-to-r from-primary via-secondary to-accent"
```

## 🌈 Background Effects

### Blur Circles
```tsx
<div className="absolute inset-0 overflow-hidden">
  <motion.div
    className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
</div>
```

## 📦 Component Structure

```
components/
├── ui/                 # Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── label.tsx
├── landing/           # Landing page sections
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   ├── roles-section.tsx
│   └── cta-section.tsx
├── layout/            # Layout components
│   ├── navbar.tsx
│   └── footer.tsx
└── dashboard/         # Dashboard components
    └── stats-card.tsx
```

## 🚀 Quick Start

1. Import components:
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

2. Use with animations:
```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <Button>Click me</Button>
</motion.div>
```

3. Apply theme colors:
```tsx
<div className="bg-primary text-primary-foreground">
  Content
</div>
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-25

