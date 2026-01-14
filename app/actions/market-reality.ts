'use server'

import { analyzeCompetitors, generateDifferentiationAnalysis } from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'

export async function generateMarketReality(
    startupId: string, 
    idea: string, 
    targetUsers?: string,
    businessType?: string
) {
    console.log(`[Market Reality] Starting full generation for: "${idea}"`)
    
    try {
        // Step 1: Analyze competitors first (provides context for differentiation)
        console.log('[Market Reality] Step 1: Analyzing competitors...')
        const competitors = await analyzeCompetitors(startupId, idea, targetUsers)
        
        // Step 2: Generate differentiation analysis using competitor insights
        console.log('[Market Reality] Step 2: Generating differentiation analysis...')
        await generateDifferentiationAnalysis(startupId, idea, competitors, targetUsers)

        console.log('[Market Reality] Generation complete')
        revalidatePath(`/dashboard/${startupId}/market`)
        return { success: true }
    } catch (error) {
        console.error('[Market Reality] Generation failed:', error)
        return { success: false, error: 'Failed to generate market analysis' }
    }
}
