'use server'

import { 
    evaluateIdea,
    generateRiskAnalysis,
    generateSWOTAnalysis,
    generateVerdict
} from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'

export async function generateDecision(
    startupId: string, 
    idea: string,
    targetUsers?: string,
    businessType?: string
) {
    console.log(`[Decision] Starting sequential generation for: "${idea}"`)
    
    try {
        // Step 1: Run comprehensive evaluation (scores)
        console.log('[Decision] Step 1: Running idea evaluation...')
        const evaluation = await evaluateIdea(startupId, { idea, targetUsers, businessType })
        
        // Step 2: Generate SWOT Analysis
        console.log('[Decision] Step 2: Generating SWOT analysis...')
        const swot = await generateSWOTAnalysis(startupId, idea, targetUsers, evaluation)
        
        // Step 3: Generate Risk Analysis based on evaluation
        console.log('[Decision] Step 3: Analyzing risks...')
        const risks = await generateRiskAnalysis(startupId, idea, evaluation, swot)
        
        // Step 4: Generate final Verdict using all data
        console.log('[Decision] Step 4: Generating final verdict...')
        await generateVerdict(startupId, idea, evaluation, swot, risks)

        console.log('[Decision] Generation complete')
        revalidatePath(`/dashboard/${startupId}/decision`)
        return { success: true }
    } catch (error) {
        console.error('[Decision] Generation failed:', error)
        return { success: false, error: 'Failed to generate decision analysis' }
    }
}
