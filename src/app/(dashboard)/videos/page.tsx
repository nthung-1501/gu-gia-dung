export const dynamic = 'force-dynamic'

import { desc, eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { Video, CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import { videos, scripts, products } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublishButton } from './publish-button'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  rendering: 'Đang render',
  ready: 'Sẵn sàng',
  failed: 'Thất bại',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline' | 'destructive'> = {
  pending: 'outline',
  rendering: 'warning',
  ready: 'success',
  failed: 'destructive',
}

const SERIES_LABELS: Record<string, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ready') return <CheckCircle2 className="h-4 w-4 text-green-500" />
  if (status === 'rendering') return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
  if (status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />
  return <Clock className="h-4 w-4 text-muted-foreground" />
}

export default async function VideosPage() {
  const allVideos = await db
    .select({
      id: videos.id,
      status: videos.status,
      videoUrl: videos.videoUrl,
      thumbnailUrl: videos.thumbnailUrl,
      durationSeconds: videos.durationSeconds,
      errorMessage: videos.errorMessage,
      topviewJobId: videos.topviewJobId,
      createdAt: videos.createdAt,
      updatedAt: videos.updatedAt,
      scriptId: videos.scriptId,
      scriptHook: scripts.hook,
      scriptSeries: scripts.series,
      productName: products.name,
    })
    .from(videos)
    .innerJoin(scripts, eq(videos.scriptId, scripts.id))
    .innerJoin(products, eq(scripts.productId, products.id))
    .orderBy(desc(videos.createdAt))

  const readyVideos = allVideos.filter((v) => v.status === 'ready')
  const pendingVideos = allVideos.filter((v) => v.status !== 'ready')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Video</h1>
        <p className="text-muted-foreground mt-1">Quản lý quá trình production video</p>
      </div>

      {allVideos.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Chưa có video nào. Approve kịch bản và nhấn &ldquo;Tạo video ngay&rdquo; từ trang Script.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {readyVideos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Sẵn sàng đăng
                  <span className="ml-1 text-sm font-normal text-muted-foreground">({readyVideos.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {readyVideos.map((video) => (
                    <div key={video.id} className="py-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">
                              {SERIES_LABELS[video.scriptSeries] ?? video.scriptSeries}
                            </Badge>
                            <span className="text-sm font-medium truncate">{video.productName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground italic line-clamp-1">
                            &ldquo;{video.scriptHook}&rdquo;
                          </p>
                          {video.durationSeconds && (
                            <p className="text-xs text-muted-foreground">{video.durationSeconds}s</p>
                          )}
                        </div>
                        <div className="shrink-0 space-y-1 text-right">
                          <Badge variant="success">Sẵn sàng</Badge>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(video.updatedAt), 'dd/MM HH:mm')}
                          </p>
                        </div>
                      </div>
                      {video.videoUrl && (
                        <video
                          src={video.videoUrl}
                          controls
                          className="w-full max-w-xs rounded border aspect-[9/16] object-cover"
                        />
                      )}
                      <PublishButton videoId={video.id} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pendingVideos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Đang xử lý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {pendingVideos.map((video) => (
                    <div key={video.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusIcon status={video.status} />
                          <Badge variant="secondary">
                            {SERIES_LABELS[video.scriptSeries] ?? video.scriptSeries}
                          </Badge>
                          <span className="text-sm truncate">{video.productName}</span>
                        </div>
                        {video.errorMessage && (
                          <p className="text-xs text-destructive">{video.errorMessage}</p>
                        )}
                        {video.topviewJobId && (
                          <p className="text-xs text-muted-foreground">Job: {video.topviewJobId}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <Badge variant={STATUS_VARIANTS[video.status] ?? 'outline'}>
                          {STATUS_LABELS[video.status] ?? video.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(video.createdAt), 'dd/MM HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
