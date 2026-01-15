/**
 * Output Validator - Sanitizes AI output before displaying to users
 * Removes potentially harmful content and enforces safety limits
 */

// Trusted domains for links (all others will be removed)
const TRUSTED_DOMAINS = [
  'github.com',
  'stackoverflow.com',
  'npmjs.com',
  'developer.mozilla.org',
  'reactjs.org',
  'nextjs.org',
  'supabase.com',
  'vercel.com',
]

// Patterns to strip from output
const STRIP_PATTERNS = [
  // Script tags
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<script[^>]*\/>/gi,
  
  // Event handlers
  /\son\w+\s*=\s*["'][^"']*["']/gi,
  
  // JavaScript URLs
  /javascript:\s*[^"'\s]*/gi,
  
  // Data URLs (except images)
  /data:(?!image\/)[^"'\s]*/gi,
  
  // Iframe tags
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /<iframe[^>]*\/>/gi,
  
  // Object/embed tags
  /<object[^>]*>[\s\S]*?<\/object>/gi,
  /<embed[^>]*\/?>/gi,
  
  // Style with expressions
  /expression\s*\([^)]*\)/gi,
  
  // HTML comments (can hide malicious content)
  /<!--[\s\S]*?-->/g,
]

// Maximum output length (characters)
const MAX_OUTPUT_LENGTH = 50000

export interface ValidationResult {
  safe: boolean
  sanitized: string
  removedItems: string[]
}

/**
 * Validate and sanitize AI output before displaying
 */
export function validateOutput(output: string): ValidationResult {
  const removedItems: string[] = []
  let sanitized = output
  
  // Strip dangerous patterns
  for (const pattern of STRIP_PATTERNS) {
    const matches = sanitized.match(pattern)
    if (matches) {
      removedItems.push(...matches.map(m => `Removed: ${m.substring(0, 50)}...`))
      sanitized = sanitized.replace(pattern, '')
    }
  }
  
  // Remove or sanitize external links (keep only trusted domains)
  sanitized = sanitized.replace(
    /https?:\/\/[^\s<>"']+/gi,
    (url) => {
      try {
        const hostname = new URL(url).hostname.replace('www.', '')
        if (TRUSTED_DOMAINS.some(d => hostname.endsWith(d))) {
          return url // Keep trusted domain links
        }
        removedItems.push(`Untrusted link removed: ${hostname}`)
        return '[link removed]'
      } catch {
        return url // Keep if URL parsing fails (likely not a real URL)
      }
    }
  )
  
  // Enforce length limit
  if (sanitized.length > MAX_OUTPUT_LENGTH) {
    removedItems.push(`Output truncated from ${sanitized.length} to ${MAX_OUTPUT_LENGTH} chars`)
    sanitized = sanitized.substring(0, MAX_OUTPUT_LENGTH) + '\n\n[Output truncated due to length]'
  }
  
  // Log if items were removed
  if (removedItems.length > 0) {
    console.warn('[Output Validator] Items removed:', removedItems.length)
  }
  
  return {
    safe: removedItems.length === 0,
    sanitized,
    removedItems,
  }
}

/**
 * Validate and parse JSON output from AI
 * Ensures the output matches expected structure
 */
export function validateJSONOutput<T>(
  output: T,
  requiredFields: (keyof T)[]
): { valid: boolean; data: T | null; errors: string[] } {
  const errors: string[] = []
  
  if (!output || typeof output !== 'object') {
    return { valid: false, data: null, errors: ['Output is not an object'] }
  }
  
  for (const field of requiredFields) {
    if (!(field in output)) {
      errors.push(`Missing required field: ${String(field)}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? output : null,
    errors,
  }
}
