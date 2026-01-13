import { OverviewView } from '@/components/dashboard/overview-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { IdeaEvaluation } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function OverviewPage({ params }: PageProps) {
    const { projectId } = await params

    // Parallel data fetching on the server
    // Request deduplication ensures getProject is free if Layout already fetched it
    const [project, evaluation] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'evaluation')
    ])

    if (!project) {
        notFound()
    }

    return (
        <OverviewView
            project={project}
            initialEvaluation={evaluation as IdeaEvaluation | null}
        />
    )
}
