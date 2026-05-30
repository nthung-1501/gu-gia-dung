import { creatomateClient } from '@/lib/creatomate/client'
import type { VideoPipelineInput } from './types'

export function buildScriptText(hook: string, body: string, cta: string, shotNotes?: string): string {
  const base = `${hook}\n\n${body}\n\n${cta}`
  if (!shotNotes) return base
  return `${base}\n\n--- VISUAL DIRECTION ---\n${shotNotes}`
}

const CREATOMATE_TEMPLATES: Record<string, string> = {
  'test-that': process.env.CREATOMATE_TEMPLATE_TEST_THAT ?? '',
  'house-30s': process.env.CREATOMATE_TEMPLATE_HOUSE_30S ?? '',
  'which-one-better': process.env.CREATOMATE_TEMPLATE_WHICH_ONE ?? '',
}

type PipelineResult = {
  creatomateJobId: string
  status: 'submitted' | 'failed'
  error?: string
}

export async function startVideoPipeline(input: VideoPipelineInput): Promise<PipelineResult> {
  try {
    const { jobId } = await renderWithCreatomate({
      productImageUrl: input.productImageUrl,
      series: input.series,
      productName: input.productName,
      hook: input.hook,
    })

    return { creatomateJobId: jobId, status: 'submitted' }
  } catch (err) {
    return {
      creatomateJobId: '',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function renderWithCreatomate(params: {
  productImageUrl: string
  series: string
  productName: string
  hook: string
}): Promise<{ jobId: string }> {
  const templateId = CREATOMATE_TEMPLATES[params.series]
  if (!templateId) throw new Error(`No Creatomate template for series: ${params.series}`)

  const jobs = await creatomateClient.render({
    templateId,
    modifications: {
      'Video-FP8': params.productImageUrl,
      'hook-text': params.hook,
      'product-name': params.productName,
    },
  })

  if (!jobs[0]) throw new Error('Creatomate returned no render jobs')
  return { jobId: jobs[0].id }
}
