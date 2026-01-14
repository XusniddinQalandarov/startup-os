const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

// Model types for different use cases
// - fast: Quick generation tasks (questions, MVP, roadmap, tasks, tech, costs, competitor parsing)
// - thinking: Deep analysis tasks (evaluation, project analysis)
export type ModelType = 'fast' | 'thinking'

function getModel(type: ModelType): string {
  switch (type) {
    case 'fast':
      return process.env.OPENROUTER_MODEL_FAST || process.env.OPENROUTER_MODEL || ''
    case 'thinking':
      return process.env.OPENROUTER_MODEL_THINKING || process.env.OPENROUTER_MODEL || ''
    default:
      return process.env.OPENROUTER_MODEL || ''
  }
}

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  modelType: ModelType = 'fast'
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = getModel(modelType)

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  if (!model) {
    throw new Error(`No model configured. Set OPENROUTER_MODEL or OPENROUTER_MODEL_${modelType.toUpperCase()} in .env.local`)
  }

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://startup-os.app',
      'X-Title': 'Startup OS',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: modelType === 'fast' ? 1800 : 4000, // Reduced from 2000 for speed
      response_format: { type: 'json_object' }, // Force JSON mode
    }),
  })

  if (response.status === 429) {
     console.warn('[OpenRouter] Rate limited (429). Retrying in 2s...')
     await new Promise(resolve => setTimeout(resolve, 2000))
     
     // Simple retry once
     const retryResponse = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://startup-os.app',
          'X-Title': 'Startup OS',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: modelType === 'fast' ? 2000 : 4000,
          response_format: { type: 'json_object' },
        }),
     })
     
     if (!retryResponse.ok) {
        const error = await retryResponse.text()
        console.error('OpenRouter retry error:', error)
        throw new Error(`OpenRouter API error (after retry): ${retryResponse.status}`)
     }
     
     const data: OpenRouterResponse = await retryResponse.json()
     return data.choices[0]?.message?.content || ''
  }

  if (!response.ok) {
    const error = await response.text()
    console.error('OpenRouter error:', error)
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

export async function callOpenRouterJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  modelType: ModelType = 'fast'
): Promise<T> {
  const jsonSystemPrompt = `${systemPrompt}

CRITICAL INSTRUCTIONS:
- You MUST respond with ONLY valid JSON
- NO markdown formatting
- NO code blocks (no \`\`\`json or \`\`\`)
- NO explanatory text before or after the JSON
- Start directly with { and end with }
- The response must be parseable by JSON.parse()`

  const content = await callOpenRouter(jsonSystemPrompt, userPrompt, modelType)
  
  console.log('[OpenRouter] Raw response length:', content.length)
  
  // More aggressive cleanup - extract JSON from anywhere in the response
  let cleanContent = content.trim()
  
  // Remove markdown code blocks
  cleanContent = cleanContent.replace(/```json\n?/g, '')
  cleanContent = cleanContent.replace(/```\n?/g, '')
  
  // Determine if we should look for object or array
  const firstBrace = cleanContent.indexOf('{')
  const firstBracket = cleanContent.indexOf('[')

  let startIndex = -1
  let endIndex = -1

  // If array comes first (or no object)
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIndex = firstBracket
    endIndex = cleanContent.lastIndexOf(']')
  } else if (firstBrace !== -1) {
    // defaults to object
    startIndex = firstBrace
    endIndex = cleanContent.lastIndexOf('}')
  }
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleanContent = cleanContent.substring(startIndex, endIndex + 1)
  }
  
  cleanContent = cleanContent.trim()
  
  console.log('[OpenRouter] Cleaned response preview:', cleanContent.substring(0, 200))

  try {
    const parsed = JSON.parse(cleanContent)
    console.log('[OpenRouter] Successfully parsed JSON')
    return parsed
  } catch (e) {
    console.error('[OpenRouter] Failed to parse AI response')
    console.error('[OpenRouter] Raw content:', content.substring(0, 500))
    console.error('[OpenRouter] Cleaned content:', cleanContent.substring(0, 500))
    console.error('[OpenRouter] Parse error:', e)
    throw new Error('AI response was not valid JSON')
  }
}
