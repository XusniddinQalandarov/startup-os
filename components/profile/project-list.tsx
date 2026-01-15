'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Modal, Input } from '@/components/ui'
import { deleteProject } from '@/app/actions/projects'
import type { Startup } from '@/types'

interface ProjectListProps {
    projects: Startup[]
    isPremium?: boolean
}

export function ProjectList({ projects, isPremium = false }: ProjectListProps) {
    const [deletingProject, setDeletingProject] = useState<Startup | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deletingProject) return
        setIsDeleting(true)

        try {
            await deleteProject(deletingProject.id)
            setDeletingProject(null)
        } catch (error) {
            console.error('Failed to delete project:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No projects yet</h3>
                <p className="text-gray-500 text-xs mb-4">Launch your next big idea today</p>
                <Link href="/onboarding">
                    <Button variant="outline" size="sm">
                        Create Project
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {projects.map((project) => (
                    <div key={project.id} className="group relative">
                        <Link href={`/dashboard/${project.id}`} className="block">
                            <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                                <div className="flex-1 min-w-0 pr-12">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors mb-2">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate">{project.idea}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3 pl-4 border-l border-gray-50 min-w-[120px] pr-8">
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${project.status === 'evaluated'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : project.status === 'in_progress'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-gray-50 text-gray-500'
                                        }`}>
                                        {project.status === 'evaluated' ? 'Evaluated' : project.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-300">
                                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Delete button - Premium only - Moved to create more space and avoid overlap */}
                        {isPremium && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setDeletingProject(project)
                                }}
                                className="absolute right-4 top-4 p-2 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Delete project"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingProject}
                onClose={() => setDeletingProject(null)}
                title="Delete Project"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeletingProject(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            className="bg-red-500 hover:bg-red-600 text-white border-0"
                        >
                            Delete
                        </Button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <p className="text-gray-600">
                        Permanently delete <span className="font-medium text-gray-900">"{deletingProject?.name}"</span>?
                    </p>
                    <p className="text-sm text-gray-400 mt-2">This action cannot be undone.</p>
                </div>
            </Modal>
        </>
    )
}

interface EditProfileProps {
    displayName: string
    email: string
    isPremium: boolean
    memberSince: string
}

export function EditProfile({ displayName, email, isPremium, memberSince }: EditProfileProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(displayName)

    const initials = email?.slice(0, 2).toUpperCase() || 'U'

    return (
        <>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-2xl font-medium shadow-xl shadow-gray-200">
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{displayName}</h2>
                        <p className="text-gray-500 font-medium">{email}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-gray-400 hover:text-indigo-600 transition-colors px-3 py-1 hover:bg-indigo-50 rounded-lg"
                >
                    Edit Profile
                </button>
            </div>

            <div className="mt-8 flex items-center justify-between py-6 border-y border-gray-100">
                <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current Plan</span>
                    <span className={`text-lg font-bold ${isPremium ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {isPremium ? 'Premium Plan' : 'Free Plan'}
                    </span>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member Since</span>
                    <span className="text-lg font-medium text-gray-900">{memberSince.split(' ')[0]} {memberSince.split(' ')[2]}</span>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title="Edit Profile"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Display Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2 opacity-60">
                        <label className="text-sm font-medium text-gray-700">Email Address (Read-only)</label>
                        <input
                            value={email}
                            disabled
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>
            </Modal>
        </>
    )
}
