import { DecisionStageClient } from '@/components/dashboard/decision-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { getStageStatuses } from '@/app/actions/stages'
import { isPremiumUser } from '@/app/actions/user'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 5: DECISION
export default async function DecisionPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, analysis, evaluation, isPremium, stageStatuses] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'analysis'),
        getAiOutput(projectId, 'evaluation'),
        isPremiumUser(),
        getStageStatuses(projectId)
    ])

    if (!project) {
        notFound()
    }

    return (
        <DecisionStageClient
            project={project}
            analysisData={analysis}
            evaluation={evaluation}
            isPremium={isPremium}
            stageStatus={stageStatuses.decision}
        />
    )
}
