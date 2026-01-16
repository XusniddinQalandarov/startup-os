import { LaunchPlanStageClient } from '@/components/dashboard/launch-plan-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { getStageStatuses } from '@/app/actions/stages'
import { isPremiumUser } from '@/app/actions/user'
import { notFound } from 'next/navigation'
import type { CostEstimate } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 4: LAUNCH PLAN
export default async function LaunchPlanPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, costs, analysis, isPremium, stageStatuses] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'costs'),
        getAiOutput(projectId, 'analysis'),
        isPremiumUser(),
        getStageStatuses(projectId)
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
            stageStatus={stageStatuses.launch_plan}
        />
    )
}
