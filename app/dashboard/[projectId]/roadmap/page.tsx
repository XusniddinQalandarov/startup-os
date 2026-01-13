import { RoadmapView } from '@/components/dashboard/roadmap-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { RoadmapPhase } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function RoadmapPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, roadmap] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'roadmap')
    ])

    if (!project) {
        notFound()
    }

    return (
        <RoadmapView
            project={project}
            initialRoadmap={roadmap as RoadmapPhase[] | null}
        />
    )
}
