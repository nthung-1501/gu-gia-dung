import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { scripts, videos, commentTriggers, publishJobs } from '@/lib/db/schema'
import { generateCommentResponse } from '@/modules/production/comment-response-generator'
import { startVideoPipeline, buildScriptText } from '@/modules/production/video-pipeline'

const Schema = z.object({
  tiktokPostId: z.string().min(1),
  tiktokCommentId: z.string().min(1),
  commenterUsername: z.string().min(1),
  commentText: z.string().min(1).max(500),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const input = Schema.parse(body)

    // Idempotency — skip if already processed
    const existing = await db.query.commentTriggers.findFirst({
      where: eq(commentTriggers.tiktokCommentId, input.tiktokCommentId),
    })
    if (existing) {
      return NextResponse.json({ skipped: true, reason: 'already processed' })
    }

    // Find original publish job → video → script → product
    const publishJob = await db.query.publishJobs.findFirst({
      where: eq(publishJobs.tiktokPostId, input.tiktokPostId),
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

    if (!publishJob?.video?.script?.product) {
      return NextResponse.json({ error: 'Không tìm thấy video gốc cho post này' }, { status: 404 })
    }

    const originalScript = publishJob.video.script
    const product = originalScript.product

    if (!product.briefJson) {
      return NextResponse.json({ error: 'Sản phẩm không có brief' }, { status: 400 })
    }

    // AI generates response script
    const generated = await generateCommentResponse({
      commenterUsername: input.commenterUsername,
      commentText: input.commentText,
      productName: product.name,
      productBrief: product.briefJson,
      originalHook: originalScript.hook,
    })

    // Insert script (auto-approved)
    const [script] = await db.insert(scripts).values({
      productId: product.id,
      series: generated.series,
      hook: generated.hook,
      body: generated.body,
      cta: generated.cta,
      shotNotes: generated.shotNotes,
      estimatedDuration: generated.estimatedDuration,
      status: 'approved',
    }).returning()

    // Create video record
    const [video] = await db.insert(videos).values({
      scriptId: script.id,
      status: 'pending',
    }).returning()

    const scriptText = buildScriptText(script.hook, script.body, script.cta, script.shotNotes ?? undefined)

    const pipelineResult = await startVideoPipeline({
      videoId: video.id,
      scriptId: script.id,
      scriptText,
      series: generated.series,
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

    // Record trigger (idempotency key)
    const [trigger] = await db.insert(commentTriggers).values({
      tiktokPostId: input.tiktokPostId,
      tiktokCommentId: input.tiktokCommentId,
      commenterUsername: input.commenterUsername,
      commentText: input.commentText,
      responseScriptId: script.id,
      responseVideoId: updatedVideo.id,
    }).returning()

    return NextResponse.json({ trigger, script, video: updatedVideo })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: err.errors }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
