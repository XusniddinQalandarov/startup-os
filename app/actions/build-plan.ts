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
    console.log(`[Build Plan] Starting sequential generation for: "${idea}"`)
    
    try {
        // Step 1: Define MVP Scope first (what to build)
        console.log('[Build Plan] Step 1: Generating MVP scope...')
        const mvpFeatures = await generateMvpScope(startupId, idea)
        
        // Step 2: Choose Tech Stack based on MVP requirements
        console.log('[Build Plan] Step 2: Generating tech stack based on MVP...')
        const techStack = await generateTechStack(startupId, idea, founderType, mvpFeatures)
        
        // Step 3: Create Roadmap based on MVP + Tech Stack
        console.log('[Build Plan] Step 3: Generating roadmap based on MVP & tech...')
        const roadmap = await generateRoadmap(startupId, idea, mvpFeatures, techStack)
        
        // Step 4: Break down into Tasks based on Roadmap phases
        console.log('[Build Plan] Step 4: Generating tasks based on roadmap...')
        await generateTasks(startupId, idea, mvpFeatures, roadmap)

        console.log('[Build Plan] Generation complete')
        revalidatePath(`/dashboard/${startupId}/build`)
        return { success: true }
    } catch (error) {
        console.error('[Build Plan] Generation failed:', error)
        return { success: false, error: 'Failed to generate build plan' }
    }
}
