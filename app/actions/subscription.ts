'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upgradeToPremium(promoCode?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let durationDays = 30 // Default 1 month
  
  // High level implementation: Verify promo code logic on server
  if (promoCode && promoCode.trim().toUpperCase() === 'LSMD4100') {
    durationDays = 7 // 1 week free/discounted access
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
