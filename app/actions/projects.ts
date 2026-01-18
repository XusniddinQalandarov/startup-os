'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OnboardingData, Startup } from '@/types'
import { canCreateProject } from '@/lib/plan'

import { cache } from 'react'

export const getProjects = cache(async function getProjects(): Promise<Startup[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    idea: row.idea,
    targetUsers: row.target_users,
    businessType: row.business_type,
    geography: row.geography,
    founderType: row.founder_type,
    status: row.status,
    createdAt: row.created_at,
  }))
})

export const getProject = cache(async function getProject(id: string): Promise<Startup | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching project:', error)
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    idea: data.idea,
    targetUsers: data.target_users,
    businessType: data.business_type,
    geography: data.geography,
    founderType: data.founder_type,
    status: data.status,
    createdAt: data.created_at,
  }
})

export async function createProject(data: OnboardingData): Promise<{ id: string } | { error: string; upgradeRequired?: boolean }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check plan limits before creating
  const canCreate = await canCreateProject()
  if (!canCreate.allowed) {
    return { 
      error: canCreate.reason === 'UPGRADE_REQUIRED' 
        ? 'You have reached your project limit. Upgrade to Pro for unlimited projects.'
        : canCreate.reason || 'Cannot create project',
      upgradeRequired: canCreate.reason === 'UPGRADE_REQUIRED'
    }
  }

  // Generate a name from the idea (first 50 chars or first sentence)
  const name = data.idea.split('.')[0].slice(0, 50) || 'My Startup'

  const { data: startup, error } = await supabase
    .from('startups')
    .insert({
      user_id: user.id,
      name,
      idea: data.idea,
      target_users: data.targetUsers || null,
      business_type: data.businessType || null,
      geography: data.geography || null,
      founder_type: data.founderType || null,
      status: 'evaluating',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { id: startup.id }
}

export async function updateProjectStatus(id: string, status: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('startups')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/dashboard')
}

// Note: deleteProject has been removed per business requirements
// Projects are permanent to maintain evaluation history integrity
