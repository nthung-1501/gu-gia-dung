import type { ResearchInput } from './types'

type ZaloProductData = {
  name: string
  description?: string
  priceRange?: string
  imageUrls?: string[]
}

export async function parseZaloProductUrl(url: string): Promise<ResearchInput> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    },
  })

  if (!res.ok) throw new Error(`Failed to fetch Zalo URL: ${res.status}`)

  const html = await res.text()
  const data = extractZaloData(html)

  return {
    name: data.name,
    description: data.description,
    priceRange: data.priceRange,
    imageUrls: data.imageUrls,
    sourceUrl: url,
  }
}

function extractZaloData(html: string): ZaloProductData {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)
  const priceMatch = html.match(/(\d{1,3}(?:[.,]\d{3})*)\s*(?:đ|vnđ|₫|dong)/i)
  const imgMatches = [...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)]

  return {
    name: titleMatch?.[1]?.trim() ?? 'Sản phẩm không xác định',
    description: descMatch?.[1]?.trim(),
    priceRange: priceMatch?.[0],
    imageUrls: imgMatches.slice(0, 5).map((m) => m[1]),
  }
}
