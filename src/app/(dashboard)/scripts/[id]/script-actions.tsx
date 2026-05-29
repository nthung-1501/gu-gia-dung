'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  scriptId: string
  currentStatus: string
}

export function ScriptActions({ scriptId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'produce' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setLoading('approve')
    setError(null)
    try {
      const res = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Lỗi duyệt kịch bản')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(null)
    }
  }

  async function handleProduce() {
    setLoading('produce')
    setError(null)
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Lỗi tạo video')
      }
      router.push('/videos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(null)
    }
  }

  const canApprove = currentStatus === 'draft'
  const canProduce = currentStatus === 'approved'

  if (!canApprove && !canProduce) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <Button onClick={handleApprove} disabled={loading !== null}>
            {loading === 'approve' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Duyệt kịch bản
          </Button>
        )}
        {canProduce && (
          <Button onClick={handleProduce} disabled={loading !== null}>
            {loading === 'produce' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            Tạo video ngay
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
