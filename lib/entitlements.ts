'use strict'

// ========================================
// ideY Entitlements — Single Source of Truth
// ========================================
// All feature gating logic MUST reference this file.
// Never hardcode plan checks in components.

export type UserPlan = 'free' | 'pro'

export const ENTITLEMENTS = {
  free: {
    maxProjects: 1,
    maxEvaluationsPerProject: 1,
    allowReEvaluation: false,
    allowComparison: false,
    allowExport: false,
    allowContextSwitch: false,
    allowFixSuggestions: false,
    allowCompetitorDepth: 'basic' as const,
    allowSnapshots: false,
  },
  pro: {
    maxProjects: Infinity,
    maxEvaluationsPerProject: Infinity,
    allowReEvaluation: true,
    allowComparison: true,
    allowExport: true,
    allowContextSwitch: true,
    allowFixSuggestions: true,
    allowCompetitorDepth: 'full' as const,
    allowSnapshots: true,
  }
} as const

export type Entitlements = typeof ENTITLEMENTS[UserPlan]

// Helper to get entitlements for a plan
export function getEntitlements(plan: UserPlan): Entitlements {
  return ENTITLEMENTS[plan]
}

// Check if a specific feature is allowed
export function isFeatureAllowed<K extends keyof Entitlements>(
  plan: UserPlan,
  feature: K
): Entitlements[K] {
  return ENTITLEMENTS[plan][feature]
}
