const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Max time to wait for AI response (in ms)
const AI_TIMEOUT_MS = 30000 // 30 seconds

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

// Fetch with timeout using AbortController
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`AI request timed out after ${timeoutMs / 1000}s`)
    }
    throw error
  }
}

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  modelType: ModelType = 'fast',
  maxTokens?: number
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

  // Token limits - balanced for speed and completeness
  const defaultMaxTokens = maxTokens || (modelType === 'fast' ? 2500 : 4000)

  const requestBody = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: defaultMaxTokens,
    response_format: { type: 'json_object' },
  }

  try {
    const response = await fetchWithTimeout(
      OPENROUTER_API_URL,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://startup-os.app',
          'X-Title': 'Startup OS',
        },
        body: JSON.stringify(requestBody),
      },
      AI_TIMEOUT_MS
    )

    if (response.status === 429) {
      console.warn('[OpenRouter] Rate limited (429). Waiting 1s and retrying...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const retryResponse = await fetchWithTimeout(
        OPENROUTER_API_URL,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://startup-os.app',
            'X-Title': 'Startup OS',
          },
          body: JSON.stringify(requestBody),
        },
        AI_TIMEOUT_MS
      )
      
      if (!retryResponse.ok) {
        const error = await retryResponse.text()
        console.error('OpenRouter retry error:', error)
        throw new Error(`OpenRouter API error: ${retryResponse.status}`)
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
  } catch (error: any) {
    if (error.message?.includes('timed out')) {
      console.error('[OpenRouter] Request timed out after 30s')
    }
    throw error
  }
}

// Clean and extract valid JSON from AI response
function cleanJsonResponse(content: string): string {
  let json = content.trim()
  
  // Remove markdown code blocks
  json = json.replace(/```json\s*/gi, '')
  json = json.replace(/```\s*/g, '')
  
  // Find the actual JSON start - handle cases like "{\n{" or text before JSON
  const firstBrace = json.indexOf('{')
  const firstBracket = json.indexOf('[')
  
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON found in response')
  }
  
  // Determine start character
  const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)
  const startIndex = isArray ? firstBracket : firstBrace
  const endChar = isArray ? ']' : '}'
  
  // Extract from first brace/bracket
  json = json.substring(startIndex)
  
  // Find matching end - handle nested structures
  let depth = 0
  let inString = false
  let escaped = false
  let endIndex = -1
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i]
    
    if (escaped) {
      escaped = false
      continue
    }
    
    if (char === '\\') {
      escaped = true
      continue
    }
    
    if (char === '"' && !escaped) {
      inString = !inString
      continue
    }
    
    if (inString) continue
    
    if (char === '{' || char === '[') {
      depth++
    } else if (char === '}' || char === ']') {
      depth--
      if (depth === 0) {
        endIndex = i + 1
        break
      }
    }
  }
  
  if (endIndex > 0) {
    json = json.substring(0, endIndex)
  } else {
    // JSON is incomplete - try to close it
    console.warn('[OpenRouter] JSON appears truncated, attempting to close...')
    
    // Remove trailing incomplete elements
    json = json.replace(/,\s*$/, '') // trailing comma
    json = json.replace(/,\s*"[^"]*$/, '') // incomplete key
    json = json.replace(/:\s*"[^"]*$/, ': ""') // incomplete value
    json = json.replace(/:\s*$/, ': null') // missing value
    
    // Close remaining open structures
    const openBraces = (json.match(/{/g) || []).length
    const closeBraces = (json.match(/}/g) || []).length
    const openBrackets = (json.match(/\[/g) || []).length
    const closeBrackets = (json.match(/]/g) || []).length
    
    for (let i = 0; i < openBrackets - closeBrackets; i++) json += ']'
    for (let i = 0; i < openBraces - closeBraces; i++) json += '}'
  }
  
  return json
}

export async function callOpenRouterJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  modelType: ModelType = 'fast',
  maxTokens?: number
): Promise<T> {
  const jsonSystemPrompt = `${systemPrompt}

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Start with { or [ and end with } or ].`

  const content = await callOpenRouter(jsonSystemPrompt, userPrompt, modelType, maxTokens)
  
  console.log('[OpenRouter] Raw response length:', content.length)
  
  try {
    const cleanContent = cleanJsonResponse(content)
    console.log('[OpenRouter] Cleaned JSON preview:', cleanContent.substring(0, 150))
    
    const parsed = JSON.parse(cleanContent)
    console.log('[OpenRouter] Successfully parsed JSON')
    return parsed
  } catch (e: any) {
    console.error('[OpenRouter] JSON parse failed:', e.message)
    console.error('[OpenRouter] Raw content start:', content.substring(0, 300))
    console.error('[OpenRouter] Raw content end:', content.substring(Math.max(0, content.length - 300)))
    throw new Error('AI response was not valid JSON')
  }
}
