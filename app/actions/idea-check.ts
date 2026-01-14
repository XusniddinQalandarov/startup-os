'use server'

import { createClient } from '@/lib/supabase/server'
import { evaluateIdea, generateCustomerQuestions, generateProjectAnalysis } from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'

// Aggregated action to run all Idea Check AI tasks in parallel
export async function generateIdeaCheck(
    startupId: string, 
    idea: string, 
    targetUsers?: string, 
    businessType?: string
) {
    console.log(`[Idea Check] Starting full generation for: "${idea}"`)
    
    try {
        // Run all 3 generations in parallel for speed
        await Promise.all([
            evaluateIdea(startupId, {
                idea,
                targetUsers,
                businessType
            }),
            generateCustomerQuestions(startupId, idea, businessType),
            generateProjectAnalysis(startupId, idea, targetUsers, businessType)
        ])

        revalidatePath(`/dashboard/${startupId}`)
        return { success: true }
    } catch (error) {
        console.error('[Idea Check] Generation failed:', error)
        return { success: false, error: 'Failed to generate analysis' }
    }
}
