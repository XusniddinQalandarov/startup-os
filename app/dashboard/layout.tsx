import { Sidebar } from '@/components/layout'
import { getProjects } from '@/app/actions/projects'
import { isPremiumUser } from '@/app/actions/user'
import { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const projects = await getProjects()
    const isPremium = await isPremiumUser()

    return (
        <div
            className="min-h-screen font-sans text-gray-900 antialiased selection:bg-indigo-50 selection:text-indigo-900"
        >
            {/* Solid white base layer - covers the dark body background and its pseudo-elements */}
            <div
                className="fixed inset-0 z-0"
                style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 40%, #eef2ff 100%)' }}
            />

            {/* Subtle ambient background orbs */}
            <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl" />
                <div className="absolute bottom-[-15%] left-[10%] w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-3xl" />
                <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-pink-100/20 rounded-full blur-3xl" />
            </div>

            <Sidebar projects={projects} isPremium={isPremium} />

            <div className="pl-0 md:pl-60 min-h-screen flex flex-col relative z-10">
                {children}
            </div>
        </div>
    )
}

