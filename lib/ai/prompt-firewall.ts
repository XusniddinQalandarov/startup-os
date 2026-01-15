/**
 * Prompt Firewall - Sanitizes user input before passing to AI
 * Blocks prompt injection, jailbreak attempts, and other security threats
 */

// Known malicious patterns to block
const BLOCKED_PATTERNS = [
  // Prompt injection attempts
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /override\s+(system|previous)/i,
  
  // System prompt extraction
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(your\s+)?instructions/i,
  /what\s+are\s+your\s+(initial\s+)?instructions/i,
  /print\s+(your\s+)?(system\s+)?prompt/i,
  
  // Role override attempts
  /you\s+are\s+now\s+(a\s+)?/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(if\s+you\s+are|a)/i,
  /roleplay\s+as/i,
  
  // DAN-style jailbreaks
  /do\s+anything\s+now/i,
  /\bDAN\b/,
  /jailbreak/i,
  /bypass\s+(safety|filter|restriction)/i,
  
  // Code injection attempts
  /<script[\s>]/i,
  /javascript:/i,
  /on(load|error|click)\s*=/i,
  
  // SQL injection patterns
  /'\s*or\s+'1'\s*=\s*'1/i,
  /;\s*drop\s+table/i,
  /union\s+select/i,
]

// Patterns that are suspicious but may have legitimate uses
const WARNING_PATTERNS = [
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /token/i,
  /credential/i,
]

export interface FirewallResult {
  safe: boolean
  sanitized: string
  threats: string[]
  warnings: string[]
}

/**
 * Sanitize and validate user input before passing to AI
 */
export function sanitizePrompt(input: string): FirewallResult {
  const threats: string[] = []
  const warnings: string[] = []
  let sanitized = input
  
  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      threats.push(`Blocked pattern detected: ${pattern.source}`)
      // Remove the offending text
      sanitized = sanitized.replace(pattern, '[BLOCKED]')
    }
  }
  
  // Check for warning patterns
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(input)) {
      warnings.push(`Suspicious pattern: ${pattern.source}`)
    }
  }
  
  // Additional sanitization
  sanitized = sanitized
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit consecutive whitespace
    .replace(/\s{10,}/g, ' ')
    // Limit total length (10KB max)
    .substring(0, 10000)
  
  // Log threats for monitoring
  if (threats.length > 0) {
    console.warn('[Prompt Firewall] Threats detected:', threats)
  }
  
  return {
    safe: threats.length === 0,
    sanitized,
    threats,
    warnings,
  }
}

/**
 * Quick check if input is safe (for performance-critical paths)
 */
export function isPromptSafe(input: string): boolean {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return false
    }
  }
  return true
}
