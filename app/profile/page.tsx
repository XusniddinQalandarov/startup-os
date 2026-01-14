import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/app/actions/auth'
import { isPremiumUser } from '@/app/actions/user'
import { getProjects } from '@/app/actions/projects'
import { ProjectList, EditProfile } from '@/components/profile/project-list'
import { SubscriptionManager } from '@/components/profile/subscription-manager'
import { Logo } from '@/components/ui/logo'

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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-40 flex items-center justify-between px-6 lg:px-8">
                <Logo />
                <div className="flex items-center gap-6">
                    <Link
                        href="/onboarding"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                    >
                        <span>+ New Project</span>
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-2xl mx-auto px-6 pt-32 pb-20 space-y-16">
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
