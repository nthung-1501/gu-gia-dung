'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  videoId: string
}

export function PublishButton({ videoId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSchedule() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Lỗi lên lịch đăng')
      }
      router.push('/schedule')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button size="sm" onClick={handleSchedule} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Send className="h-3 w-3" />
        )}
        Lên lịch đăng
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
