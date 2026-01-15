'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

// Admin email from environment variable (more secure)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Debug logging (remove in production)
    console.log('[Admin Check] User email:', user?.email)
    console.log('[Admin Check] ADMIN_EMAIL env:', ADMIN_EMAIL)
    console.log('[Admin Check] Match:', user?.email === ADMIN_EMAIL)
    
    return user?.email === ADMIN_EMAIL
}

// Get all users from auth.users (requires service role)
export const getAdminStats = cache(async function getAdminStats() {
    const supabase = await createClient()
    
    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) {
        return null
    }

    // Get total projects count
    const { count: totalProjects } = await supabase
        .from('startups')
        .select('*', { count: 'exact', head: true })

    // Get AI outputs count
    const { count: totalAiOutputs } = await supabase
        .from('ai_outputs')
        .select('*', { count: 'exact', head: true })

    // Get tasks count
    const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })

    // Get customer questions count
    const { count: totalQuestions } = await supabase
        .from('customer_questions')
        .select('*', { count: 'exact', head: true })

    // Get competitor analyses count
    const { count: totalCompetitorAnalyses } = await supabase
        .from('competitor_analyses')
        .select('*', { count: 'exact', head: true })

    // Get project analyses count
    const { count: totalProjectAnalyses } = await supabase
        .from('project_analyses')
        .select('*', { count: 'exact', head: true })

    // Get costs count
    const { count: totalCosts } = await supabase
        .from('costs')
        .select('*', { count: 'exact', head: true })

    // Get projects by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentProjects } = await supabase
        .from('startups')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    return {
        totalProjects: totalProjects || 0,
        totalAiOutputs: totalAiOutputs || 0,
        totalTasks: totalTasks || 0,
        totalQuestions: totalQuestions || 0,
        totalCompetitorAnalyses: totalCompetitorAnalyses || 0,
        totalProjectAnalyses: totalProjectAnalyses || 0,
        totalCosts: totalCosts || 0,
        recentProjectDates: recentProjects?.map(p => p.created_at) || []
    }
})

// Get all projects with user info
export const getAllProjects = cache(async function getAllProjects() {
    const supabase = await createClient()
    
    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) {
        return []
    }

    const { data, error } = await supabase
        .from('startups')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching all projects:', error)
        return []
    }

    return data || []
})

// Get unique user IDs from projects
export const getUniqueUsers = cache(async function getUniqueUsers() {
    const supabase = await createClient()
    
    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) {
        return []
    }

    const { data, error } = await supabase
        .from('startups')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    // Get unique users with their first project date
    const userMap = new Map<string, { userId: string, firstSeen: string, projectCount: number }>()
    
    data?.forEach(row => {
        if (!userMap.has(row.user_id)) {
            userMap.set(row.user_id, {
                userId: row.user_id,
                firstSeen: row.created_at,
                projectCount: 1
            })
        } else {
            const existing = userMap.get(row.user_id)!
            existing.projectCount++
            // Keep earliest date
            if (new Date(row.created_at) < new Date(existing.firstSeen)) {
                existing.firstSeen = row.created_at
            }
        }
    })

    return Array.from(userMap.values())
})

// Get AI output counts by type for a project
export const getProjectAiStats = cache(async function getProjectAiStats(projectId: string) {
    const supabase = await createClient()
    
    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) {
        return null
    }

    const { data } = await supabase
        .from('ai_outputs')
        .select('output_type')
        .eq('startup_id', projectId)

    const counts: Record<string, number> = {}
    data?.forEach(row => {
        counts[row.output_type] = (counts[row.output_type] || 0) + 1
    })

    return counts
})

// Get premium users (from subscriptions or user metadata)
export const getPremiumStats = cache(async function getPremiumStats() {
    const supabase = await createClient()
    
    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) {
        return { premium: 0, free: 0 }
    }

    // Check subscriptions table if exists
    const { data } = await supabase
        .from('subscriptions')
        .select('user_id, status')
        .eq('status', 'active')

    const premiumCount = data?.length || 0
    
    // Get total unique users
    const users = await getUniqueUsers()
    const totalUsers = users.length
    
    return {
        premium: premiumCount,
        free: totalUsers - premiumCount
    }
})
