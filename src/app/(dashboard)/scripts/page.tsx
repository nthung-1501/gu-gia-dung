export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SERIES_LABELS: Record<string, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

const SERIES_KEYS = ['test-that', 'house-30s', 'which-one-better'] as const

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'outline',
  approved: 'secondary',
  in_production: 'warning',
  done: 'success',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  approved: 'Đã duyệt',
  in_production: 'Đang làm',
  done: 'Xong',
}

export default async function ScriptsPage() {
  const allScripts = await db.query.scripts.findMany({
    orderBy: (s, { desc }) => [desc(s.createdAt)],
    with: { product: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kịch bản</h1>
        <p className="text-muted-foreground mt-1">Kịch bản video được tạo bởi AI</p>
      </div>

      <div className="flex gap-2">
        {SERIES_KEYS.map((key) => (
          <Badge key={key} variant="outline">{SERIES_LABELS[key]}</Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách kịch bản
            {allScripts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({allScripts.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allScripts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              Chưa có kịch bản nào. Tạo sản phẩm và generate script từ trang Sản phẩm.
            </div>
          ) : (
            <div className="divide-y">
              {allScripts.map((script) => (
                <Link
                  key={script.id}
                  href={`/scripts/${script.id}`}
                  className="block py-4 space-y-2 -mx-2 px-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {SERIES_LABELS[script.series] ?? script.series}
                        </Badge>
                        <span className="text-sm text-muted-foreground truncate">
                          {script.product.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium italic">&ldquo;{script.hook}&rdquo;</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{script.body}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <Badge variant={STATUS_VARIANTS[script.status] ?? 'outline'}>
                        {STATUS_LABELS[script.status] ?? script.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {script.estimatedDuration ? `~${script.estimatedDuration}s` : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(script.createdAt), 'dd/MM')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
