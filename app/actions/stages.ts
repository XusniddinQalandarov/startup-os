'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export type StageName = 'idea_check' | 'market_reality' | 'build_plan' | 'launch_plan' | 'decision'
export type StageStatus = 'draft' | 'locked' | 'outdated'

// Stage dependency chain
const STAGE_ORDER: StageName[] = ['idea_check', 'market_reality', 'build_plan', 'launch_plan', 'decision']

interface StageStatuses {
    idea_check: StageStatus
    market_reality: StageStatus
    build_plan: StageStatus
    launch_plan: StageStatus
    decision: StageStatus
}

// Get all stage statuses for a startup
export const getStageStatuses = cache(async function getStageStatuses(startupId: string): Promise<StageStatuses> {
    const supabase = await createClient()
    
    const { data } = await supabase
        .from('startups')
        .select('stage_status')
        .eq('id', startupId)
        .single()
    
    // Default all stages to draft
    const defaultStatuses: StageStatuses = {
        idea_check: 'draft',
        market_reality: 'draft',
        build_plan: 'draft',
        launch_plan: 'draft',
        decision: 'draft'
    }
    
    if (!data?.stage_status) return defaultStatuses
    
    return { ...defaultStatuses, ...data.stage_status }
})

// Lock a stage (save current state as confirmed)
export async function lockStage(startupId: string, stage: StageName): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    
    // Get current statuses
    const currentStatuses = await getStageStatuses(startupId)
    
    // Update this stage to locked
    const newStatuses = {
        ...currentStatuses,
        [stage]: 'locked' as StageStatus
    }
    
    const { error } = await supabase
        .from('startups')
        .update({ 
            stage_status: newStatuses,
            updated_at: new Date().toISOString()
        })
        .eq('id', startupId)
    
    if (error) {
        console.error('[lockStage] Error:', error)
        return { success: false, error: error.message }
    }
    
    revalidatePath(`/dashboard/${startupId}`)
    return { success: true }
}

// Unlock a stage (mark as draft for editing)
export async function unlockStage(startupId: string, stage: StageName): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    
    const currentStatuses = await getStageStatuses(startupId)
    
    // Mark this stage as draft and all downstream stages as outdated
    const stageIndex = STAGE_ORDER.indexOf(stage)
    const newStatuses = { ...currentStatuses }
    
    newStatuses[stage] = 'draft'
    
    // Mark downstream stages as outdated
    for (let i = stageIndex + 1; i < STAGE_ORDER.length; i++) {
        const downstreamStage = STAGE_ORDER[i]
        if (newStatuses[downstreamStage] === 'locked') {
            newStatuses[downstreamStage] = 'outdated'
        }
    }
    
    const { error } = await supabase
        .from('startups')
        .update({ 
            stage_status: newStatuses,
            updated_at: new Date().toISOString()
        })
        .eq('id', startupId)
    
    if (error) {
        console.error('[unlockStage] Error:', error)
        return { success: false, error: error.message }
    }
    
    revalidatePath(`/dashboard/${startupId}`)
    return { success: true }
}

// Invalidate downstream stages when content changes
export async function invalidateDownstream(startupId: string, stage: StageName): Promise<{ success: boolean; affectedStages: StageName[] }> {
    const supabase = await createClient()
    
    const currentStatuses = await getStageStatuses(startupId)
    const stageIndex = STAGE_ORDER.indexOf(stage)
    
    const affectedStages: StageName[] = []
    const newStatuses = { ...currentStatuses }
    
    // Mark all downstream stages as outdated if they were locked
    for (let i = stageIndex + 1; i < STAGE_ORDER.length; i++) {
        const downstreamStage = STAGE_ORDER[i]
        if (newStatuses[downstreamStage] === 'locked') {
            newStatuses[downstreamStage] = 'outdated'
            affectedStages.push(downstreamStage)
        }
    }
    
    if (affectedStages.length === 0) {
        return { success: true, affectedStages: [] }
    }
    
    const { error } = await supabase
        .from('startups')
        .update({ 
            stage_status: newStatuses,
            updated_at: new Date().toISOString()
        })
        .eq('id', startupId)
    
    if (error) {
        console.error('[invalidateDownstream] Error:', error)
        return { success: false, affectedStages: [] }
    }
    
    revalidatePath(`/dashboard/${startupId}`)
    return { success: true, affectedStages }
}

// Check if upstream stages are locked (for showing warnings)
export async function checkUpstreamLocked(startupId: string, stage: StageName): Promise<boolean> {
    const statuses = await getStageStatuses(startupId)
    const stageIndex = STAGE_ORDER.indexOf(stage)
    
    // Check all upstream stages
    for (let i = 0; i < stageIndex; i++) {
        const upstreamStage = STAGE_ORDER[i]
        if (statuses[upstreamStage] !== 'locked') {
            return false
        }
    }
    
    return true
}
