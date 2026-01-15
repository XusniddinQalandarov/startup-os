'use client'

import { cn } from '@/lib/utils'
import { Startup } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useParams } from 'next/navigation'

// NEW 5-STAGE FOUNDER JOURNEY with stage-specific colors
const stages = [
    {
        id: 'idea-check',
        label: 'Idea Check',
        href: (id: string) => `/dashboard/${id}`,
        matchPaths: ['/questions'],
        // Orange theme - matches the lightbulb icon
        colors: {
            gradient: 'from-amber-400 to-orange-500',
            shadow: 'shadow-amber-200/50',
            numberBg: 'bg-amber-100',
            numberText: 'text-amber-600',
        },
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        )
    },
    {
        id: 'market-reality',
        label: 'Market Reality',
        href: (id: string) => `/dashboard/${id}/market`,
        matchPaths: ['/market', '/competitors'],
        // Blue theme - matches the search/research icon
        colors: {
            gradient: 'from-blue-500 to-cyan-500',
            shadow: 'shadow-blue-200/50',
            numberBg: 'bg-blue-100',
            numberText: 'text-blue-600',
        },
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        )
    },
    {
        id: 'build-plan',
        label: 'Build Plan',
        href: (id: string) => `/dashboard/${id}/build`,
        matchPaths: ['/build', '/mvp', '/tech', '/tasks'],
        // Purple theme - matches the beaker/science icon
        colors: {
            gradient: 'from-violet-500 to-purple-600',
            shadow: 'shadow-violet-200/50',
            numberBg: 'bg-violet-100',
            numberText: 'text-violet-600',
        },
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        )
    },
    {
        id: 'launch-plan',
        label: 'Launch Plan',
        href: (id: string) => `/dashboard/${id}/launch`,
        matchPaths: ['/launch', '/roadmap', '/costs'],
        // Pink/Rose theme - matches the rocket icon
        colors: {
            gradient: 'from-pink-500 to-rose-500',
            shadow: 'shadow-pink-200/50',
            numberBg: 'bg-pink-100',
            numberText: 'text-pink-600',
        },
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
        )
    },
    {
        id: 'decision',
        label: 'Decision',
        href: (id: string) => `/dashboard/${id}/decision`,
        matchPaths: ['/decision', '/analysis'],
        // Emerald/Teal theme - matches the shield/checkmark icon
        colors: {
            gradient: 'from-emerald-500 to-teal-500',
            shadow: 'shadow-emerald-200/50',
            numberBg: 'bg-emerald-100',
            numberText: 'text-emerald-600',
        },
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    }
]

interface SidebarProps {
    projects: Startup[]
    isPremium: boolean
}

export function Sidebar({ projects, isPremium }: SidebarProps) {
    const pathname = usePathname()
    const params = useParams()
    const currentProjectId = params?.projectId as string | undefined
    const currentProject = projects.find(p => p.id === currentProjectId)

    // Determine active stage based on current path
    const getActiveStage = () => {
        if (!currentProjectId) return null
        const relativePath = pathname.replace(`/dashboard/${currentProjectId}`, '')

        // Check each stage for matching paths
        for (const stage of stages) {
            if (stage.id !== 'idea-check') {
                if (stage.matchPaths.some(p => relativePath === p || relativePath.startsWith(p + '/'))) {
                    return stage.id
                }
            }
        }

        // Default to idea-check for root or its paths
        if (relativePath === '' || relativePath === '/' ||
            stages[0].matchPaths.some(p => relativePath === p || relativePath.startsWith(p + '/'))) {
            return 'idea-check'
        }

        return 'idea-check'
    }

    const activeStage = getActiveStage()

    return (
        <>
            {/* Gradient border wrapper */}
            <div
                className="fixed left-4 top-4 h-[calc(100vh-2rem)] w-52 rounded-3xl p-[2px] z-30"
            >
                <aside className="h-full w-full bg-white/95 backdrop-blur-xl rounded-[22px] shadow-xl shadow-purple-200/30 flex flex-col overflow-hidden border border-purple-100/50">
                    {/* Logo */}
                    <div className="p-4">
                        <Link href="/" className="flex items-center gap-2 px-1">
                            <Image src="/idey.webp" alt="ideY Logo" width={32} height={24} className="w-auto h-6" />
                            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ideY</span>
                        </Link>
                    </div>

                    {/* Current project */}
                    {currentProject && (
                        <div className="px-4 pb-4">
                            <Link href="/profile" className="block group">
                                <div className="p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Project</p>
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                        {currentProject.name}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Stage navigation */}
                    {currentProjectId && (
                        <nav className="flex-1 px-3 space-y-1">
                            <p className="px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Journey</p>
                            {stages.map((stage, index) => {
                                const isActive = activeStage === stage.id
                                const { colors } = stage

                                return (
                                    <Link
                                        key={stage.id}
                                        href={stage.href(currentProjectId)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                                            isActive
                                                ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.shadow}`
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <span className={cn(
                                            "flex items-center justify-center w-5 h-5 rounded-md text-xs font-medium transition-colors",
                                            isActive
                                                ? "bg-white/25 text-white"
                                                : `${colors.numberBg} ${colors.numberText}`
                                        )}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium">{stage.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    )}

                    {/* Bottom */}
                    <div className="p-3 border-t border-gray-100/50 space-y-1">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            All Projects
                        </Link>
                        <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">
                                {isPremium ? 'Premium Plan' : 'Free Plan'}
                            </span>
                            {!isPremium && (
                                <Link href="/profile" className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium">
                                    Upgrade
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </>
    )
}
