import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { scripts, products } from '@/lib/db/schema'
import { generateScript } from '@/modules/production/script-generator'
import { eq } from 'drizzle-orm'

const ProductionInputSchema = z.object({
  productId: z.string().uuid(),
  series: z.enum(['test-that', 'house-30s', 'which-one-better']),
  targetDuration: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const input = ProductionInputSchema.parse(body)

    const product = await db.query.products.findFirst({
      where: eq(products.id, input.productId),
    })

    if (!product) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 })
    }

    if (!product.briefJson) {
      return NextResponse.json({ error: 'Sản phẩm chưa có brief. Chạy research trước.' }, { status: 400 })
    }

    const generatedScript = await generateScript({
      productId: input.productId,
      series: input.series,
      productName: product.name,
      keyFeatures: product.briefJson.keyFeatures,
      painPoints: product.briefJson.painPoints,
      suggestedHook: product.briefJson.suggestedHooks?.[0],
      targetDuration: input.targetDuration,
    })

    const [script] = await db.insert(scripts).values({
      productId: input.productId,
      series: input.series,
      hook: generatedScript.hook,
      body: generatedScript.body,
      cta: generatedScript.cta,
      estimatedDuration: generatedScript.estimatedDuration,
      status: 'draft',
    }).returning()

    await db.update(products)
      .set({ status: 'scripted', updatedAt: new Date() })
      .where(eq(products.id, input.productId))

    return NextResponse.json({ script })
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
    const allScripts = await db.query.scripts.findMany({
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      with: { product: true },
    })
    return NextResponse.json({ scripts: allScripts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
