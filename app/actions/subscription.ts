'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Check if promo code is valid
 */
async function isValidPromoCode(code: string): Promise<boolean> {
  const validCode = process.env.PROMO_CODE_TRIAL?.trim().toUpperCase()
  if (!validCode) return false
  return code.trim().toUpperCase() === validCode
}

/**
 * Check if user has already used this promo code
 */
async function hasUsedPromoCode(userId: string, code: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('promo_code_usage')
    .select('id')
    .eq('user_id', userId)
    .eq('promo_code', code.toUpperCase())
    .maybeSingle()
  
  return !!data
}

/**
 * Record promo code usage
 */
async function recordPromoCodeUsage(userId: string, code: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('promo_code_usage').insert({
    user_id: userId,
    promo_code: code.toUpperCase()
  })
}


export async function upgradeToPremium(promoCode?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let durationDays = 30 // Default 1 month
  
  // Validate and check promo code
  if (promoCode) {
    if (!await isValidPromoCode(promoCode)) {
      throw new Error('Invalid promo code')
    }
    
    if (await hasUsedPromoCode(user.id, promoCode)) {
      throw new Error('This promo code has already been used')
    }
    
    durationDays = 7 // 1 week for promo
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'premium',
      subscription_started_at: new Date().toISOString(),
      subscription_expires_at: expiresAt.toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error upgrading subscription:', error)
    throw new Error('Failed to upgrade subscription')
  }

  // Record promo code usage if applicable
  if (promoCode) {
    await recordPromoCodeUsage(user.id, promoCode)
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true, durationDays }
}

export async function downgradeToFreemium() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'freemium',
      subscription_expires_at: new Date().toISOString() // Expire immediately logic
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error downgrading subscription:', error)
    throw new Error('Failed to downgrade subscription')
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}
