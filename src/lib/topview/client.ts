const BASE_URL = 'https://api.topview.ai/v1'

type TopViewJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

type CreateVideoParams = {
  scriptText: string
  voiceId?: string
  aspectRatio?: '9:16' | '16:9' | '1:1'
}

type TopViewJob = {
  jobId: string
  status: TopViewJobStatus
  videoUrl?: string
  errorMessage?: string
}

function clean(value: string): string {
  // Strip BOM (U+FEFF) and surrounding whitespace
  return value.replace(/^﻿/, '').trim()
}

function getAuthHeaders() {
  const apiKey = process.env.TOPVIEW_API_KEY
  const uid = process.env.TOPVIEW_UID
  if (!apiKey) throw new Error('TOPVIEW_API_KEY is not configured')
  if (!uid) throw new Error('TOPVIEW_UID is not configured')
  return {
    'Authorization': `Bearer ${clean(apiKey)}`,
    'Topview-Uid': clean(uid),
  }
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TopView API error ${res.status}: ${body}`)
  }

  const json = await res.json()
  console.log('[TopView] raw response:', JSON.stringify(json))
  return json as T
}

export const topviewClient = {
  async createVideo(params: CreateVideoParams): Promise<TopViewJob> {
    return request<TopViewJob>('/videos', {
      method: 'POST',
      body: JSON.stringify({
        script: params.scriptText,
        voice_id: params.voiceId ?? 'vi-female-1',
        aspect_ratio: params.aspectRatio ?? '9:16',
      }),
    })
  },

  async getJob(jobId: string): Promise<TopViewJob> {
    return request<TopViewJob>(`/videos/${jobId}`, { method: 'GET' })
  },
}
