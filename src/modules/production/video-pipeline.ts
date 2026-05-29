import { topviewClient } from '@/lib/topview/client'
import { creatomateClient } from '@/lib/creatomate/client'
import { productionQueue } from '@/lib/queue'
import type { VideoPipelineInput } from './types'

const CREATOMATE_TEMPLATES: Record<string, string> = {
  'test-that': process.env.CREATOMATE_TEMPLATE_TEST_THAT ?? '',
  'house-30s': process.env.CREATOMATE_TEMPLATE_HOUSE_30S ?? '',
  'which-one-better': process.env.CREATOMATE_TEMPLATE_WHICH_ONE ?? '',
}

type PipelineResult = {
  topviewJobId: string
  creatomateJobId?: string
  status: 'submitted' | 'failed'
  error?: string
}

export async function startVideoPipeline(input: VideoPipelineInput): Promise<PipelineResult> {
  try {
    const topviewJob = await topviewClient.createVideo({
      scriptText: input.scriptText,
      aspectRatio: '9:16',
    })

    await productionQueue.add(
      'poll-topview',
      { videoId: input.videoId, scriptId: input.scriptId },
      { delay: 30_000, attempts: 20, backoff: { type: 'fixed', delay: 30_000 } }
    )

    return {
      topviewJobId: topviewJob.jobId,
      status: 'submitted',
    }
  } catch (err) {
    return {
      topviewJobId: '',
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function renderWithCreatomate(params: {
  rawVideoUrl: string
  series: string
  productName: string
  hook: string
}): Promise<{ jobId: string }> {
  const templateId = CREATOMATE_TEMPLATES[params.series]
  if (!templateId) throw new Error(`No Creatomate template for series: ${params.series}`)

  const jobs = await creatomateClient.render({
    templateId,
    modifications: {
      'video-source': params.rawVideoUrl,
      'hook-text': params.hook,
      'product-name': params.productName,
    },
  })

  if (!jobs[0]) throw new Error('Creatomate returned no render jobs')
  return { jobId: jobs[0].id }
}
