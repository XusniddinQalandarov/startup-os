import { QuestionsView } from '@/components/dashboard/questions-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { CustomerQuestion } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function QuestionsPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, questions] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'questions')
    ])

    if (!project) {
        notFound()
    }

    return (
        <QuestionsView
            project={project}
            initialQuestions={questions as CustomerQuestion[] | null}
        />
    )
}
