import { LaunchPlanStageClient } from '@/components/dashboard/launch-plan-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { CostEstimate } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 4: LAUNCH PLAN
export default async function LaunchPlanPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, costs, analysis] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'costs'),
        getAiOutput(projectId, 'analysis')
    ])

    if (!project) {
        notFound()
    }

    return (
        <LaunchPlanStageClient
            project={project}
            costs={costs as CostEstimate[] | null}
            analysisData={analysis}
        />
    )
}
