export type CaptionInput = {
  productName: string
  series: string
  hook: string
  verdict: string
  priceRange?: string
}

export type GeneratedCaption = {
  caption: string
  hashtags: string[]
}

export type PeakHour = {
  hour: number
  dayOfWeek: number
  score: number
}
