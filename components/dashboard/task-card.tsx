import { cn } from '@/lib/utils'
import { formatEstimate, formatSkillTag } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskCardProps {
    task: Task
    isDragging?: boolean
    onEdit: (task: Task) => void
}

const skillTagColors: Record<string, string> = {
    frontend: 'bg-purple-100 text-purple-700',
    backend: 'bg-blue-100 text-blue-700',
    ai: 'bg-green-100 text-green-700',
    business: 'bg-amber-100 text-amber-700',
}

export function TaskCard({ task, isDragging, onEdit }: TaskCardProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-lg border border-gray-200 p-3',
                'cursor-grab active:cursor-grabbing',
                'shadow-sm hover:shadow-md transition-shadow',
                isDragging && 'opacity-50 shadow-lg rotate-2'
            )}
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                    {task.title}
                </h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit(task)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-0.5 flex-shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div>

            {task.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between gap-2">
                <span
                    className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        skillTagColors[task.skillTag] || 'bg-gray-100 text-gray-700'
                    )}
                >
                    {formatSkillTag(task.skillTag)}
                </span>
                <span className="text-xs text-gray-500">
                    {formatEstimate(task.estimateHours)}
                </span>
            </div>
        </div>
    )
}
