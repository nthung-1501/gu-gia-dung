import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { videos, scripts, products } from '@/lib/db/schema'
import { startVideoPipeline, buildScriptText } from '@/modules/production/video-pipeline'

const CreateVideoSchema = z.object({
  scriptId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const input = CreateVideoSchema.parse(body)

    const script = await db.query.scripts.findFirst({
      where: eq(scripts.id, input.scriptId),
      with: { product: true },
    })

    if (!script) {
      return NextResponse.json({ error: 'Kịch bản không tồn tại' }, { status: 404 })
    }

    if (script.status !== 'approved') {
      return NextResponse.json(
        { error: 'Kịch bản chưa được duyệt. Approve script trước khi tạo video.' },
        { status: 400 }
      )
    }

    const scriptText = buildScriptText(script.hook, script.body, script.cta, script.shotNotes ?? undefined)

    const [video] = await db.insert(videos).values({
      scriptId: input.scriptId,
      status: 'pending',
    }).returning()

    const pipelineResult = await startVideoPipeline({
      videoId: video.id,
      scriptId: input.scriptId,
      scriptText,
      series: script.series,
      productName: script.product.name,
      hook: script.hook,
    })

    const [updated] = await db
      .update(videos)
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
      .where(eq(scripts.id, input.scriptId))

    return NextResponse.json({ video: updated })
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
    const allVideos = await db
      .select({
        id: videos.id,
        status: videos.status,
        videoUrl: videos.videoUrl,
        thumbnailUrl: videos.thumbnailUrl,
        durationSeconds: videos.durationSeconds,
        topviewJobId: videos.topviewJobId,
        creatomateJobId: videos.creatomateJobId,
        errorMessage: videos.errorMessage,
        createdAt: videos.createdAt,
        updatedAt: videos.updatedAt,
        scriptId: videos.scriptId,
        scriptHook: scripts.hook,
        scriptSeries: scripts.series,
        productName: products.name,
        productId: products.id,
      })
      .from(videos)
      .innerJoin(scripts, eq(videos.scriptId, scripts.id))
      .innerJoin(products, eq(scripts.productId, products.id))
      .orderBy(desc(videos.createdAt))

    return NextResponse.json({ videos: allVideos })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
