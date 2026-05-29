export const dynamic = 'force-dynamic'

import { sum, desc } from 'drizzle-orm'
import { format } from 'date-fns'
import { TrendingUp, Eye, Heart, Share2, Bookmark, MessageCircle } from 'lucide-react'
import { db } from '@/lib/db'
import { analyticsSnapshots } from '@/lib/db/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default async function AnalyticsPage() {
  const [totals, recentSnapshots] = await Promise.all([
    db
      .select({
        totalViews: sum(analyticsSnapshots.views),
        totalLikes: sum(analyticsSnapshots.likes),
        totalComments: sum(analyticsSnapshots.comments),
        totalShares: sum(analyticsSnapshots.shares),
        totalSaves: sum(analyticsSnapshots.saves),
      })
      .from(analyticsSnapshots),
    db.query.analyticsSnapshots.findMany({
      orderBy: [desc(analyticsSnapshots.snapshotAt)],
      limit: 20,
      with: {
        publishJob: {
          with: {
            video: {
              with: {
                script: {
                  with: { product: true },
                },
              },
            },
          },
        },
      },
    }),
  ])

  const t = totals[0]
  const views = Number(t.totalViews ?? 0)
  const likes = Number(t.totalLikes ?? 0)
  const comments = Number(t.totalComments ?? 0)
  const shares = Number(t.totalShares ?? 0)
  const saves = Number(t.totalSaves ?? 0)

  const metricCards = [
    { label: 'Tổng views', icon: Eye, value: views },
    { label: 'Tổng likes', icon: Heart, value: likes },
    { label: 'Bình luận', icon: MessageCircle, value: comments },
    { label: 'Tổng shares', icon: Share2, value: shares },
    { label: 'Tổng saves', icon: Bookmark, value: saves },
  ]

  const hasData = recentSnapshots.length >= 5

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Phân tích hiệu suất kênh bằng AI</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {metricCards.map(({ label, icon: Icon, value }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {views === 0 && likes === 0 ? '—' : formatNumber(value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              Cần ít nhất 5 video đã publish để AI phân tích pattern.
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Đã có đủ dữ liệu. Gọi <code className="text-xs bg-muted px-1 rounded">POST /api/analytics</code> để tạo AI insights.
            </p>
          )}
        </CardContent>
      </Card>

      {recentSnapshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lịch sử snapshot
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({recentSnapshots.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentSnapshots.map((snap) => {
                const productName = snap.publishJob.video.script.product.name
                return (
                  <div key={snap.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(snap.snapshotAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {formatNumber(snap.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {formatNumber(snap.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" /> {formatNumber(snap.shares)}
                      </span>
                      {snap.completionRate != null && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(snap.completionRate * 100)}% xem hết
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
