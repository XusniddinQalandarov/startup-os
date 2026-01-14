'use server'

import { analyzeCompetitors, generateDifferentiationAnalysis } from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'

export async function generateMarketReality(
    startupId: string, 
    idea: string, 
    targetUsers?: string,
    businessType?: string
) {
    console.log(`[Market Reality] Starting generation for: "${idea}"`)
    
    try {
        // Run both analyses - use allSettled so one failure doesn't block both
        const results = await Promise.allSettled([
            analyzeCompetitors(startupId, idea, targetUsers),
            generateDifferentiationAnalysis(startupId, idea, null, targetUsers)
        ])
        
        const [competitorsResult, differentiationResult] = results
        
        // Log results
        if (competitorsResult.status === 'fulfilled') {
            console.log('[Market Reality] Competitors: Success')
        } else {
            console.error('[Market Reality] Competitors: Failed -', competitorsResult.reason)
        }
        
        if (differentiationResult.status === 'fulfilled') {
            console.log('[Market Reality] Differentiation: Success')
        } else {
            console.error('[Market Reality] Differentiation: Failed -', differentiationResult.reason)
        }
        
        const anySuccess = results.some(r => r.status === 'fulfilled')
        
        revalidatePath(`/dashboard/${startupId}/market`)
        console.log(`[Market Reality] Complete. Success: ${anySuccess}`)
        
        return { success: anySuccess }
    } catch (error) {
        console.error('[Market Reality] Generation failed:', error)
        return { success: false, error: 'Failed to generate market analysis' }
    }
}
