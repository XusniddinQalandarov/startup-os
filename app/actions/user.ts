'use server'

import { createClient } from '@/lib/supabase/server'

export type SubscriptionTier = 'freemium' | 'premium'

export interface UserProfile {
  id: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  subscriptionTier: SubscriptionTier
  subscriptionStartedAt: string | null
  subscriptionExpiresAt: string | null
}

/**
 * Check if user email is in VIP list
 */
function isVipUser(email: string | null): boolean {
  if (!email) return false
  
  const vipUsers = process.env.VIP_PREMIUM_USERS?.split(',').map(e => e.trim().toLowerCase()) || []
  return vipUsers.includes(email.toLowerCase())
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Profile doesn't exist yet - create it with freemium
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        subscription_tier: 'freemium'
      })
      .select()
      .single()

    if (newProfile) {
      return {
        id: newProfile.id,
        email: newProfile.email,
        fullName: newProfile.full_name,
        avatarUrl: newProfile.avatar_url,
        subscriptionTier: newProfile.subscription_tier,
        subscriptionStartedAt: newProfile.subscription_started_at,
        subscriptionExpiresAt: newProfile.subscription_expires_at,
      }
    }
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    subscriptionTier: profile.subscription_tier,
    subscriptionStartedAt: profile.subscription_started_at,
    subscriptionExpiresAt: profile.subscription_expires_at,
  }
}

/**
 * Check if the current user has premium access
 */
export async function isPremiumUser(): Promise<boolean> {
  const profile = await getUserProfile()
  if (!profile) return false
  
  // Check VIP status first - VIP users have permanent premium
  if (isVipUser(profile.email)) {
    return true
  }
  
  // Check if premium and not expired
  if (profile.subscriptionTier === 'premium') {
    if (profile.subscriptionExpiresAt) {
      return new Date(profile.subscriptionExpiresAt) > new Date()
    }
    return true // No expiry = lifetime premium
  }
  
  return false
}

/**
 * Upgrade user to premium (for admin use or after payment)
 */
export async function upgradeToPremiun(userId: string, expiresAt?: Date): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'premium',
      subscription_started_at: new Date().toISOString(),
      subscription_expires_at: expiresAt?.toISOString() || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  return !error
}
