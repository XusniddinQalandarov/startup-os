import { IdeaCheckStageClient } from '@/components/dashboard/idea-check-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { IdeaEvaluation, CustomerQuestion } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// STAGE 1: IDEA CHECK
export default async function IdeaCheckPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, evaluation, questions, analysis] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'evaluation'),
        getAiOutput(projectId, 'questions'),
        getAiOutput(projectId, 'analysis')
    ])

    if (!project) {
        notFound()
    }

    return (
        <IdeaCheckStageClient
            project={project}
            evaluation={evaluation as IdeaEvaluation | null}
            questions={questions as CustomerQuestion[] | null}
            problemData={analysis}
        />
    )
}
