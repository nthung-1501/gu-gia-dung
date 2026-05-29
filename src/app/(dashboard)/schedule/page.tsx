export const dynamic = 'force-dynamic'

import { asc } from 'drizzle-orm'
import { isAfter, format } from 'date-fns'
import { Clock, Calendar } from 'lucide-react'
import { db } from '@/lib/db'
import { publishJobs } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PEAK_HOURS = ['07:00', '12:00', '19:00', '20:00', '21:00']

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Đã lên lịch',
  published: 'Đã đăng',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline' | 'destructive'> = {
  scheduled: 'secondary',
  published: 'success',
  failed: 'destructive',
  cancelled: 'outline',
}

export default async function SchedulePage() {
  const jobs = await db.query.publishJobs.findMany({
    orderBy: [asc(publishJobs.scheduledAt)],
    with: {
      video: {
        with: {
          script: {
            with: { product: true },
          },
        },
      },
    },
  })

  const now = new Date()
  const upcoming = jobs.filter(
    (j) => j.status === 'scheduled' && isAfter(new Date(j.scheduledAt), now)
  )
  const history = jobs.filter(
    (j) => j.status !== 'scheduled' || !isAfter(new Date(j.scheduledAt), now)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lịch đăng bài</h1>
        <p className="text-muted-foreground mt-1">Quản lý lịch đăng TikTok tự động</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Giờ peak TikTok Việt Nam
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PEAK_HOURS.map((hour) => (
              <Badge key={hour} variant="secondary">{hour}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Hệ thống tự động chọn slot gần nhất trong khung giờ peak khi lên lịch.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sắp đăng
            {upcoming.length > 0 && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">({upcoming.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Chưa có video nào được lên lịch.
            </div>
          ) : (
            <div className="divide-y">
              {upcoming.map((job) => (
                <div key={job.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium truncate">
                      {job.video.script.product.name}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">{STATUS_LABELS[job.status]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(job.scheduledAt), 'dd/MM HH:mm')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{job.caption}</p>
                  {Array.isArray(job.hashtags) && job.hashtags.length > 0 && (
                    <p className="text-xs text-blue-500">
                      {(job.hashtags as string[]).map((h) => `#${h}`).join(' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lịch sử
              <span className="ml-2 text-sm font-normal text-muted-foreground">({history.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {history.map((job) => (
                <div key={job.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium truncate">
                      {job.video.script.product.name}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={STATUS_VARIANTS[job.status] ?? 'outline'}>
                        {STATUS_LABELS[job.status] ?? job.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(job.scheduledAt), 'dd/MM HH:mm')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{job.caption}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
