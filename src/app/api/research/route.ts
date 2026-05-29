import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { generateProductBrief } from '@/modules/research/brief-generator'
import { parseZaloProductUrl } from '@/modules/research/zalo-parser'

const ResearchInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priceRange: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  imageUrls: z.array(z.string().url()).optional(),
  imageBase64s: z.array(z.string().startsWith('data:')).max(3).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown
    const input = ResearchInputSchema.parse(body)

    let enrichedInput = { ...input }

    if (input.sourceUrl && input.sourceUrl.includes('zalo')) {
      const zaloData = await parseZaloProductUrl(input.sourceUrl)
      enrichedInput = {
        ...enrichedInput,
        description: enrichedInput.description ?? zaloData.description,
        imageUrls: enrichedInput.imageUrls ?? zaloData.imageUrls,
      }
    }

    if (input.imageBase64s) {
      enrichedInput = { ...enrichedInput, imageBase64s: input.imageBase64s }
    }

    const brief = await generateProductBrief(enrichedInput)

    const [product] = await db.insert(products).values({
      name: input.name,
      description: input.description,
      imageUrls: input.imageUrls ?? [],
      sourceUrl: input.sourceUrl || null,
      priceRange: input.priceRange,
      status: 'researched',
      briefJson: brief,
    }).returning()

    return NextResponse.json({ product, brief })
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
    const allProducts = await db.query.products.findMany({
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    })
    return NextResponse.json({ products: allProducts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
