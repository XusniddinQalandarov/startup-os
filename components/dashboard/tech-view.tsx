'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { generateTechStack } from '@/app/actions/ai'
import { TechStackRecommendation, Startup } from '@/types'
import Image from 'next/image'

interface TechViewProps {
    project: Startup
    initialStack: TechStackRecommendation[] | null
}

// Category icons - these will be replaced with database images
// When you add images to DB, pass them as part of the TechStackRecommendation
const categoryImages: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
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

export function TechView({ project, initialStack }: TechViewProps) {
    const [stack, setStack] = useState<TechStackRecommendation[] | null>(initialStack)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await generateTechStack(project.id, project.idea, project.founderType)
        if (result) {
            setStack(result)
        }
        setIsGenerating(false)
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

    // Group by category
    const groupedStack = stack.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, TechStackRecommendation[]>)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tech Stack</h1>
                    <p className="text-gray-600 mt-1">Recommended technologies for your startup</p>
                </div>
                <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                    Regenerate
                </Button>
            </div>

            {/* Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedStack).map(([category, items]) => {
                    const categoryConfig = categoryImages[category] || defaultCategory

                    return items.map((item, index) => (
                        <Card
                            key={`${category}-${index}`}
                            padding="md"
                            className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Category Icon/Image */}
                                <div className={`p-3 rounded-xl ${categoryConfig.bgColor} ${categoryConfig.color} group-hover:scale-110 transition-transform`}>
                                    {categoryConfig.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Category Tag */}
                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${categoryConfig.bgColor} ${categoryConfig.color}`}>
                                        {category}
                                    </span>

                                    {/* Recommendation */}
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {item.recommendation}
                                    </h3>

                                    {/* Reason */}
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {item.reason}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                })}
            </div>

            {/* Legend */}
            <Card padding="md" className="border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {Object.entries(categoryImages).map(([category, config]) => (
                        <div key={category} className="flex flex-col items-center gap-2 text-center">
                            <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                                {config.icon}
                            </div>
                            <span className="text-xs text-gray-600">{category}</span>
                        </div>
                    ))}
                </div>
            </Card>

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
        </div>
    )
}
