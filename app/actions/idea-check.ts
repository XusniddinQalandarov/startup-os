'use server'

import { createClient } from '@/lib/supabase/server'
import { evaluateIdea, generateCustomerQuestions, generateProjectAnalysis } from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'

// Individual actions for granular updates and parallel client-side execution

export async function generateEvaluationAction(startupId: string, idea: string, targetUsers?: string, businessType?: string) {
    try {
        await evaluateIdea(startupId, { idea, targetUsers, businessType })
        revalidatePath(`/dashboard/${startupId}`)
        return { success: true }
    } catch (error) {
        console.error('[Evaluation] Failed:', error)
        return { success: false, error: 'Evaluation failed' }
    }
}

export async function generateQuestionsAction(startupId: string, idea: string, businessType?: string) {
    try {
        await generateCustomerQuestions(startupId, idea, businessType)
        revalidatePath(`/dashboard/${startupId}`)
        return { success: true }
    } catch (error) {
        console.error('[Questions] Failed:', error)
        return { success: false, error: 'Questions failed' }
    }
}

export async function generateAnalysisAction(startupId: string, idea: string, targetUsers?: string, businessType?: string) {
    try {
        await generateProjectAnalysis(startupId, idea, targetUsers, businessType)
        revalidatePath(`/dashboard/${startupId}`)
        return { success: true }
    } catch (error) {
        console.error('[Analysis] Failed:', error)
        return { success: false, error: 'Analysis failed' }
    }
}

// Aggregated action (kept for backward compatibility, but sequential-ish in terms of revalidation)
export async function generateIdeaCheck(
    startupId: string, 
    idea: string, 
    targetUsers?: string, 
    businessType?: string
) {
    console.log(`[Idea Check] Starting full generation for: "${idea}"`)
    
    try {
        // Run all 3 generations in parallel
        const results = await Promise.allSettled([
            generateEvaluationAction(startupId, idea, targetUsers, businessType),
            generateQuestionsAction(startupId, idea, businessType),
            generateAnalysisAction(startupId, idea, targetUsers, businessType)
        ])

        // Check if at least one succeeded
        const anySuccess = results.some(r => r.status === 'fulfilled' && r.value.success)
        
        console.log(`[Idea Check] Generation complete. Success: ${anySuccess}`)
        return { success: anySuccess }
    } catch (error) {
        console.error('[Idea Check] Generation failed:', error)
        return { success: false, error: 'Failed to generate analysis' }
    }
}
