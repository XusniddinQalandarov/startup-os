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
            {/* Add top padding on mobile for the mobile header bar */}
            <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">
                <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
