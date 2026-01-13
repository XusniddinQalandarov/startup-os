import { PlanningStageClient } from '@/components/dashboard/planning-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { RoadmapPhase, CostEstimate } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// PLANNING STAGE: Roadmap + Costs (with tabs)
export default async function PlanningStagePage({ params }: PageProps) {
    const { projectId } = await params

    const [project, roadmap, costs] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'roadmap'),
        getAiOutput(projectId, 'costs')
    ])

    if (!project) {
        notFound()
    }

    return (
        <PlanningStageClient
            project={project}
            roadmap={roadmap as RoadmapPhase[] | null}
            costs={costs as CostEstimate[] | null}
        />
    )
}
