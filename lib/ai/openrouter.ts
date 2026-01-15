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
  maxTokens?: number,
  retries: number = 3
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  let lastError: any

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = getModel(modelType)
      
      if (!model) {
        throw new Error(`No model configured for ${modelType}`)
      }

      if (attempt > 0) {
        const delay = 1000 * Math.pow(2, attempt)
        console.log(`[OpenRouter] Retry ${attempt}/${retries} for ${model} in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Token limits - balanced for speed and completeness
      const defaultMaxTokens = maxTokens || (modelType === 'fast' ? 2500 : 4000)

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
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: defaultMaxTokens,
            // Only use json_object for recent models, but safe to omit if prompts are strong
            // response_format: { type: 'json_object' }, 
          }),
        },
        AI_TIMEOUT_MS
      )

      if (!response.ok) {
        const errorText = await response.text()
        
        // Retry on rate limits or server errors
        if (response.status === 429 || response.status >= 500) {
           console.warn(`[OpenRouter] Transient error ${response.status}: ${errorText}`)
           throw new Error(`OpenRouter transient error: ${response.status}`)
        }
        
        // Fatal error
        throw new Error(`OpenRouter fatal error: ${response.status} - ${errorText}`)
      }

      const data: OpenRouterResponse = await response.json()
      const content = data.choices[0]?.message?.content || ''
      
      if (!content.trim()) {
        throw new Error('Received empty response from AI')
      }
      
      return content

    } catch (error: any) {
      lastError = error
      console.warn(`[OpenRouter] Attempt ${attempt} failed:`, error.message)
      
      // Don't retry fatal errors
      if (error.message.includes('fatal error') || error.message.includes('No model configured') || error.message.includes('API_KEY')) {
        throw error
      }
    }
  }

  throw lastError || new Error('Failed to get AI response after retries')
}

// Clean and extract valid JSON from AI response
function cleanJsonResponse(content: string): string {
  let json = content.trim()
  
  // Remove markdown code blocks
  json = json.replace(/```json\s*/gi, '')
  json = json.replace(/```\s*/g, '')
  
  // Remove leading dots, periods, and whitespace before JSON
  json = json.replace(/^[.\s\n]+/, '')
  
  // Handle the DOUBLE BRACE issue: "{\n{" or "{  {" - take the inner one
  const doubleBraceMatch = json.match(/^\{\s*\n?\s*\{/)
  if (doubleBraceMatch) {
    // Skip the first brace and find the real start
    json = json.substring(doubleBraceMatch[0].length - 1)
  }
  
  // Find the actual JSON start
  const firstBrace = json.indexOf('{')
  const firstBracket = json.indexOf('[')
  
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON found in response')
  }
  
  // Determine start character
  const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)
  const startIndex = isArray ? firstBracket : firstBrace
  
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
    console.warn('[OpenRouter] JSON appears truncated, attempting to repair...')
    
    // Remove trailing incomplete elements more aggressively
    json = json.replace(/,\s*$/, '') // trailing comma
    json = json.replace(/,\s*"[^"]*$/, '') // incomplete key after comma
    json = json.replace(/:\s*"[^"]*$/, ': ""') // incomplete string value
    json = json.replace(/:\s*$/, ': null') // missing value entirely
    json = json.replace(/,\s*\{[^}]*$/, '') // incomplete object in array
    json = json.replace(/,\s*\[[^\]]*$/, '') // incomplete nested array
    
    // Close remaining open structures
    const openBraces = (json.match(/\{/g) || []).length
    const closeBraces = (json.match(/\}/g) || []).length
    const openBrackets = (json.match(/\[/g) || []).length
    const closeBrackets = (json.match(/\]/g) || []).length
    
    // Close brackets first (arrays before objects in typical structure)
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

  let lastError: any
  
  // Retry logic specifically for JSON parsing failures
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[OpenRouter] JSON Retry attempt ${attempt}/2`)
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // We pass 1 retry to the underlying call, so we have nested retries for max robustness
      const content = await callOpenRouter(jsonSystemPrompt, userPrompt, modelType, maxTokens, 1)
      
      console.log('[OpenRouter] Raw response length:', content.length)
      
      const cleanContent = cleanJsonResponse(content)
      
      const parsed = JSON.parse(cleanContent)
      console.log('[OpenRouter] Successfully parsed JSON')
      return parsed

    } catch (e: any) {
      console.error(`[OpenRouter] JSON parse/fetch failed (attempt ${attempt}):`, e.message)
      lastError = e
      
      // If it was a fatal API error, don't retry locally (callOpenRouter would have thrown)
      if (e.message.includes('fatal error')) throw e
    }
  }

  throw new Error('AI response was not valid JSON after retries')
}
