export const dynamic = 'force-dynamic'

import { ClientBoundary } from './client-boundary'
import { count } from 'drizzle-orm'
import { Package, FileText, Calendar, TrendingUp } from 'lucide-react'
import { db } from '@/lib/db'
import { products, scripts, publishJobs } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const [productCount, scriptCount, scheduleCount] = await Promise.all([
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(scripts),
    db.select({ value: count() }).from(publishJobs),
  ])

  const stats = [
    {
      label: 'Sản phẩm',
      value: productCount[0].value,
      icon: Package,
      description: 'Trong kho',
    },
    {
      label: 'Kịch bản',
      value: scriptCount[0].value,
      icon: FileText,
      description: 'Đã tạo',
    },
    {
      label: 'Lịch đăng',
      value: scheduleCount[0].value,
      icon: Calendar,
      description: 'Tổng cộng',
    },
    {
      label: 'Tổng views',
      value: '—',
      icon: TrendingUp,
      description: 'Tháng này',
    },
  ]

  return (
    <div className="space-y-8">
      <ClientBoundary />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground mt-1">Chào mừng đến với Gu Gia Dụng AI Dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, description }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" /> Research
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> Production
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Publish
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Analytics
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
