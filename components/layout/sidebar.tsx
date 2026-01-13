'use client'

import { cn } from '@/lib/utils'
import { DashboardTab, Startup } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui'

interface NavItem {
    id: DashboardTab
    label: string
    href: (projectId: string) => string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    {
        id: 'overview',
        label: 'Overview',
        href: (id) => `/dashboard/${id}`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        id: 'questions',
        label: 'Customer Questions',
        href: (id) => `/dashboard/${id}/questions`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        id: 'mvp',
        label: 'MVP Scope',
        href: (id) => `/dashboard/${id}/mvp`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        id: 'roadmap',
        label: 'Roadmap',
        href: (id) => `/dashboard/${id}/roadmap`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
    },
    {
        id: 'tasks',
        label: 'Tasks',
        href: (id) => `/dashboard/${id}/tasks`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        id: 'tech',
        label: 'Tech Stack',
        href: (id) => `/dashboard/${id}/tech`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
    },
    {
        id: 'costs',
        label: 'Costs',
        href: (id) => `/dashboard/${id}/costs`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        id: 'competitors',
        label: 'Competitors',
        href: (id) => `/dashboard/${id}/competitors`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        id: 'analysis',
        label: 'Project Analysis',
        href: (id) => `/dashboard/${id}/analysis`,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
]

interface SidebarProps {
    projects: Startup[]
}

export function Sidebar({ projects }: SidebarProps) {
    const pathname = usePathname()
    const params = useParams()
    const currentProjectId = params?.projectId as string | undefined

    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
    const switcherRef = useRef<HTMLDivElement>(null)

    const currentProject = projects.find(p => p.id === currentProjectId)

    const isActive = (href: string) => {
        return pathname === href
    }

    // Close switcher when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setIsSwitcherOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 z-30 flex flex-col shadow-[1px_0_20px_rgba(0,0,0,0.02)]">
            {/* Header / Logo / Switcher */}
            <div className="p-4 border-b border-gray-100/50">
                <Link href="/dashboard" className="flex items-center gap-2 mb-6 px-2">
                    <Image src="/ideY.webp" alt="ideY Logo" width={48} height={32} className="w-auto h-8" />
                    <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">ideY</span>
                </Link>

                {/* Project Switcher */}
                <div className="relative" ref={switcherRef}>
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-all border border-gray-200/50 group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                {currentProject?.name.charAt(0).toUpperCase() || '+'}
                            </div>
                            <div className="flex flex-col items-start truncate">
                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                                    {currentProject?.name || 'Select Project'}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium">Free Plan</span>
                            </div>
                        </div>
                        <svg
                            className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isSwitcherOpen && "rotate-180")}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Switcher Dropdown */}
                    {isSwitcherOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-1">
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Your Projects
                                </div>
                                {projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/${project.id}`}
                                        onClick={() => setIsSwitcherOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-2 rounded-lg text-sm mb-0.5 transition-colors",
                                            project.id === currentProjectId
                                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            project.id === currentProjectId ? "bg-indigo-500" : "bg-gray-300"
                                        )} />
                                        <span className="truncate">{project.name}</span>
                                    </Link>
                                ))}
                                <div className="h-px bg-gray-100 my-1" />
                                <Link
                                    href="/onboarding"
                                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                >
                                    <div className="w-5 h-5 rounded-md border border-dashed border-gray-300 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    Create Project
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            {currentProjectId && (
                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Menu
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href(currentProjectId))
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href(currentProjectId)}
                                    className={cn(
                                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                        active
                                            ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-700 shadow-sm border border-indigo-100/50'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'
                                    )}
                                >
                                    <span className={cn(
                                        "transition-colors duration-200",
                                        active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                                    )}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            )}

            {/* User section at bottom */}
            <div className="p-4 border-t border-gray-100/50 mt-auto">
                <form action="/api/auth/signout" method="POST">
                    <button
                        type="submit"
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-red-50/50 hover:text-red-600 transition-all duration-200 group"
                    >
                        <svg className="w-5 h-5 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                    </button>
                </form>
            </div>
        </aside>
    )
}
