import { TasksView } from '@/components/dashboard/tasks-view'
import { getProject } from '@/app/actions/projects'
import { getTasks } from '@/app/actions/tasks'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ projectId: string }>
}

export default async function TasksPage({ params }: PageProps) {
    const { projectId } = await params

    const [project, tasks] = await Promise.all([
        getProject(projectId),
        getTasks(projectId)
    ])

    if (!project) {
        notFound()
    }

    return (
        <TasksView
            project={project}
            initialTasks={tasks}
        />
    )
}
