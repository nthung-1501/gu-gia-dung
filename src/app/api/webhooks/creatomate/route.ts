import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { videos, scripts } from '@/lib/db/schema'

type CreatomateWebhookPayload = {
  id: string
  status: 'planned' | 'waiting' | 'transcribing' | 'rendering' | 'succeeded' | 'failed'
  url?: string
  snapshot_url?: string
  error_message?: string
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as CreatomateWebhookPayload

    if (payload.status !== 'succeeded' && payload.status !== 'failed') {
      return NextResponse.json({ ok: true })
    }

    const video = await db.query.videos.findFirst({
      where: eq(videos.creatomateJobId, payload.id),
    })

    if (!video) {
      return NextResponse.json({ ok: true })
    }

    if (payload.status === 'succeeded' && payload.url) {
      await db.update(videos)
        .set({
          status: 'ready',
          videoUrl: payload.url,
          thumbnailUrl: payload.snapshot_url ?? null,
          updatedAt: new Date(),
        })
        .where(eq(videos.id, video.id))

      await db.update(scripts)
        .set({ status: 'done', updatedAt: new Date() })
        .where(eq(scripts.id, video.scriptId))
    } else {
      await db.update(videos)
        .set({
          status: 'failed',
          errorMessage: payload.error_message ?? 'Creatomate render failed',
          updatedAt: new Date(),
        })
        .where(eq(videos.id, video.id))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
