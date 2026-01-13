// Utility functions

/**
 * Combines class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Formats hours estimate for display
 */
export function formatEstimate(hours: number): string {
  if (hours < 1) return '<1h'
  if (hours < 8) return `${hours}h`
  const days = Math.round(hours / 8)
  return days === 1 ? '1 day' : `${days} days`
}

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Formats skill tag for display
 */
export function formatSkillTag(tag: string): string {
  return tag.replace('_', ' ').split(' ').map(capitalize).join(' ')
}

/**
 * Delay helper for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Formats number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
