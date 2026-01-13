import { MarketRealityStageClient } from '@/components/dashboard/market-reality-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 2: MARKET REALITY
export default async function MarketRealityPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, competitors, analysis] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'competitors'),
        getAiOutput(projectId, 'analysis')
    ])

    if (!project) {
        notFound()
    }

    return (
        <MarketRealityStageClient
            project={project}
            competitorAnalysis={competitors}
            analysisData={analysis}
        />
    )
}
