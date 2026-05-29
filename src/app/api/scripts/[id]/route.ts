import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { scripts } from '@/lib/db/schema'

const PatchScriptSchema = z.object({
  status: z.enum(['draft', 'approved', 'in_production', 'done']).optional(),
  hook: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  cta: z.string().min(1).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const script = await db.query.scripts.findFirst({
      where: eq(scripts.id, params.id),
      with: { product: true },
    })
    if (!script) return NextResponse.json({ error: 'Không tìm thấy kịch bản' }, { status: 404 })
    return NextResponse.json({ script })
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
    const updates = PatchScriptSchema.parse(body)

    const existing = await db.query.scripts.findFirst({
      where: eq(scripts.id, params.id),
    })
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy kịch bản' }, { status: 404 })

    const [updated] = await db
      .update(scripts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scripts.id, params.id))
      .returning()

    return NextResponse.json({ script: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: err.errors }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
