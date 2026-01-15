'use client'

import { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { TaskCard } from './task-card'
import type { Task, TaskStatus } from '@/types'

interface TaskBoardProps {
    tasks: Task[]
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void
    onTaskEdit: (task: Task) => void
    onAddTask?: (status: TaskStatus) => void
}

const columns: { id: TaskStatus; title: string; color: string; activeColor: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-50', activeColor: 'bg-gray-100 ring-2 ring-gray-300' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50', activeColor: 'bg-blue-100 ring-2 ring-blue-300' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-50', activeColor: 'bg-red-100 ring-2 ring-red-300' },
    { id: 'done', title: 'Done', color: 'bg-green-50', activeColor: 'bg-green-100 ring-2 ring-green-300' },
]

interface SortableTaskProps {
    task: Task
    onEdit: (task: Task) => void
}

function SortableTask({ task, onEdit }: SortableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1000 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} isDragging={isDragging} onEdit={onEdit} />
        </div>
    )
}

interface DroppableColumnProps {
    column: typeof columns[0]
    tasks: Task[]
    onTaskEdit: (task: Task) => void
    onAddTask?: (status: TaskStatus) => void
    isActive: boolean
}

function DroppableColumn({ column, tasks, onTaskEdit, onAddTask, isActive }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    })

    const taskIds = tasks.map(t => t.id)

    return (
        <div className="flex flex-col flex-1 min-w-[280px] lg:min-w-0">
            <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-semibold text-gray-900">{column.title}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                        {tasks.length}
                    </span>
                    {onAddTask && (
                        <button
                            onClick={() => onAddTask(column.id)}
                            className="w-7 h-7 rounded-full bg-white shadow-sm hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-gray-400 transition-all hover:shadow-md"
                            title={`Add task to ${column.title}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Droppable Area - Scrollable with max height, invisible scrollbar */}
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-1 rounded-xl p-3 max-h-[calc(100vh-340px)] min-h-140 overflow-y-auto overflow-x-hidden no-scrollbar transition-all duration-150 border-2',
                    isOver || isActive
                        ? `${column.activeColor} border-dashed border-current shadow-inner`
                        : `${column.color} border-transparent`
                )}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-full">
                        {tasks.map(task => (
                            <SortableTask key={task.id} task={task} onEdit={onTaskEdit} />
                        ))}
                        {tasks.length === 0 && (
                            <div className={cn(
                                "flex items-center justify-center h-32 rounded-lg border-2 border-dashed transition-colors",
                                isOver || isActive
                                    ? "border-current bg-white/50 text-gray-600"
                                    : "border-gray-200 text-gray-400"
                            )}>
                                <span className="text-sm italic">
                                    {isOver ? 'Drop here!' : 'Drop tasks here'}
                                </span>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    )
}

export function TaskBoard({ tasks, onTaskMove, onTaskEdit, onAddTask }: TaskBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // Very low threshold for immediate response
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id)
        if (task) {
            setActiveTask(task)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event
        if (!over) {
            setActiveColumn(null)
            return
        }

        // Check if over a column
        const overColumn = columns.find(c => c.id === over.id)
        if (overColumn) {
            setActiveColumn(overColumn.id)
            return
        }

        // Check if over a task - get its column
        const overTask = tasks.find(t => t.id === over.id)
        if (overTask) {
            setActiveColumn(overTask.status)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        setActiveColumn(null)

        if (!over) return

        const draggedTask = tasks.find(t => t.id === active.id)
        if (!draggedTask) return

        // Check if dropped over a column directly
        const overColumn = columns.find(c => c.id === over.id)
        if (overColumn && draggedTask.status !== overColumn.id) {
            onTaskMove(draggedTask.id, overColumn.id)
            return
        }

        // Check if dropped over another task
        const overTask = tasks.find(t => t.id === over.id)
        if (overTask && draggedTask.status !== overTask.status) {
            onTaskMove(draggedTask.id, overTask.status)
        }
    }

    const getTasksByStatus = (status: TaskStatus) =>
        tasks.filter(t => t.status === status)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection} // More accurate collision detection
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-x-visible pb-4">
                {columns.map(column => (
                    <DroppableColumn
                        key={column.id}
                        column={column}
                        tasks={getTasksByStatus(column.id)}
                        onTaskEdit={onTaskEdit}
                        onAddTask={onAddTask}
                        isActive={activeColumn === column.id}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeTask && (
                    <div className="rotate-2 scale-105 shadow-2xl opacity-90">
                        <TaskCard task={activeTask} isDragging onEdit={() => { }} />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}
