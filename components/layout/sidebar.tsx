'use client'

import { cn } from '@/lib/utils'
import { Startup } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useParams } from 'next/navigation'

// 5 Stage navigation - each stage links to its main page
const stages = [
    {
        id: 'validation',
        label: 'Validation',
        href: (id: string) => `/dashboard/${id}`,
        // Main overview page + questions + competitors
        matchPaths: ['/questions', '/competitors'],
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: 'scoping',
        label: 'Scoping',
        href: (id: string) => `/dashboard/${id}/mvp`,
        matchPaths: ['/mvp', '/tech'],
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        )
    },
    {
        id: 'planning',
        label: 'Planning',
        href: (id: string) => `/dashboard/${id}/roadmap`,
        matchPaths: ['/roadmap', '/costs'],
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        )
    },
    {
        id: 'execution',
        label: 'Execution',
        href: (id: string) => `/dashboard/${id}/tasks`,
        matchPaths: ['/tasks'],
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    },
    {
        id: 'review',
        label: 'Review',
        href: (id: string) => `/dashboard/${id}/analysis`,
        matchPaths: ['/analysis'],
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    }
]

interface SidebarProps {
    projects: Startup[]
}

export function Sidebar({ projects }: SidebarProps) {
    const pathname = usePathname()
    const params = useParams()
    const currentProjectId = params?.projectId as string | undefined
    const currentProject = projects.find(p => p.id === currentProjectId)

    // Determine active stage based on current path
    const getActiveStage = () => {
        if (!currentProjectId) return null
        const relativePath = pathname.replace(`/dashboard/${currentProjectId}`, '')

        // Check specific paths first (non-validation)
        for (const stage of stages) {
            if (stage.id !== 'validation') {
                if (stage.matchPaths.some(p => relativePath === p || relativePath.startsWith(p + '/'))) {
                    return stage.id
                }
            }
        }

        // Default to validation for root or validation paths
        if (relativePath === '' || relativePath === '/' ||
            stages[0].matchPaths.some(p => relativePath === p || relativePath.startsWith(p + '/'))) {
            return 'validation'
        }

        return 'validation' // Fallback
    }

    const activeStage = getActiveStage()

    return (
        <aside className="fixed left-0 top-0 h-full w-52 bg-white/60 backdrop-blur-sm border-r border-gray-100/50 z-30 flex flex-col">
            {/* Logo */}
            <div className="p-4">
                <Link href="/" className="flex items-center gap-2 px-1">
                    <Image src="/ideY.webp" alt="ideY Logo" width={32} height={24} className="w-auto h-6" />
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
                    <p className="px-3 py-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium">Stages</p>
                    {stages.map((stage) => {
                        const isActive = activeStage === stage.id

                        return (
                            <Link
                                key={stage.id}
                                href={stage.href(currentProjectId)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <span className={cn(
                                    "transition-colors",
                                    isActive ? "text-white" : "text-gray-400"
                                )}>
                                    {stage.icon}
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
                    <span className="text-[10px] text-gray-400">Free Plan</span>
                    <Link href="/#pricing" className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium">
                        Upgrade
                    </Link>
                </div>
            </div>
        </aside>
    )
}
