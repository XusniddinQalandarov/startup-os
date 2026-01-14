import { LaunchPlanStageClient } from '@/components/dashboard/launch-plan-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { isPremiumUser } from '@/app/actions/user'
import { notFound } from 'next/navigation'
import type { CostEstimate } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 4: LAUNCH PLAN
export default async function LaunchPlanPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, costs, analysis, isPremium] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'costs'),
        getAiOutput(projectId, 'analysis'),
        isPremiumUser()
    ])

    if (!project) {
        notFound()
    }

    return (
        <LaunchPlanStageClient
            project={project}
            costs={costs as CostEstimate[] | null}
            analysisData={analysis}
            isPremium={isPremium}
        />
    )
}
