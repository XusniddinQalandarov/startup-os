'use client'

import { useState } from 'react'
import { Card, Button, Modal, Input, Textarea } from '@/components/ui'
import { generateTechStack } from '@/app/actions/ai'
import { TechStackRecommendation, Startup } from '@/types'

interface TechViewProps {
    project: Startup
    initialStack: TechStackRecommendation[] | null
}

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    Frontend: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    Backend: {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
        ),
    },
    Database: {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
        ),
    },
    Hosting: {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        ),
    },
    'AI/ML': {
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    Payments: {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    },
    Analytics: {
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
}

const defaultCategory = {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
}

const categories = ['Frontend', 'Backend', 'Database', 'Hosting', 'AI/ML', 'Payments', 'Analytics']

export function TechView({ project, initialStack }: TechViewProps) {
    const [stack, setStack] = useState<TechStackRecommendation[] | null>(initialStack)
    const [isGenerating, setIsGenerating] = useState(false)
    const [editingItem, setEditingItem] = useState<TechStackRecommendation | null>(null)
    const [editIndex, setEditIndex] = useState<number>(-1)

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await generateTechStack(project.id, project.idea, project.founderType)
        if (result) {
            setStack(result)
        }
        setIsGenerating(false)
    }

    const handleEdit = (item: TechStackRecommendation, index: number) => {
        setEditingItem({ ...item })
        setEditIndex(index)
    }

    const handleSaveEdit = () => {
        if (!editingItem || !stack) return

        const updatedStack = [...stack]
        updatedStack[editIndex] = editingItem
        setStack(updatedStack)
        setEditingItem(null)
        setEditIndex(-1)
        // TODO: Save to database when API is ready
    }

    if (!stack) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tech Stack</h1>
                    <p className="text-gray-600 mt-1">Recommended technologies for your startup</p>
                </div>

                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Get Tech Recommendations</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            AI will recommend the best stack based on your product needs and team skills.
                        </p>
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Analyzing...' : 'Recommend Stack'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tech Stack</h1>
                    <p className="text-gray-600 mt-1">Click any card to edit recommendations</p>
                </div>
                <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                    Regenerate
                </Button>
            </div>

            {/* Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stack.map((item, index) => {
                    const config = categoryConfig[item.category] || defaultCategory

                    return (
                        <Card
                            key={`${item.category}-${index}`}
                            padding="lg"
                            className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group cursor-pointer"
                            onClick={() => handleEdit(item, index)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Category Icon */}
                                <div className={`p-3 rounded-xl ${config.bgColor} ${config.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                                    {config.icon}
                                </div>

                                <div className="flex-1">
                                    {/* Category Tag */}
                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${config.bgColor} ${config.color}`}>
                                        {item.category}
                                    </span>

                                    {/* Recommendation */}
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {item.recommendation}
                                    </h3>

                                    {/* Reason */}
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                        {item.reason}
                                    </p>
                                </div>

                                {/* Edit indicator */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Tip */}
            <Card padding="md" className="border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Tech Stack Philosophy</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Choose boring technology. Use proven tools that you know well.
                            Your competitive advantage is in your product, not your stack.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                title="Edit Tech Recommendation"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </>
                }
            >
                {editingItem && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={editingItem.category}
                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Technology/Tool"
                            value={editingItem.recommendation}
                            onChange={(e) => setEditingItem({ ...editingItem, recommendation: e.target.value })}
                            placeholder="e.g., Next.js 14, PostgreSQL, Stripe"
                        />
                        <Textarea
                            label="Reason"
                            value={editingItem.reason}
                            onChange={(e) => setEditingItem({ ...editingItem, reason: e.target.value })}
                            placeholder="Why is this technology recommended?"
                            rows={3}
                        />
                    </div>
                )}
            </Modal>
        </div>
    )
}
