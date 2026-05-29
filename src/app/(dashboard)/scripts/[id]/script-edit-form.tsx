'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  scriptId: string
  initialHook: string
  initialBody: string
  initialCta: string
}

export function ScriptEditForm({ scriptId, initialHook, initialBody, initialCta }: Props) {
  const router = useRouter()
  const [hook, setHook] = useState(initialHook)
  const [body, setBody] = useState(initialBody)
  const [cta, setCta] = useState(initialCta)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const isDirty = hook !== initialHook || body !== initialBody || cta !== initialCta

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/scripts/${scriptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hook, body, cta }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Lỗi lưu kịch bản')
      }
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-hook">Hook (3 giây đầu)</Label>
        <Textarea
          id="edit-hook"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          rows={2}
          placeholder="Câu mở đầu tạo tò mò..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-body">Nội dung chính</Label>
        <Textarea
          id="edit-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          placeholder="Demo, test, so sánh..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-cta">Call to Action</Label>
        <Textarea
          id="edit-cta"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          rows={2}
          placeholder="Kêu gọi hành động..."
        />
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving || !isDirty}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Lưu thay đổi
        </Button>
        {saved && <span className="text-sm text-green-600">Đã lưu</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  )
}
