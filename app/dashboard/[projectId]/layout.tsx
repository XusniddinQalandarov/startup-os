import { Header } from '@/components/layout'
import { getProject } from '@/app/actions/projects'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

interface LayoutProps {
    children: ReactNode
    params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
    const { projectId } = await params
    const project = await getProject(projectId)

    if (!project) {
        notFound()
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <Header startupName={project.name} status={project.status} />
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
