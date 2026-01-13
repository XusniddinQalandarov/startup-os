import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button, Card } from '@/components/ui'
import { getUser } from '@/app/actions/auth'
import { getProjects } from '@/app/actions/projects'

export default async function ProfilePage() {
    const user = await getUser()

    if (!user) {
        redirect('/login')
    }

    const projects = await getProjects()

    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    const initials = user.email?.slice(0, 2).toUpperCase() || 'U'
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

    // Get the most recent/active project
    const activeProject = projects[0]
    const otherProjects = projects.slice(1)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 font-sans text-gray-900 antialiased">
            {/* Subtle ambient background */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl" />
            </div>

            {/* Minimal Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-56 bg-white/60 backdrop-blur-sm border-r border-gray-100/80 z-30 flex flex-col">
                {/* Logo - links to landing page */}
                <div className="p-4 border-b border-gray-100/50">
                    <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <Image src="/ideY.webp" alt="ideY Logo" width={36} height={24} className="w-auto h-6" />
                        <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ideY</span>
                    </Link>
                </div>

                {/* User info - compact */}
                <div className="p-3 border-b border-gray-100/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                            <p className="text-[10px] text-gray-400">Free Plan</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1">
                    <Link
                        href="/onboarding"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200/50"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </Link>
                </nav>

                {/* Bottom actions */}
                <div className="p-3 border-t border-gray-100/50 space-y-1">
                    <Link
                        href="/#pricing"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Upgrade
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                        <button
                            type="submit"
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="pl-56 min-h-screen">
                <main className="max-w-4xl mx-auto px-8 py-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Welcome back, <span className="text-indigo-600">{displayName}</span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Member since {memberSince}</p>
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Launch your first idea</h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                Transform your startup concept into an actionable plan with AI-powered validation and roadmapping.
                            </p>
                            <Link href="/onboarding">
                                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200/50 border-0 px-8">
                                    Create your first project
                                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Active Project - HERO CARD */}
                            {activeProject && (
                                <Link href={`/dashboard/${activeProject.id}`} className="block group">
                                    <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-2xl shadow-indigo-200/50 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
                                        <div className="relative bg-white rounded-[22px] p-8">
                                            {/* Status row */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${activeProject.status === 'evaluated'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : activeProject.status === 'in_progress'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {activeProject.status === 'evaluated' ? '✓ Evaluated' : activeProject.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-400">Active Project</span>
                                            </div>

                                            {/* Project title */}
                                            <h2 className="text-2xl font-bold text-gray-900 mb-8 group-hover:text-indigo-600 transition-colors">
                                                {activeProject.name}
                                            </h2>

                                            {/* CTA */}
                                            <div className="flex items-center justify-between">
                                                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200/50 border-0 group-hover:shadow-xl transition-shadow">
                                                    Continue Project
                                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </Button>
                                                <span className="text-xs text-gray-400">
                                                    Created {new Date(activeProject.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* Other Projects */}
                            {otherProjects.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Other Projects</h3>
                                    <div className="space-y-3">
                                        {otherProjects.map((project) => (
                                            <Link key={project.id} href={`/dashboard/${project.id}`} className="block group">
                                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                                                {project.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-400 truncate">{project.idea}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 ml-4">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${project.status === 'evaluated'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-gray-50 text-gray-500'
                                                                }`}>
                                                                {project.status.replace('_', ' ')}
                                                            </span>
                                                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subtle Plan Info - footer style */}
                            <div className="mt-10 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Free Plan</p>
                                            <p className="text-xs text-gray-400">1 project • Basic AI Analysis</p>
                                        </div>
                                    </div>
                                    <Link href="/#pricing" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                                        Upgrade →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
