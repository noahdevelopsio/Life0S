import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeResponse {
  content: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export async function chatWithClaude(
  messages: ClaudeMessage[],
  systemPrompt?: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<ClaudeResponse> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature || 0.7,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    })

    return {
      content: response.content[0].type === 'text' ?
        response.content[0].text : 'I apologize, but I couldn\'t generate a response.',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to get AI response')
  }
}

export async function* streamClaudeResponse(
  messages: ClaudeMessage[],
  systemPrompt?: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): AsyncGenerator<string> {
  try {
    const stream = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature || 0.7,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream: true
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta') {
        yield chunk.delta.text
      }
    }
  } catch (error) {
    console.error('Claude streaming error:', error)
    throw new Error('Failed to stream AI response')
  }
}
