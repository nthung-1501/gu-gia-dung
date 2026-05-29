export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScriptActions } from './script-actions'
import { ScriptEditForm } from './script-edit-form'

const SERIES_LABELS: Record<string, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

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

export default async function ScriptDetailPage({ params }: { params: { id: string } }) {
  const script = await db.query.scripts.findFirst({
    where: eq(scripts.id, params.id),
    with: { product: true },
  })

  if (!script) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/scripts" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{script.product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{SERIES_LABELS[script.series] ?? script.series}</Badge>
            <Badge variant={STATUS_VARIANTS[script.status] ?? 'outline'}>
              {STATUS_LABELS[script.status] ?? script.status}
            </Badge>
            {script.estimatedDuration && (
              <span className="text-sm text-muted-foreground">~{script.estimatedDuration}s</span>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(script.createdAt), 'dd/MM/yyyy HH:mm')}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kịch bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Hook (3 giây đầu)
            </p>
            <p className="text-base font-medium italic bg-muted rounded px-4 py-3">
              &ldquo;{script.hook}&rdquo;
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Nội dung chính
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{script.body}</p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Call to Action
            </p>
            <p className="text-sm font-medium">{script.cta}</p>
          </div>
        </CardContent>
      </Card>

      {script.status === 'draft' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chỉnh sửa kịch bản</CardTitle>
          </CardHeader>
          <CardContent>
            <ScriptEditForm
              scriptId={script.id}
              initialHook={script.hook}
              initialBody={script.body}
              initialCta={script.cta}
            />
          </CardContent>
        </Card>
      )}

      {(script.status === 'draft' || script.status === 'approved') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hành động</CardTitle>
          </CardHeader>
          <CardContent>
            <ScriptActions scriptId={script.id} currentStatus={script.status} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
