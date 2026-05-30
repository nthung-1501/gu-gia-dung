export type ScriptInput = {
  productId: string
  series: 'test-that' | 'house-30s' | 'which-one-better'
  productName: string
  keyFeatures: string[]
  painPoints: string[]
  suggestedHook?: string
  targetDuration?: number
}

export type GeneratedScript = {
  hook: string
  body: string
  cta: string
  estimatedDuration: number
  series: 'test-that' | 'house-30s' | 'which-one-better'
  shotNotes: string
}

export type VideoPipelineInput = {
  videoId: string
  scriptId: string
  scriptText: string
  series: string
  productName: string
  hook: string
}
