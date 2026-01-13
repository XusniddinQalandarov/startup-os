import { Sidebar } from '@/components/layout'
import { getProjects } from '@/app/actions/projects'
import { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const projects = await getProjects()

    return (
        <div className="min-h-screen bg-background font-sans text-gray-900 antialiased selection:bg-indigo-50 selection:text-indigo-900">
            {/* Ambient Background Glow - Elite Feel */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl opacity-50 mix-blend-multiply filter" />
            </div>

            <Sidebar projects={projects} />

            <div className="pl-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
                {children}
            </div>
        </div>
    )
}
