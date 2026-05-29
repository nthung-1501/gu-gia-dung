import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { analyticsSnapshots } from '@/lib/db/schema'
import { collectMetrics } from '@/modules/analytics/metrics-collector'
import { generateChannelInsight } from '@/modules/analytics/insights'
import { desc } from 'drizzle-orm'

const CollectInputSchema = z.object({
  publishJobId: z.string().uuid(),
  tiktokPostId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const input = CollectInputSchema.parse(body)

    const metrics = await collectMetrics(input.publishJobId, input.tiktokPostId)
    return NextResponse.json({ metrics })
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
    const snapshots = await db.select().from(analyticsSnapshots)
      .orderBy(desc(analyticsSnapshots.snapshotAt))
      .limit(50)

    if (snapshots.length < 5) {
      return NextResponse.json({ snapshots, insight: null, message: 'Cần ít nhất 5 video để phân tích' })
    }

    const recentMetrics = snapshots.slice(0, 20).map((s) => ({
      tiktokPostId: s.tiktokPostId,
      views: s.views,
      likes: s.likes,
      comments: s.comments,
      shares: s.shares,
      saves: s.saves,
      avgWatchTime: s.avgWatchTime ?? undefined,
      completionRate: s.completionRate ?? undefined,
    }))

    const insight = await generateChannelInsight(recentMetrics)
    return NextResponse.json({ snapshots, insight })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
