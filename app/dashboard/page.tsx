import Link from 'next/link'
import { getProjects } from '@/app/actions/projects'
import { Card, Button } from '@/components/ui'

export default async function DashboardPage() {
    const projects = await getProjects()

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">No projects yet</h1>
                <p className="text-gray-600 mb-6 max-w-md">
                    Start by creating your first project. We'll help you evaluate your idea and create an execution plan.
                </p>
                <Link href="/onboarding">
                    <Button size="lg">Create your first project</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Your Projects</h1>
                    <p className="text-gray-600 mt-1">Select a project to view its details</p>
                </div>
                <Link href="/onboarding">
                    <Button>New Project</Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {projects.map((project) => (
                    <Link key={project.id} href={`/dashboard/${project.id}`}>
                        <Card padding="md" className="hover:border-gray-300 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-medium text-gray-900 truncate">{project.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.idea}</p>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                    <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${project.status === 'evaluated'
                                                ? 'bg-blue-100 text-blue-800'
                                                : project.status === 'in_progress'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {project.status.replace('_', ' ')}
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
