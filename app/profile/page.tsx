import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/app/actions/auth'
import { isPremiumUser } from '@/app/actions/user'
import { getProjects } from '@/app/actions/projects'
import { ProjectList, EditProfile } from '@/components/profile/project-list'
import { SubscriptionManager } from '@/components/profile/subscription-manager'
import { AnimatedBackground } from '@/components/ui/animated-background'

export default async function ProfilePage() {
    const user = await getUser()

    if (!user) {
        redirect('/login')
    }

    const projects = await getProjects()
    const isPremium = await isPremiumUser()

    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const email = user.email || ''

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            {/* Floating Pill Header */}
            <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-5xl">
                <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-lg shadow-gray-200/50 border border-white/50 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/idey.webp" alt="ideY Logo" width={32} height={24} className="w-auto h-6" />
                        <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ideY
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href="/onboarding"
                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md shadow-indigo-200/50"
                        >
                            <span className="sm:hidden">+ New</span>
                            <span className="hidden sm:inline">+ New Project</span>
                        </Link>
                        <form action="/api/auth/signout" method="POST">
                            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-20 space-y-12 sm:space-y-16">
                {/* Profile Section */}
                <section>
                    <EditProfile
                        displayName={displayName}
                        email={email}
                        isPremium={isPremium}
                        memberSince={memberSince}
                    />
                </section>

                {/* Projects Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Projects</h3>
                        <span className="text-xs text-gray-300">{projects.length} projects</span>
                    </div>
                    <ProjectList projects={projects} isPremium={isPremium} />
                </section>

                {/* Plan Management Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Subscription Plan</h3>
                    </div>
                    <SubscriptionManager isPremium={isPremium} />
                </section>
            </main>
        </div>
    )
}
