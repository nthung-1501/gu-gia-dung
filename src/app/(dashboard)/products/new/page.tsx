'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, X, ImagePlus } from 'lucide-react'

const MAX_IMAGES = 3
const MAX_SIZE_MB = 4

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES)
    const oversized = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (oversized) {
      setError(`Ảnh "${oversized.name}" vượt quá ${MAX_SIZE_MB}MB`)
      return
    }
    const dataUrls = await Promise.all(files.map(readFileAsDataURL))
    setImagePreviews(dataUrls)
    setError(null)
  }

  function removeImage(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      priceRange: (formData.get('priceRange') as string) || undefined,
      sourceUrl: (formData.get('sourceUrl') as string) || undefined,
      imageBase64s: imagePreviews.length > 0 ? imagePreviews : undefined,
    }

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Lỗi khi tạo sản phẩm')
      }

      router.push('/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Thêm sản phẩm mới</h1>
        <p className="text-muted-foreground mt-1">
          Điền thông tin để Claude tạo product brief tự động
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input id="name" name="name" placeholder="Ví dụ: Nồi chiên không khí Xiaomi 4L" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả sơ bộ về sản phẩm, tính năng nổi bật..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Tầm giá</Label>
              <Input id="priceRange" name="priceRange" placeholder="Ví dụ: 800.000 - 1.200.000đ" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Link Zalo / nguồn</Label>
              <Input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://zalo.me/..." />
            </div>

            <div className="space-y-2">
              <Label>Ảnh sản phẩm (tối đa {MAX_IMAGES} ảnh, mỗi ảnh &lt; {MAX_SIZE_MB}MB)</Label>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-md border border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-xs">Thêm ảnh</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreviews.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Claude sẽ phân tích {imagePreviews.length} ảnh để bổ sung thông tin sản phẩm
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Đang tạo brief...' : 'Tạo brief với AI'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Huỷ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
