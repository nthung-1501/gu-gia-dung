'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Series = 'test-that' | 'house-30s' | 'which-one-better'

const SERIES_LABELS: Record<Series, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

const ALL_SERIES: Series[] = ['test-that', 'house-30s', 'which-one-better']

type Props = {
  productId: string
  suggestedSeries: Series[]
}

export function GenerateScriptButton({ productId, suggestedSeries }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<Series | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Series | null>(null)

  async function handleGenerate(series: Series) {
    setLoading(series)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, series }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Lỗi tạo kịch bản')
      }
      setSuccess(series)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Chọn series để Claude tạo kịch bản tự động. Series được đánh dấu ★ là gợi ý từ brief.
      </p>
      <div className="flex flex-wrap gap-2">
        {ALL_SERIES.map((series) => {
          const isSuggested = suggestedSeries.includes(series)
          const isLoading = loading === series
          return (
            <Button
              key={series}
              variant={isSuggested ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGenerate(series)}
              disabled={loading !== null}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {SERIES_LABELS[series]}
              {isSuggested && !isLoading && <span className="ml-1 text-xs opacity-70">★</span>}
            </Button>
          )
        })}
      </div>
      {success && (
        <p className="text-sm text-green-600">
          Đã tạo kịch bản series &quot;{SERIES_LABELS[success]}&quot; thành công.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
