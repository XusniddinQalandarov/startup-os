import { AnalysisView } from '@/components/dashboard/analysis-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function AnalysisPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, analysis] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'analysis')
    ])

    if (!project) {
        notFound()
    }

    return (
        <AnalysisView
            project={project}
            initialAnalysis={analysis as any}
        />
    )
}
