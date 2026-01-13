import { CompetitorsView } from '@/components/dashboard/competitors-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function CompetitorsPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, analysis] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'competitors')
    ])

    if (!project) {
        notFound()
    }

    return (
        <CompetitorsView
            project={project}
            initialAnalysis={analysis as any}
        />
    )
}
