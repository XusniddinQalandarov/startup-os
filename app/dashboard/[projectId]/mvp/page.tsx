import { ScopingStageClient } from '@/components/dashboard/scoping-stage-client'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { MvpFeature, TechStackRecommendation } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// SCOPING STAGE: MVP + Tech Stack (with tabs)
export default async function ScopingStagePage({ params }: PageProps) {
    const { projectId } = await params

    const [project, features, techStack] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'mvp'),
        getAiOutput(projectId, 'tech_stack')
    ])

    if (!project) {
        notFound()
    }

    return (
        <ScopingStageClient
            project={project}
            features={features as MvpFeature[] | null}
            techStack={techStack as TechStackRecommendation[] | null}
        />
    )
}
