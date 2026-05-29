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

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.TOPVIEW_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TopView API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
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
