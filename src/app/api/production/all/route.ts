import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { scripts, videos, products } from '@/lib/db/schema'
import { generateScript } from '@/modules/production/script-generator'
import { startVideoPipeline } from '@/modules/production/video-pipeline'

const ALL_SERIES = ['test-that', 'house-30s', 'which-one-better'] as const
type Series = typeof ALL_SERIES[number]

const Schema = z.object({
  productId: z.string().uuid(),
})

async function produceOneSeries(
  series: Series,
  product: { id: string; name: string; briefJson: NonNullable<{ keyFeatures: string[]; painPoints: string[]; suggestedHooks?: string[] }> }
) {
  const generatedScript = await generateScript({
    productId: product.id,
    series,
    productName: product.name,
    keyFeatures: product.briefJson.keyFeatures,
    painPoints: product.briefJson.painPoints,
    suggestedHook: product.briefJson.suggestedHooks?.[0],
  })

  const [script] = await db.insert(scripts).values({
    productId: product.id,
    series,
    hook: generatedScript.hook,
    body: generatedScript.body,
    cta: generatedScript.cta,
    estimatedDuration: generatedScript.estimatedDuration,
    status: 'approved',
  }).returning()

  const [video] = await db.insert(videos).values({
    scriptId: script.id,
    status: 'pending',
  }).returning()

  const scriptText = `${script.hook}\n\n${script.body}\n\n${script.cta}`

  const pipelineResult = await startVideoPipeline({
    videoId: video.id,
    scriptId: script.id,
    scriptText,
    series,
    productName: product.name,
    hook: script.hook,
  })

  const [updatedVideo] = await db.update(videos)
    .set({
      topviewJobId: pipelineResult.topviewJobId || null,
      status: pipelineResult.status === 'submitted' ? 'rendering' : 'failed',
      errorMessage: pipelineResult.error ?? null,
      updatedAt: new Date(),
    })
    .where(eq(videos.id, video.id))
    .returning()

  await db.update(scripts)
    .set({ status: 'in_production', updatedAt: new Date() })
    .where(eq(scripts.id, script.id))

  return { series, script, video: updatedVideo }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const { productId } = Schema.parse(body)

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })

    if (!product) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 })
    }

    if (!product.briefJson) {
      return NextResponse.json({ error: 'Sản phẩm chưa có brief. Chạy research trước.' }, { status: 400 })
    }

    const productData = {
      id: product.id,
      name: product.name,
      briefJson: product.briefJson,
    }

    const results = await Promise.allSettled(
      ALL_SERIES.map((series) => produceOneSeries(series, productData))
    )

    await db.update(products)
      .set({ status: 'scripted', updatedAt: new Date() })
      .where(eq(products.id, productId))

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      total: results.length,
      succeeded,
      failed,
      results: results.map((r, i) => ({
        series: ALL_SERIES[i],
        status: r.status,
        data: r.status === 'fulfilled' ? r.value : null,
        error: r.status === 'rejected' ? String((r as PromiseRejectedResult).reason) : null,
      })),
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: err.errors }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
