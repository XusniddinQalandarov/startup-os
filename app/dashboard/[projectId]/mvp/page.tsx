import { MvpView } from '@/components/dashboard/mvp-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { MvpFeature } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function MvpPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, features] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'mvp')
    ])

    if (!project) {
        notFound()
    }

    return (
        <MvpView
            project={project}
            initialFeatures={features as MvpFeature[] | null}
        />
    )
}
