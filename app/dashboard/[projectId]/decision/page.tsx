import { DecisionStageClient } from '@/components/dashboard/decision-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 5: DECISION
export default async function DecisionPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, analysis, evaluation] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'analysis'),
        getAiOutput(projectId, 'evaluation')
    ])

    if (!project) {
        notFound()
    }

    return (
        <DecisionStageClient
            project={project}
            analysisData={analysis}
            evaluation={evaluation}
        />
    )
}
