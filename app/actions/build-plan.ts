'use server'

import { 
    generateMvpScope, 
    generateTechStack, 
    generateRoadmap, 
    generateTasks 
} from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'
import type { MvpFeature, TechStackRecommendation, RoadmapPhase } from '@/types'

export async function generateBuildPlan(
    startupId: string, 
    idea: string,
    founderType?: string
) {
    console.log(`[Build Plan] Starting optimized generation for: "${idea}"`)
    
    try {
        // Phase 1: Generate MVP and Tech Stack in PARALLEL (both only need the idea)
        console.log('[Build Plan] Phase 1: Generating MVP scope and Tech stack in parallel...')
        const [mvpResult, techResult] = await Promise.allSettled([
            generateMvpScope(startupId, idea),
            generateTechStack(startupId, idea, founderType, null) // Tech doesn't strictly need MVP
        ])
        
        const mvpFeatures = mvpResult.status === 'fulfilled' ? mvpResult.value : null
        const techStack = techResult.status === 'fulfilled' ? techResult.value : null
        
        console.log(`[Build Plan] Phase 1 done. MVP: ${mvpResult.status}, Tech: ${techResult.status}`)
        
        // Phase 2: Generate Roadmap and Tasks in PARALLEL
        console.log('[Build Plan] Phase 2: Generating Roadmap and Tasks in parallel...')
        const [roadmapResult, tasksResult] = await Promise.allSettled([
            generateRoadmap(startupId, idea, mvpFeatures, techStack),
            generateTasks(startupId, idea, mvpFeatures, null) // Tasks can start from MVP
        ])
        
        console.log(`[Build Plan] Phase 2 done. Roadmap: ${roadmapResult.status}, Tasks: ${tasksResult.status}`)
        
        // Log any failures
        const allResults = [mvpResult, techResult, roadmapResult, tasksResult]
        const labels = ['MVP', 'TechStack', 'Roadmap', 'Tasks']
        allResults.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`[Build Plan] ${labels[i]} failed:`, r.reason)
            }
        })
        
        const anySuccess = allResults.some(r => r.status === 'fulfilled')
        
        console.log(`[Build Plan] Complete. Success: ${anySuccess}`)
        revalidatePath(`/dashboard/${startupId}/build`)
        return { success: anySuccess }
    } catch (error) {
        console.error('[Build Plan] Generation failed:', error)
        return { success: false, error: 'Failed to generate build plan' }
    }
}
