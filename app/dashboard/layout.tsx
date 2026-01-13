import { Sidebar } from '@/components/layout'
import { getProjects } from '@/app/actions/projects'
import { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const projects = await getProjects()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 font-sans text-gray-900 antialiased selection:bg-indigo-50 selection:text-indigo-900">
            {/* Subtle ambient background */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/20 rounded-full blur-3xl" />
            </div>

            <Sidebar projects={projects} />

            <div className="pl-52 min-h-screen flex flex-col">
                {children}
            </div>
        </div>
    )
}
