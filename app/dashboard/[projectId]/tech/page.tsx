import { TechView } from '@/components/dashboard/tech-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { TechStackRecommendation } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function TechPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, stack] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'tech_stack')
    ])

    if (!project) {
        notFound()
    }

    return (
        <TechView
            project={project}
            initialStack={stack as TechStackRecommendation[] | null}
        />
    )
}
