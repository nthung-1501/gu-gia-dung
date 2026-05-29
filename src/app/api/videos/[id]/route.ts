import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { videos, scripts } from '@/lib/db/schema'

const PatchVideoSchema = z.object({
  status: z.enum(['pending', 'rendering', 'ready', 'failed']).optional(),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.number().int().positive().optional(),
  creatomateJobId: z.string().optional(),
  errorMessage: z.string().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, params.id),
      with: {
        script: {
          with: { product: true },
        },
      },
    })
    if (!video) return NextResponse.json({ error: 'Không tìm thấy video' }, { status: 404 })
    return NextResponse.json({ video })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as unknown
    const updates = PatchVideoSchema.parse(body)

    const existing = await db.query.videos.findFirst({
      where: eq(videos.id, params.id),
    })
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy video' }, { status: 404 })

    const [updated] = await db
      .update(videos)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videos.id, params.id))
      .returning()

    // When video is ready, mark script as done
    if (updates.status === 'ready') {
      await db.update(scripts)
        .set({ status: 'done', updatedAt: new Date() })
        .where(eq(scripts.id, existing.scriptId))
    }

    return NextResponse.json({ video: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: err.errors }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
