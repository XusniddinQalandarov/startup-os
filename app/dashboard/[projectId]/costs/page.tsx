import { CostsView } from '@/components/dashboard/costs-view'
import { getProject } from '@/app/actions/projects'
import { getAiOutput } from '@/app/actions/ai'
import { notFound } from 'next/navigation'
import type { CostEstimate } from '@/types'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function CostsPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, costs] = await Promise.all([
        getProject(projectId),
        getAiOutput(projectId, 'costs')
    ])

    if (!project) {
        notFound()
    }

    return (
        <CostsView
            project={project}
            initialCosts={costs as CostEstimate[] | null}
        />
    )
}
