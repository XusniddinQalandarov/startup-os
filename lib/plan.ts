'use server'

import { createClient } from '@/lib/supabase/server'
import { ENTITLEMENTS, type UserPlan } from '@/lib/entitlements'
import { cache } from 'react'

// ========================================
// Plan Utilities — Server-Side Only
// ========================================
// All plan checks must go through these functions.

/**
 * Get the current user's plan from the database
 * Defaults to 'free' if not found
 */
export const getUserPlan = cache(async function getUserPlan(): Promise<UserPlan> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return (profile?.plan as UserPlan) || 'free'
})

/**
 * Get entitlements for the current user
 */
export async function getUserEntitlements() {
  const plan = await getUserPlan()
  return ENTITLEMENTS[plan]
}

/**
 * Check if a specific feature is allowed for the current user
 * Returns the value of the entitlement (boolean, number, or string)
 */
export async function checkEntitlement(
  feature: keyof typeof ENTITLEMENTS['free']
): Promise<boolean | number | string> {
  const plan = await getUserPlan()
  return ENTITLEMENTS[plan][feature] as boolean | number | string
}

/**
 * Get the number of projects for a user
 */
export async function getProjectCount(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('startups')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count || 0
}

/**
 * Get the number of evaluation runs for a project
 */
export async function getEvaluationRunCount(startupId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('evaluation_runs')
    .select('*', { count: 'exact', head: true })
    .eq('startup_id', startupId)

  return count || 0
}

/**
 * Check if user can create a new project
 * Returns { allowed: true } or { allowed: false, reason: string }
 */
export async function canCreateProject(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: 'Not authenticated' }

  const plan = await getUserPlan()
  const entitlements = ENTITLEMENTS[plan]
  const projectCount = await getProjectCount(user.id)

  if (projectCount >= entitlements.maxProjects) {
    return { 
      allowed: false, 
      reason: 'UPGRADE_REQUIRED',
    }
  }

  return { allowed: true }
}

/**
 * Check if user can run evaluation on a project
 */
export async function canEvaluate(startupId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan()
  const entitlements = ENTITLEMENTS[plan]
  const runCount = await getEvaluationRunCount(startupId)

  // First evaluation is always allowed
  if (runCount === 0) return { allowed: true }

  // Check re-evaluation permission
  if (!entitlements.allowReEvaluation) {
    return { allowed: false, reason: 'UPGRADE_REQUIRED' }
  }

  // Check max evaluations limit
  if (runCount >= entitlements.maxEvaluationsPerProject) {
    return { allowed: false, reason: 'LIMIT_REACHED' }
  }

  return { allowed: true }
}

/**
 * Record an evaluation run
 */
export async function recordEvaluationRun(startupId: string, data?: any): Promise<void> {
  const supabase = await createClient()
  
  const currentCount = await getEvaluationRunCount(startupId)
  
  await supabase.from('evaluation_runs').insert({
    startup_id: startupId,
    run_number: currentCount + 1,
    evaluation_data: data || null
  })
}
