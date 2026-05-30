'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, MessageCircle, Video, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type NewComment = {
  tiktokPostId: string
  tiktokCommentId: string
  commenterUsername: string
  commentText: string
}

type RespondingState = Record<string, 'loading' | 'done' | 'error'>

export function CommentScanner() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [newComments, setNewComments] = useState<NewComment[] | null>(null)
  const [responding, setResponding] = useState<RespondingState>({})
  const [scanError, setScanError] = useState<string | null>(null)

  // Manual form state
  const [manualPostId, setManualPostId] = useState('')
  const [manualUsername, setManualUsername] = useState('')
  const [manualText, setManualText] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [manualResult, setManualResult] = useState<string | null>(null)

  async function handleScan() {
    setScanning(true)
    setScanError(null)
    setNewComments(null)
    try {
      const res = await fetch('/api/comments/poll', { method: 'POST' })
      const data = await res.json() as { newComments?: NewComment[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Lỗi scan')
      setNewComments(data.newComments ?? [])
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setScanning(false)
    }
  }

  async function handleRespond(comment: NewComment) {
    setResponding((prev) => ({ ...prev, [comment.tiktokCommentId]: 'loading' }))
    try {
      const res = await fetch('/api/comments/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      })
      const data = await res.json() as { error?: string; skipped?: boolean }
      if (!res.ok) throw new Error(data.error ?? 'Lỗi tạo video')
      setResponding((prev) => ({ ...prev, [comment.tiktokCommentId]: 'done' }))
      router.refresh()
    } catch {
      setResponding((prev) => ({ ...prev, [comment.tiktokCommentId]: 'error' }))
    }
  }

  async function handleManualSubmit() {
    if (!manualPostId || !manualUsername || !manualText) return
    setManualLoading(true)
    setManualResult(null)
    try {
      const res = await fetch('/api/comments/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiktokPostId: manualPostId,
          tiktokCommentId: `manual-${Date.now()}`,
          commenterUsername: manualUsername,
          commentText: manualText,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Lỗi tạo video')
      setManualResult('success')
      setManualPostId('')
      setManualUsername('')
      setManualText('')
      router.push('/videos')
    } catch (err) {
      setManualResult(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto scan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Quét comment từ TikTok
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tự động lấy comment mới từ các video đã publish, bỏ qua comment đã xử lý.
          </p>
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? 'Đang quét...' : 'Quét comment mới'}
          </Button>

          {scanError && <p className="text-sm text-destructive">{scanError}</p>}

          {newComments !== null && (
            newComments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có comment mới nào.</p>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium">Tìm thấy {newComments.length} comment mới:</p>
                {newComments.map((comment) => {
                  const state = responding[comment.tiktokCommentId]
                  return (
                    <div
                      key={comment.tiktokCommentId}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium">@{comment.commenterUsername}</p>
                        <p className="text-sm text-muted-foreground">{comment.commentText}</p>
                        <p className="text-xs text-muted-foreground">Post: {comment.tiktokPostId}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={state === 'done' ? 'outline' : 'default'}
                        disabled={state === 'loading' || state === 'done'}
                        onClick={() => handleRespond(comment)}
                      >
                        {state === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {state === 'done' && '✓ Đã tạo'}
                        {state === 'error' && 'Thử lại'}
                        {!state && <><Video className="h-3 w-3" /> Tạo video</>}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Manual trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4" />
            Thêm comment thủ công
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copy comment từ TikTok và điền vào đây để AI tạo video phản hồi.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="postId">TikTok Post ID (từ URL video)</Label>
              <Input
                id="postId"
                placeholder="7123456789012345678"
                value={manualPostId}
                onChange={(e) => setManualPostId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Tên người comment</Label>
              <Input
                id="username"
                placeholder="nguyen_van_a"
                value={manualUsername}
                onChange={(e) => setManualUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comment">Nội dung comment</Label>
              <Textarea
                id="comment"
                placeholder="nhà mình có chó nên không biết dùng cái nào..."
                rows={3}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
            </div>
            <Button
              onClick={handleManualSubmit}
              disabled={manualLoading || !manualPostId || !manualUsername || !manualText}
            >
              {manualLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              {manualLoading ? 'Đang tạo video...' : 'Tạo video phản hồi'}
            </Button>
            {manualResult === 'success' && (
              <p className="text-sm text-green-600">Video đã được tạo và đang xử lý.</p>
            )}
            {manualResult && manualResult !== 'success' && (
              <p className="text-sm text-destructive">{manualResult}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
