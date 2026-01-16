import { MarketRealityStageClient } from '@/components/dashboard/market-reality-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { getStageStatuses } from '@/app/actions/stages'
import { isPremiumUser } from '@/app/actions/user'
import { notFound } from 'next/navigation'

interface DifferentiationData {
    valueProposition: string
    unfairAdvantage: string
    positioningStatement: string
    marketDifficulty: 'low' | 'moderate' | 'high' | 'unknown'
    marketDifficultyReason: string
}

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 2: MARKET REALITY
export default async function MarketRealityPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, competitors, differentiation, isPremium, stageStatuses] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'competitors'),
        getAiOutput(projectId, 'differentiation'),
        isPremiumUser(),
        getStageStatuses(projectId)
    ])

    if (!project) {
        notFound()
    }

    return (
        <MarketRealityStageClient
            project={project}
            competitorAnalysis={competitors}
            differentiationData={differentiation as DifferentiationData | null}
            isPremium={isPremium}
            stageStatus={stageStatuses.market_reality}
        />
    )
}
