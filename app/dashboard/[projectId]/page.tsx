import { ValidationStageClient } from '@/components/dashboard/validation-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { IdeaEvaluation, CustomerQuestion } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// VALIDATION STAGE: Evaluation + Questions + Competitors (with tabs)
export default async function ValidationStagePage({ params }: PageProps) {
    const { projectId } = await params

    const [project, evaluation, questions, competitors] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'evaluation'),
        getAiOutput(projectId, 'questions'),
        getAiOutput(projectId, 'competitors')
    ])

    if (!project) {
        notFound()
    }

    return (
        <ValidationStageClient
            project={project}
            evaluation={evaluation as IdeaEvaluation | null}
            questions={questions as CustomerQuestion[] | null}
            competitorAnalysis={competitors}
        />
    )
}
