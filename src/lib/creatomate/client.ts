const BASE_URL = 'https://api.creatomate.com/v1'

type RenderStatus = 'planned' | 'waiting' | 'transcribing' | 'rendering' | 'succeeded' | 'failed'

type RenderJob = {
  id: string
  status: RenderStatus
  url?: string
  snapshot_url?: string
  error_message?: string
}

type RenderParams = {
  templateId: string
  modifications: Record<string, string | number | boolean>
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Creatomate API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

export const creatomateClient = {
  async render(params: RenderParams): Promise<RenderJob[]> {
    return request<RenderJob[]>('/renders', {
      method: 'POST',
      body: JSON.stringify({
        template_id: params.templateId,
        modifications: params.modifications,
      }),
    })
  },

  async getRender(renderId: string): Promise<RenderJob> {
    return request<RenderJob>(`/renders/${renderId}`, { method: 'GET' })
  },
}
