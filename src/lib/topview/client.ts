const BASE_URL = 'https://api.topview.ai/v1'

type TopViewJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

type CreateVideoParams = {
  scriptText: string
  voiceId?: string
  aspectRatio?: '9:16' | '16:9' | '1:1'
}

export type TopViewJob = {
  jobId: string
  status: TopViewJobStatus
  videoUrl?: string
  errorMessage?: string
}

// TopView wraps all responses in { code, message, result }
type TopViewResponse<T> = {
  code: string
  message: string
  result: T | null
}

function clean(value: string): string {
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

  const json = await res.json() as TopViewResponse<T>
  console.log('[TopView] raw response:', JSON.stringify(json))

  if (!res.ok) {
    throw new Error(`TopView API error ${res.status}: ${json.message ?? res.statusText}`)
  }

  if (json.code !== '0' && json.code !== '200') {
    throw new Error(`TopView API error code ${json.code}: ${json.message}`)
  }

  if (!json.result) {
    throw new Error(`TopView API returned null result: ${json.message}`)
  }

  return json.result
}

// TopView actual response shape for video creation
type TopViewCreateResult = {
  video_id?: string
  videoId?: string
  job_id?: string
  jobId?: string
  id?: string
  status?: string
}

function normalizeJob(raw: TopViewCreateResult, fallbackId?: string): TopViewJob {
  const id = raw.video_id ?? raw.videoId ?? raw.job_id ?? raw.jobId ?? raw.id ?? fallbackId ?? ''
  return {
    jobId: id,
    status: (raw.status as TopViewJobStatus) ?? 'pending',
  }
}

export const topviewClient = {
  async createVideo(params: CreateVideoParams): Promise<TopViewJob> {
    // Send only script — omit voice_id/aspect_ratio to diagnose 5000 errors
    // Strip VISUAL DIRECTION section (for TopView only — keep script concise)
    const scriptForTopView = params.scriptText.split('\n\n--- VISUAL DIRECTION ---')[0].trim()
    console.log('[TopView] script length:', scriptForTopView.length, 'chars')
    const raw = await request<TopViewCreateResult>('/videos', {
      method: 'POST',
      body: JSON.stringify({
        script: scriptForTopView,
      }),
    })
    return normalizeJob(raw)
  },

  async getJob(jobId: string): Promise<TopViewJob> {
    const raw = await request<TopViewCreateResult>(`/videos/${jobId}`, { method: 'GET' })
    return normalizeJob(raw, jobId)
  },
}
