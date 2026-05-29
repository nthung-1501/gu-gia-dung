import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateText(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: options?.model ?? 'claude-sonnet-4-6',
    max_tokens: options?.maxTokens ?? 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected Claude response type')
  return content.text
}

export async function generateJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number }
): Promise<T> {
  const text = await generateText(
    systemPrompt + '\n\nRespond with valid JSON only. No markdown, no explanation.',
    userMessage,
    options
  )
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(cleaned) as T
}

// imageBase64s: array of base64 DataURL strings (e.g. "data:image/jpeg;base64,...")
export async function generateJSONWithImages<T>(
  systemPrompt: string,
  userMessage: string,
  imageBase64s: string[],
  options?: { maxTokens?: number }
): Promise<T> {
  const imageBlocks: Anthropic.ImageBlockParam[] = imageBase64s
    .slice(0, 5)
    .map((dataUrl) => {
      const [header, data] = dataUrl.split(',')
      const mediaTypeMatch = header.match(/data:([^;]+);base64/)
      const mediaType = (mediaTypeMatch?.[1] ?? 'image/jpeg') as Anthropic.Base64ImageSource['media_type']
      return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mediaType, data },
      }
    })

  const textBlock: Anthropic.TextBlockParam = { type: 'text', text: userMessage }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: options?.maxTokens ?? 2048,
    system: systemPrompt + '\n\nRespond with valid JSON only. No markdown, no explanation.',
    messages: [{ role: 'user', content: [...imageBlocks, textBlock] }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected Claude response type')
  const cleaned = content.text.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(cleaned) as T
}

export { anthropic }
