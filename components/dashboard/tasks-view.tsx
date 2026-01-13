'use client'

import { useState } from 'react'
import { Button, Modal, Input, Textarea } from '@/components/ui'
import { TaskBoard } from '@/components/dashboard'
import { updateTaskStatus, updateTask as updateTaskAction, createTask, getTasks } from '@/app/actions/tasks'
import { generateTasks } from '@/app/actions/ai'
import { formatEstimate } from '@/lib/utils'
import type { Task, TaskStatus, Startup } from '@/types'

interface TasksViewProps {
    project: Startup
    initialTasks: Task[]
}

const defaultNewTask = {
    title: '',
    description: '',
    estimateHours: 4,
    skillTag: 'frontend' as Task['skillTag'],
    status: 'backlog' as TaskStatus,
}

export function TasksView({ project, initialTasks }: TasksViewProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [newTask, setNewTask] = useState(defaultNewTask)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        await generateTasks(project.id, project.idea)
        const tasksData = await getTasks(project.id)
        setTasks(tasksData)
        setIsGenerating(false)
    }

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        // Optimistic update
        setTasks(prev =>
            prev.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        )
        // Persist to database
        await updateTaskStatus(taskId, newStatus)
    }

    const handleTaskEdit = (task: Task) => {
        setEditingTask({ ...task })
    }

    const handleSaveEdit = async () => {
        if (!editingTask) return
        setIsSaving(true)

        // Optimistic update
        setTasks(prev =>
            prev.map(task => (task.id === editingTask.id ? editingTask : task))
        )

        // Persist to database
        await updateTaskAction(editingTask.id, {
            title: editingTask.title,
            description: editingTask.description,
            status: editingTask.status,
            estimateHours: editingTask.estimateHours,
            skillTag: editingTask.skillTag,
        })

        setIsSaving(false)
        setEditingTask(null)
    }

    const handleAddTask = (status: TaskStatus) => {
        setNewTask({ ...defaultNewTask, status })
        setIsCreating(true)
    }

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) return
        setIsSaving(true)

        const created = await createTask(project.id, {
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            estimateHours: newTask.estimateHours,
            skillTag: newTask.skillTag,
            position: tasks.length,
        })

        if (created) {
            setTasks(prev => [...prev, created])
        }

        setIsSaving(false)
        setIsCreating(false)
        setNewTask(defaultNewTask)
    }

    const totalHours = tasks.reduce((sum, t) => sum + t.estimateHours, 0)
    const doneHours = tasks
        .filter(t => t.status === 'done')
        .reduce((sum, t) => sum + t.estimateHours, 0)

    if (tasks.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Task Board</h1>
                    <p className="text-gray-600 mt-1">Manage your development tasks</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Get Started with Tasks</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Generate AI-powered tasks or create your own manually.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </Button>
                        <Button variant="secondary" onClick={() => handleAddTask('backlog')}>
                            Create Manually
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Task Board</h1>
                    <p className="text-gray-600 mt-1">
                        Drag tasks between columns to update status
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="font-medium text-gray-900">
                            {formatEstimate(doneHours)} / {formatEstimate(totalHours)} completed
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => handleAddTask('backlog')}>
                        + Add Task
                    </Button>
                    <Button variant="ghost" onClick={handleGenerate} isLoading={isGenerating}>
                        AI Generate
                    </Button>
                </div>
            </div>

            {/* Task Board */}
            <TaskBoard
                tasks={tasks}
                onTaskMove={handleTaskMove}
                onTaskEdit={handleTaskEdit}
                onAddTask={handleAddTask}
            />

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                title="Edit Task"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditingTask(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} isLoading={isSaving}>Save</Button>
                    </>
                }
            >
                {editingTask && (
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        />
                        <Textarea
                            label="Description"
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Estimate (hours)"
                                type="number"
                                value={editingTask.estimateHours}
                                onChange={(e) => setEditingTask({ ...editingTask, estimateHours: parseInt(e.target.value) || 0 })}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Tag</label>
                                <select
                                    value={editingTask.skillTag}
                                    onChange={(e) => setEditingTask({ ...editingTask, skillTag: e.target.value as Task['skillTag'] })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="frontend">Frontend</option>
                                    <option value="backend">Backend</option>
                                    <option value="ai">AI</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={editingTask.status}
                                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="backlog">Backlog</option>
                                <option value="in_progress">In Progress</option>
                                <option value="blocked">Blocked</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create Modal */}
            <Modal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                title="Create New Task"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button onClick={handleCreateTask} isLoading={isSaving} disabled={!newTask.title.trim()}>
                            Create Task
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Title"
                        placeholder="Enter task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <Textarea
                        label="Description"
                        placeholder="Describe what needs to be done..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Estimate (hours)"
                            type="number"
                            value={newTask.estimateHours}
                            onChange={(e) => setNewTask({ ...newTask, estimateHours: parseInt(e.target.value) || 0 })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Tag</label>
                            <select
                                value={newTask.skillTag}
                                onChange={(e) => setNewTask({ ...newTask, skillTag: e.target.value as Task['skillTag'] })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                                <option value="ai">AI</option>
                                <option value="business">Business</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                        <select
                            value={newTask.status}
                            onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="backlog">Backlog</option>
                            <option value="in_progress">In Progress</option>
                            <option value="blocked">Blocked</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
