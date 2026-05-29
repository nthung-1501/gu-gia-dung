import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { publishJobs, videos, scripts, products } from '@/lib/db/schema'
import { generateCaption } from '@/modules/publish/caption-generator'
import { getNextPeakSlot } from '@/modules/publish/scheduler'
import { eq } from 'drizzle-orm'

const PublishInputSchema = z.object({
  videoId: z.string().uuid(),
  scheduledAt: z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const input = PublishInputSchema.parse(body)

    const video = await db.select().from(videos).where(eq(videos.id, input.videoId)).limit(1).then((r) => r[0])

    if (!video) {
      return NextResponse.json({ error: 'Video không tồn tại' }, { status: 404 })
    }

    if (video.status !== 'ready') {
      return NextResponse.json({ error: 'Video chưa sẵn sàng để đăng' }, { status: 400 })
    }

    const script = await db.select().from(scripts).where(eq(scripts.id, video.scriptId)).limit(1).then((r) => r[0])
    if (!script) return NextResponse.json({ error: 'Script không tồn tại' }, { status: 404 })

    const product = await db.select().from(products).where(eq(products.id, script.productId)).limit(1).then((r) => r[0])
    if (!product) return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 })

    const caption = await generateCaption({
      productName: product.name,
      series: script.series,
      hook: script.hook,
      verdict: script.cta,
      priceRange: product.priceRange ?? undefined,
    })

    const scheduledAt = input.scheduledAt
      ? new Date(input.scheduledAt)
      : getNextPeakSlot()

    const [job] = await db.insert(publishJobs).values({
      videoId: input.videoId,
      caption: caption.caption,
      hashtags: caption.hashtags,
      scheduledAt,
      status: 'scheduled',
    }).returning()

    return NextResponse.json({ publishJob: job, caption })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: err.errors }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const jobs = await db.query.publishJobs.findMany({
      orderBy: (j, { asc }) => [asc(j.scheduledAt)],
    })
    return NextResponse.json({ publishJobs: jobs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
