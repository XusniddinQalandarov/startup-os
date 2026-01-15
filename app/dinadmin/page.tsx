import { redirect } from 'next/navigation'
import { isAdmin, getAdminStats, getAllProjects, getAuthUsers, getPremiumStats } from '@/app/actions/admin'
import { AnimatedBackground } from '@/components/ui/animated-background'

export default async function AdminPage() {
    // Check admin access
    const adminAccess = await isAdmin()
    if (!adminAccess) {
        redirect('/')
    }

    // Fetch all data
    const [stats, projects, users, premiumStats] = await Promise.all([
        getAdminStats(),
        getAllProjects(),
        getAuthUsers(),
        getPremiumStats()
    ])

    // Group projects by date for chart
    const projectsByDate: Record<string, number> = {}
    stats?.recentProjectDates.forEach(date => {
        const day = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        projectsByDate[day] = (projectsByDate[day] || 0) + 1
    })

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">ideY Platform Analytics</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Users"
                        value={users.length}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                        color="indigo"
                    />
                    <StatCard
                        label="Total Projects"
                        value={stats?.totalProjects || 0}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        }
                        color="purple"
                    />
                    <StatCard
                        label="Premium Users"
                        value={premiumStats.premium}
                        subtext={`${premiumStats.free} free`}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        }
                        color="amber"
                    />
                    <StatCard
                        label="AI Generations"
                        value={stats?.totalAiOutputs || 0}
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        color="emerald"
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <MiniStat label="Tasks Created" value={stats?.totalTasks || 0} />
                    <MiniStat label="Customer Questions" value={stats?.totalQuestions || 0} />
                    <MiniStat label="Competitor Analyses" value={stats?.totalCompetitorAnalyses || 0} />
                    <MiniStat label="Project Analyses" value={stats?.totalProjectAnalyses || 0} />
                    <MiniStat label="Cost Estimates" value={stats?.totalCosts || 0} />
                </div>

                {/* Projects by Date */}
                {Object.keys(projectsByDate).length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects (Last 30 Days)</h2>
                        <div className="flex items-end gap-2 h-32 overflow-x-auto pb-2">
                            {Object.entries(projectsByDate).map(([date, count]) => (
                                <div key={date} className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <div
                                        className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                                        style={{ height: `${Math.max(count * 20, 8)}px` }}
                                    />
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Users ({users.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Email</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Signed Up</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Last Login</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Projects</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.slice(0, 50).map(user => (
                                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-2 text-gray-900 font-medium">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-2 text-gray-600">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-3 px-2 text-gray-500 text-xs">
                                            {user.lastSignIn
                                                ? new Date(user.lastSignIn).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'Never'
                                            }
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.projectCount > 0
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                {user.projectCount}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length > 50 && (
                            <p className="text-gray-400 text-sm mt-4">Showing 50 of {users.length} users</p>
                        )}
                    </div>
                </div>

                {/* Recent Projects Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects ({projects.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Name</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Idea</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Type</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.slice(0, 100).map((project: any) => (
                                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-2 text-gray-900 font-medium max-w-[150px] truncate">
                                            {project.name}
                                        </td>
                                        <td className="py-3 px-2 text-gray-600 max-w-[300px] truncate">
                                            {project.idea?.slice(0, 80)}...
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                {project.business_type || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'evaluating'
                                                ? 'bg-amber-50 text-amber-600'
                                                : project.status === 'building'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : project.status === 'launched'
                                                        ? 'bg-green-50 text-green-600'
                                                        : 'bg-gray-50 text-gray-600'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-gray-600 whitespace-nowrap">
                                            {new Date(project.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {projects.length > 100 && (
                            <p className="text-gray-400 text-sm mt-4">Showing 100 of {projects.length} projects</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-400 text-sm mt-12">
                    <p>ideY Admin Dashboard • Data refreshes on page load</p>
                </div>
            </div>
        </div>
    )
}

// Stat Card Component
function StatCard({ label, value, subtext, icon, color }: {
    label: string
    value: number | string
    subtext?: string
    icon: React.ReactNode
    color: 'indigo' | 'purple' | 'amber' | 'emerald'
}) {
    const colors = {
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
        purple: 'from-purple-500 to-purple-600 shadow-purple-200',
        amber: 'from-amber-500 to-amber-600 shadow-amber-200',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200'
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg ${colors[color].split(' ')[2]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    )
}

// Mini Stat Component
function MiniStat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    )
}
