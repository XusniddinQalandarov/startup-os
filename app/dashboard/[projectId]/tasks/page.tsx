import { TasksView } from '@/components/dashboard/tasks-view'
import { getProject } from '@/app/actions/projects'
import { getTasks } from '@/app/actions/tasks'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

// EXECUTION STAGE: Tasks
export default async function ExecutionStagePage({ params }: PageProps) {
    const { projectId } = await params

    const [project, tasks] = await Promise.all([
        getProject(projectId),
        getTasks(projectId)
    ])

    if (!project) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Stage Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Execution</h1>
                    <p className="text-sm text-gray-500">What do I do today?</p>
                </div>
            </div>

            {/* Tasks */}
            <TasksView
                project={project}
                initialTasks={tasks}
            />
        </div>
    )
}
