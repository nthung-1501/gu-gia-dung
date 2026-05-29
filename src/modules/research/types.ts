import type { ProductBrief } from '@/lib/db/schema'

export type ResearchInput = {
  name: string
  description?: string
  imageUrls?: string[]
  imageBase64s?: string[]
  sourceUrl?: string
  priceRange?: string
}

export type ResearchResult = {
  productId: string
  brief: ProductBrief
}

export { type ProductBrief }
