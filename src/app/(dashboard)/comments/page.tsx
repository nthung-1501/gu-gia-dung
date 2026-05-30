export const dynamic = 'force-dynamic'

import { desc } from 'drizzle-orm'
import { format } from 'date-fns'
import { MessageCircle, Video } from 'lucide-react'
import { db } from '@/lib/db'
import { commentTriggers } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommentScanner } from './comment-scanner'

const SERIES_LABELS: Record<string, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

export default async function CommentsPage() {
  const processed = await db.query.commentTriggers.findMany({
    orderBy: [desc(commentTriggers.createdAt)],
    with: {
      responseScript: true,
      responseVideo: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comment → Video</h1>
        <p className="text-muted-foreground mt-1">
          AI đọc comment TikTok và tạo video phản hồi nhắc tên người comment
        </p>
      </div>

      <CommentScanner />

      {processed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Đã xử lý
              <span className="text-sm font-normal text-muted-foreground">({processed.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {processed.map((trigger) => (
                <div key={trigger.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">@{trigger.commenterUsername}</span>
                        {trigger.responseScript && (
                          <Badge variant="secondary">
                            {SERIES_LABELS[trigger.responseScript.series] ?? trigger.responseScript.series}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        &ldquo;{trigger.commentText}&rdquo;
                      </p>
                      {trigger.responseScript && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Video className="h-3 w-3" />
                          <span>Hook: &ldquo;{trigger.responseScript.hook}&rdquo;</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <Badge variant={trigger.responseVideo?.status === 'ready' ? 'success' : 'outline'}>
                        {trigger.responseVideo?.status === 'ready' ? 'Sẵn sàng' : 'Đang xử lý'}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(trigger.createdAt), 'dd/MM HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
