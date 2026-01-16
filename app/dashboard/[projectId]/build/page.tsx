import { BuildPlanStageClient } from '@/components/dashboard/build-plan-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { getTasks } from '@/app/actions/tasks'
import { getStageStatuses } from '@/app/actions/stages'
import { isPremiumUser } from '@/app/actions/user'
import { notFound } from 'next/navigation'
import type { MvpFeature, TechStackRecommendation, RoadmapPhase } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 3: BUILD PLAN
export default async function BuildPlanPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, features, techStack, roadmap, tasks, isPremium, stageStatuses] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'mvp'),
        getAiOutput(projectId, 'tech_stack'),
        getAiOutput(projectId, 'roadmap'),
        getTasks(projectId),
        isPremiumUser(),
        getStageStatuses(projectId)
    ])

    if (!project) {
        notFound()
    }

    return (
        <BuildPlanStageClient
            project={project}
            features={features as MvpFeature[] | null}
            techStack={techStack as TechStackRecommendation[] | null}
            roadmap={roadmap as RoadmapPhase[] | null}
            tasks={tasks}
            isPremium={isPremium}
            stageStatus={stageStatuses.build_plan}
        />
    )
}
