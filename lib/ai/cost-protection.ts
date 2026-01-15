/**
 * Cost Protection - Prevents runaway AI costs
 * Implements daily limits, emergency kill switch, and graceful degradation
 */

import { createClient } from '@/lib/supabase/server'

// Configuration
const DAILY_TOKEN_LIMIT = 1_000_000 // 1M tokens/day - adjust based on budget
const EMERGENCY_KILL_SWITCH_KEY = 'AI_DISABLED'

export interface CostStatus {
  allowed: boolean
  tokensUsed: number
  tokenLimit: number
  percentUsed: number
  reason?: string
}

/**
 * Check if AI is disabled via emergency kill switch
 */
export function isAIKillSwitchActive(): boolean {
  return process.env[EMERGENCY_KILL_SWITCH_KEY] === 'true'
}

/**
 * Get today's token usage across all users
 */
export async function getDailyTokenUsage(): Promise<number> {
  const supabase = await createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data } = await supabase
    .from('ai_requests')
    .select('tokens_output')
    .gte('created_at', today.toISOString())
    .eq('status', 'done')
  
  if (!data) return 0
  
  return data.reduce((sum, row) => sum + (row.tokens_output || 0), 0)
}

/**
 * Check if we're within cost limits
 */
export async function checkCostCeiling(): Promise<CostStatus> {
  // Check kill switch first
  if (isAIKillSwitchActive()) {
    return {
      allowed: false,
      tokensUsed: 0,
      tokenLimit: DAILY_TOKEN_LIMIT,
      percentUsed: 100,
      reason: 'AI services are temporarily disabled for maintenance.',
    }
  }
  
  const tokensUsed = await getDailyTokenUsage()
  const percentUsed = Math.round((tokensUsed / DAILY_TOKEN_LIMIT) * 100)
  
  // Warning at 80%
  if (percentUsed >= 80 && percentUsed < 100) {
    console.warn(`[Cost Protection] WARNING: ${percentUsed}% of daily token limit used`)
  }
  
  // Block at 100%
  if (tokensUsed >= DAILY_TOKEN_LIMIT) {
    console.error('[Cost Protection] CRITICAL: Daily token limit exceeded')
    return {
      allowed: false,
      tokensUsed,
      tokenLimit: DAILY_TOKEN_LIMIT,
      percentUsed,
      reason: 'Daily AI usage limit reached. Service will resume tomorrow.',
    }
  }
  
  return {
    allowed: true,
    tokensUsed,
    tokenLimit: DAILY_TOKEN_LIMIT,
    percentUsed,
  }
}

/**
 * Get cost analytics for admin dashboard
 */
export async function getCostAnalytics(days: number = 7): Promise<{
  daily: { date: string; tokens: number; requests: number }[]
  topFeatures: { feature: string; tokens: number; requests: number }[]
  topUsers: { userId: string; tokens: number; requests: number }[]
}> {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  // Daily usage
  const { data: requests } = await supabase
    .from('ai_requests')
    .select('created_at, tokens_output, feature, user_id')
    .gte('created_at', startDate.toISOString())
    .eq('status', 'done')
  
  if (!requests) {
    return { daily: [], topFeatures: [], topUsers: [] }
  }
  
  // Aggregate by day
  const dailyMap = new Map<string, { tokens: number; requests: number }>()
  const featureMap = new Map<string, { tokens: number; requests: number }>()
  const userMap = new Map<string, { tokens: number; requests: number }>()
  
  for (const req of requests) {
    // Daily
    const date = new Date(req.created_at).toISOString().split('T')[0]
    const daily = dailyMap.get(date) || { tokens: 0, requests: 0 }
    daily.tokens += req.tokens_output || 0
    daily.requests += 1
    dailyMap.set(date, daily)
    
    // Features
    const feature = featureMap.get(req.feature) || { tokens: 0, requests: 0 }
    feature.tokens += req.tokens_output || 0
    feature.requests += 1
    featureMap.set(req.feature, feature)
    
    // Users
    const user = userMap.get(req.user_id) || { tokens: 0, requests: 0 }
    user.tokens += req.tokens_output || 0
    user.requests += 1
    userMap.set(req.user_id, user)
  }
  
  return {
    daily: Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topFeatures: Array.from(featureMap.entries())
      .map(([feature, data]) => ({ feature, ...data }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10),
    topUsers: Array.from(userMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 10),
  }
}
