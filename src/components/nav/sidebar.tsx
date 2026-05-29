'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package, FileText, Calendar, BarChart2, Home, Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/', label: 'Tổng quan', icon: Home },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/scripts', label: 'Kịch bản', icon: FileText },
  { href: '/videos', label: 'Video', icon: Video },
  { href: '/schedule', label: 'Lịch đăng', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background flex flex-col">
      <div className="flex h-16 items-center px-6">
        <span className="font-display font-bold text-lg tracking-tight">
          Gu Gia Dụng
        </span>
        <span className="ml-2 text-xs text-muted-foreground font-sans">AI</span>
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary-foreground font-medium text-[hsl(152,50%,25%)]'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Separator />
      <div className="px-6 py-4 text-xs text-muted-foreground">
        v0.1.0 · Gu Gia Dụng
      </div>
    </aside>
  )
}
