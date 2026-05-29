export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import { db } from '@/lib/db'
import { products, scripts } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GenerateScriptButton } from './generate-script-button'

const SERIES_LABELS: Record<string, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

const SCRIPT_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'outline',
  approved: 'secondary',
  in_production: 'warning',
  done: 'success',
}

const SCRIPT_STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  approved: 'Đã duyệt',
  in_production: 'Đang làm',
  done: 'Xong',
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, params.id),
  })

  if (!product) notFound()

  const productScripts = await db.query.scripts.findMany({
    where: eq(scripts.productId, params.id),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  })

  const { briefJson } = product

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {product.category && <Badge variant="outline">{product.category}</Badge>}
            {product.priceRange && (
              <span className="text-sm text-muted-foreground">{product.priceRange}</span>
            )}
          </div>
        </div>
      </div>

      {briefJson ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Đối tượng mục tiêu
                </p>
                <p>{briefJson.targetAudience}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Tính năng chính
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {briefJson.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Pain points
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {briefJson.painPoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              {briefJson.contentAngles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Góc content
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {briefJson.contentAngles.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {briefJson.suggestedHooks?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Hook gợi ý
                  </p>
                  <ul className="space-y-1">
                    {briefJson.suggestedHooks.map((h, i) => (
                      <li key={i} className="bg-muted rounded px-3 py-1.5 italic text-muted-foreground">
                        &ldquo;{h}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {briefJson.suggestedSeries?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Series phù hợp
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {briefJson.suggestedSeries.map((s) => (
                      <Badge key={s} variant="secondary">{SERIES_LABELS[s] ?? s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tạo kịch bản</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerateScriptButton
                productId={product.id}
                suggestedSeries={briefJson.suggestedSeries ?? []}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sản phẩm chưa có brief. Vui lòng tạo lại từ trang Thêm sản phẩm.
          </CardContent>
        </Card>
      )}

      {productScripts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Kịch bản đã tạo
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({productScripts.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {productScripts.map((script) => (
                <div key={script.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{SERIES_LABELS[script.series] ?? script.series}</Badge>
                      <Badge variant={SCRIPT_STATUS_VARIANTS[script.status] ?? 'outline'}>
                        {SCRIPT_STATUS_LABELS[script.status] ?? script.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {script.estimatedDuration ? `~${script.estimatedDuration}s` : ''} · {format(new Date(script.createdAt), 'dd/MM HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm font-medium italic">&ldquo;{script.hook}&rdquo;</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{script.body}</p>
                  {script.cta && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">CTA:</span> {script.cta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
