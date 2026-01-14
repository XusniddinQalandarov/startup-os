'use server'

import { 
    generateCosts, 
    generateGTMStrategy,
    generateSuccessMetrics
} from '@/app/actions/ai'
import { revalidatePath } from 'next/cache'

export async function generateLaunchPlan(
    startupId: string, 
    idea: string,
    targetUsers?: string,
    businessType?: string
) {
    console.log(`[Launch Plan] Starting sequential generation for: "${idea}"`)
    
    try {
        // Step 1: Generate GTM Strategy (where to launch, how to get users)
        console.log('[Launch Plan] Step 1: Generating Go-to-Market strategy...')
        const gtmStrategy = await generateGTMStrategy(startupId, idea, targetUsers)
        
        // Step 2: Generate Costs based on GTM strategy
        console.log('[Launch Plan] Step 2: Generating cost estimates...')
        const costs = await generateCosts(startupId, idea, gtmStrategy)
        
        // Step 3: Generate Success Metrics based on GTM and costs
        console.log('[Launch Plan] Step 3: Generating success metrics...')
        await generateSuccessMetrics(startupId, idea, targetUsers, gtmStrategy, costs)

        console.log('[Launch Plan] Generation complete')
        revalidatePath(`/dashboard/${startupId}/launch`)
        return { success: true }
    } catch (error) {
        console.error('[Launch Plan] Generation failed:', error)
        return { success: false, error: 'Failed to generate launch plan' }
    }
}
