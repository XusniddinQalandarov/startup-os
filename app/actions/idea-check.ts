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
        // Run all 3 generations in parallel, but don't block on failures
        const results = await Promise.allSettled([
            evaluateIdea(startupId, {
                idea,
                targetUsers,
                businessType
            }),
            generateCustomerQuestions(startupId, idea, businessType),
            generateProjectAnalysis(startupId, idea, targetUsers, businessType)
        ])

        // Log results of each operation
        const labels = ['Evaluation', 'Questions', 'Analysis']
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`[Idea Check] ${labels[index]}: Success`)
            } else {
                console.error(`[Idea Check] ${labels[index]}: Failed -`, result.reason)
            }
        })

        // Check if at least one succeeded
        const anySuccess = results.some(r => r.status === 'fulfilled')
        
        revalidatePath(`/dashboard/${startupId}`)
        console.log(`[Idea Check] Generation complete. Success: ${anySuccess}`)
        
        return { success: anySuccess }
    } catch (error) {
        console.error('[Idea Check] Generation failed:', error)
        return { success: false, error: 'Failed to generate analysis' }
    }
}
