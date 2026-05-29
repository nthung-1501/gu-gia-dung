// Test extractZaloData indirectly via parseZaloProductUrl with a mocked fetch
import { parseZaloProductUrl } from '../zalo-parser'

const mockFetch = jest.fn()
global.fetch = mockFetch

function makeHtml(overrides: {
  title?: string
  description?: string
  price?: string
  images?: string[]
} = {}) {
  const title = overrides.title ?? 'Nồi chiên không khí Xiaomi 4L'
  const description = overrides.description ?? 'Sản phẩm gia dụng cao cấp'
  const price = overrides.price ?? '999.000đ'
  const images = overrides.images ?? [
    'https://example.com/img1.jpg',
    'https://example.com/img2.png',
  ]

  return `
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}" />
      </head>
      <body>
        <p>Giá: ${price}</p>
        ${images.map((src) => `<img src="${src}" alt="product" />`).join('\n')}
      </body>
    </html>
  `
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(makeHtml()),
  })
})

describe('parseZaloProductUrl', () => {
  it('extracts product name from <title>', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(makeHtml({ title: 'Máy xay sinh tố Philips HR2041' })),
    })
    const result = await parseZaloProductUrl('https://zalo.me/product/123')
    expect(result.name).toBe('Máy xay sinh tố Philips HR2041')
  })

  it('extracts description from meta tag', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(makeHtml({ description: 'Xay mịn 700W, bảo hành 1 năm' })),
    })
    const result = await parseZaloProductUrl('https://zalo.me/product/123')
    expect(result.description).toBe('Xay mịn 700W, bảo hành 1 năm')
  })

  it('extracts price from body text', async () => {
    const result = await parseZaloProductUrl('https://zalo.me/product/123')
    expect(result.priceRange).toMatch(/999/)
  })

  it('extracts image URLs (up to 5)', async () => {
    const images = Array.from({ length: 6 }, (_, i) => `https://cdn.zalo.me/img${i}.jpg`)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(makeHtml({ images })),
    })
    const result = await parseZaloProductUrl('https://zalo.me/product/123')
    expect(result.imageUrls).toHaveLength(5)
    expect(result.imageUrls![0]).toBe('https://cdn.zalo.me/img0.jpg')
  })

  it('sets sourceUrl to the input URL', async () => {
    const url = 'https://zalo.me/product/xyz'
    const result = await parseZaloProductUrl(url)
    expect(result.sourceUrl).toBe(url)
  })

  it('throws when fetch returns non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 })
    await expect(parseZaloProductUrl('https://zalo.me/bad')).rejects.toThrow('403')
  })

  it('falls back to default name when no <title>', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><body></body></html>'),
    })
    const result = await parseZaloProductUrl('https://zalo.me/product/123')
    expect(result.name).toBe('Sản phẩm không xác định')
  })
})
