'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Series = 'test-that' | 'house-30s' | 'which-one-better'

const SERIES_LABELS: Record<Series, string> = {
  'test-that': 'Test Thật',
  'house-30s': 'Nhà Gọn 30s',
  'which-one-better': 'Mua Cái Nào?',
}

const ALL_SERIES: Series[] = ['test-that', 'house-30s', 'which-one-better']

type BatchResult = {
  series: Series
  status: 'fulfilled' | 'rejected'
  error: string | null
}

type Props = {
  productId: string
  suggestedSeries: Series[]
}

export function GenerateScriptButton({ productId, suggestedSeries }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<Series | 'all' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Series | null>(null)
  const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null)

  async function handleGenerate(series: Series) {
    setLoading(series)
    setError(null)
    setSuccess(null)
    setBatchResults(null)
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

  async function handleProduceAll() {
    setLoading('all')
    setError(null)
    setSuccess(null)
    setBatchResults(null)
    try {
      const res = await fetch('/api/production/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json() as {
        error?: string
        succeeded?: number
        failed?: number
        results?: BatchResult[]
      }
      if (!res.ok) {
        throw new Error(data.error ?? 'Lỗi tạo video')
      }
      setBatchResults(data.results ?? [])
      router.push('/videos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(null)
    }
  }

  const isDisabled = loading !== null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Tạo 1 kịch bản cho series cụ thể. Series đánh dấu ★ là gợi ý từ brief.
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
                disabled={isDisabled}
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                {SERIES_LABELS[series]}
                {isSuggested && !isLoading && <span className="ml-1 text-xs opacity-70">★</span>}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="border-t pt-3 space-y-2">
        <p className="text-sm text-muted-foreground">
          Hoặc tạo ngay 3 video (1 video cho mỗi series) — kịch bản được tự động tạo và đưa vào sản xuất.
        </p>
        <Button
          onClick={handleProduceAll}
          disabled={isDisabled}
          className="gap-2"
        >
          {loading === 'all' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {loading === 'all' ? 'Đang tạo 3 video...' : 'Tạo cả 3 video ngay'}
        </Button>
      </div>

      {success && (
        <p className="text-sm text-green-600">
          Đã tạo kịch bản series &quot;{SERIES_LABELS[success]}&quot; thành công.
        </p>
      )}
      {batchResults && (
        <div className="text-sm space-y-1">
          {batchResults.map((r) => (
            <p key={r.series} className={r.status === 'fulfilled' ? 'text-green-600' : 'text-destructive'}>
              {SERIES_LABELS[r.series]}: {r.status === 'fulfilled' ? '✓ Đã tạo' : `✗ ${r.error ?? 'Thất bại'}`}
            </p>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
