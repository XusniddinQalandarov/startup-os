'use server'

import { createClient } from '@/lib/supabase/server'
import { callOpenRouterJSON, callOpenRouter, ModelType } from './openrouter'

// ============================================================================
// TYPES
// ============================================================================

export type AIFeature = 
  | 'idea_check' 
  | 'market' 
  | 'competitors' 
  | 'roadmap' 
  | 'mvp' 
  | 'tech' 
  | 'tasks'
  | 'costs'
  | 'questions'
  | 'differentiation'

export interface AIRequest {
  feature: AIFeature
  userId: string
  prompt: string
  systemPrompt: string
  maxTokens?: number
  skipQuota?: boolean // For internal system calls
}

export interface AIResponse<T = any> {
  success: boolean
  data: T | null
  error?: string
  tokensUsed?: number
  model?: string
  cached?: boolean
  requestId?: string
}

// ============================================================================
// AI POLICIES - Configuration-driven behavior
// ============================================================================

interface AIPolicy {
  maxTokens: number
  model: ModelType
  cacheTTL?: number // seconds, undefined = no cache
  rateLimit: number // seconds between calls for this feature
}

const AI_POLICIES: Record<AIFeature, AIPolicy> = {
  idea_check: { maxTokens: 2500, model: 'thinking', cacheTTL: 3600, rateLimit: 30 },
  market: { maxTokens: 2500, model: 'fast', cacheTTL: 1800, rateLimit: 30 },
  competitors: { maxTokens: 2500, model: 'fast', rateLimit: 60 },
  roadmap: { maxTokens: 2000, model: 'fast', cacheTTL: 3600, rateLimit: 30 },
  mvp: { maxTokens: 2000, model: 'fast', cacheTTL: 3600, rateLimit: 30 },
  tech: { maxTokens: 1500, model: 'fast', cacheTTL: 3600, rateLimit: 30 },
  tasks: { maxTokens: 2000, model: 'fast', cacheTTL: 3600, rateLimit: 30 },
  costs: { maxTokens: 1500, model: 'fast', cacheTTL: 3600, rateLimit: 30 },
  questions: { maxTokens: 1500, model: 'fast', cacheTTL: 3600, rateLimit: 30 },
  differentiation: { maxTokens: 1500, model: 'fast', cacheTTL: 1800, rateLimit: 30 },
}

// ============================================================================
// QUOTA LIMITS
// ============================================================================

interface QuotaLimits {
  dailyRequests: number
  cooldownSeconds: number
}

const QUOTA_LIMITS: Record<'free' | 'premium', QuotaLimits> = {
  free: { dailyRequests: 10, cooldownSeconds: 60 },
  premium: { dailyRequests: 1000, cooldownSeconds: 10 },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getUserTier(userId: string): Promise<'free' | 'premium'> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()
  
  return profile?.subscription_tier === 'premium' ? 'premium' : 'free'
}

async function checkQuota(userId: string, feature: AIFeature): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()
  const tier = await getUserTier(userId)
  const limits = QUOTA_LIMITS[tier]
  const policy = AI_POLICIES[feature]
  
  // Check daily request count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count: dailyCount } = await supabase
    .from('ai_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
  
  if ((dailyCount || 0) >= limits.dailyRequests) {
    return { 
      allowed: false, 
      reason: tier === 'free' 
        ? `Daily limit reached (${limits.dailyRequests} requests). Upgrade to premium for more.`
        : `Daily limit reached. Please try again tomorrow.`
    }
  }
  
  // Check cooldown (time since last request for this feature)
  const cooldownSeconds = Math.max(limits.cooldownSeconds, policy.rateLimit)
  const cooldownTime = new Date(Date.now() - cooldownSeconds * 1000)
  
  const { data: recentRequest } = await supabase
    .from('ai_requests')
    .select('created_at')
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', cooldownTime.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (recentRequest) {
    const waitTime = Math.ceil(
      (new Date(recentRequest.created_at).getTime() + cooldownSeconds * 1000 - Date.now()) / 1000
    )
    return { 
      allowed: false, 
      reason: `Please wait ${waitTime} seconds before making another ${feature} request.`
    }
  }
  
  return { allowed: true }
}

async function logRequest(
  userId: string, 
  feature: AIFeature, 
  model: string, 
  status: 'pending' | 'running' | 'done' | 'failed',
  tokensUsed?: number,
  errorMessage?: string,
  durationMs?: number
): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ai_requests')
    .insert({
      user_id: userId,
      feature,
      model,
      status,
      tokens_output: tokensUsed || 0,
      error_message: errorMessage,
      duration_ms: durationMs,
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('[AI Gateway] Failed to log request:', error)
    return null
  }
  
  return data?.id || null
}

async function updateRequestStatus(
  requestId: string,
  status: 'done' | 'failed',
  tokensUsed?: number,
  errorMessage?: string,
  durationMs?: number
) {
  const supabase = await createClient()
  
  await supabase
    .from('ai_requests')
    .update({
      status,
      tokens_output: tokensUsed,
      error_message: errorMessage,
      duration_ms: durationMs,
    })
    .eq('id', requestId)
}

// ============================================================================
// MAIN AI GATEWAY FUNCTION
// ============================================================================

export async function callAI<T = any>(request: AIRequest): Promise<AIResponse<T>> {
  const startTime = Date.now()
  const policy = AI_POLICIES[request.feature]
  
  console.log(`[AI Gateway] Request: ${request.feature} for user: ${request.userId.substring(0, 8)}...`)
  
  // 1. Check quota (unless skipped)
  if (!request.skipQuota) {
    const quotaCheck = await checkQuota(request.userId, request.feature)
    if (!quotaCheck.allowed) {
      console.log(`[AI Gateway] Quota denied: ${quotaCheck.reason}`)
      return {
        success: false,
        data: null,
        error: quotaCheck.reason,
      }
    }
  }
  
  // 2. Log request as pending
  const requestId = await logRequest(request.userId, request.feature, policy.model, 'pending')
  
  try {
    // 3. Update to running
    if (requestId) {
      await updateRequestStatus(requestId, 'done') // temp, will update again
    }
    
    // 4. Call OpenRouter
    const maxTokens = request.maxTokens || policy.maxTokens
    
    const result = await callOpenRouterJSON<T>(
      request.systemPrompt,
      request.prompt,
      policy.model,
      maxTokens
    )
    
    const durationMs = Date.now() - startTime
    
    // 5. Log success
    if (requestId) {
      await updateRequestStatus(requestId, 'done', undefined, undefined, durationMs)
    }
    
    console.log(`[AI Gateway] Success: ${request.feature} in ${durationMs}ms`)
    
    return {
      success: true,
      data: result,
      model: policy.model,
      requestId: requestId || undefined,
    }
    
  } catch (error: any) {
    const durationMs = Date.now() - startTime
    const errorMessage = error.message || 'Unknown error'
    
    // 6. Log failure
    if (requestId) {
      await updateRequestStatus(requestId, 'failed', undefined, errorMessage, durationMs)
    }
    
    console.error(`[AI Gateway] Failed: ${request.feature} - ${errorMessage}`)
    
    return {
      success: false,
      data: null,
      error: errorMessage,
      requestId: requestId || undefined,
    }
  }
}

// ============================================================================
// CONVENIENCE WRAPPER FOR TEXT RESPONSES
// ============================================================================

export async function callAIText(request: AIRequest): Promise<AIResponse<string>> {
  const startTime = Date.now()
  const policy = AI_POLICIES[request.feature]
  
  // Check quota
  if (!request.skipQuota) {
    const quotaCheck = await checkQuota(request.userId, request.feature)
    if (!quotaCheck.allowed) {
      return { success: false, data: null, error: quotaCheck.reason }
    }
  }
  
  const requestId = await logRequest(request.userId, request.feature, policy.model, 'pending')
  
  try {
    const result = await callOpenRouter(
      request.systemPrompt,
      request.prompt,
      policy.model,
      request.maxTokens || policy.maxTokens
    )
    
    const durationMs = Date.now() - startTime
    if (requestId) {
      await updateRequestStatus(requestId, 'done', undefined, undefined, durationMs)
    }
    
    return { success: true, data: result, model: policy.model }
    
  } catch (error: any) {
    const durationMs = Date.now() - startTime
    if (requestId) {
      await updateRequestStatus(requestId, 'failed', undefined, error.message, durationMs)
    }
    
    return { success: false, data: null, error: error.message }
  }
}

// ============================================================================
// UTILITY: Get user's remaining quota
// ============================================================================

export async function getUserQuotaStatus(userId: string): Promise<{
  tier: 'free' | 'premium'
  used: number
  limit: number
  remaining: number
}> {
  const supabase = await createClient()
  const tier = await getUserTier(userId)
  const limits = QUOTA_LIMITS[tier]
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count } = await supabase
    .from('ai_requests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
  
  const used = count || 0
  
  return {
    tier,
    used,
    limit: limits.dailyRequests,
    remaining: Math.max(0, limits.dailyRequests - used),
  }
}
