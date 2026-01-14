'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { generateCustomerQuestions } from '@/app/actions/ai'
import type { CustomerQuestion, Startup } from '@/types'

interface QuestionsViewProps {
    project: Startup
    initialQuestions: CustomerQuestion[] | null
}

export function QuestionsView({ project, initialQuestions }: QuestionsViewProps) {
    const [questions, setQuestions] = useState<CustomerQuestion[] | null>(initialQuestions)
    // const [isGenerating, setIsGenerating] = useState(false) // Removed
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // handleGenerate removed - handled by parent

    const handleCopy = async (question: string, id: string) => {
        await navigator.clipboard.writeText(question)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (!questions) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Customer Questions</h1>
                    <p className="text-gray-500 mt-1">Validate your idea with the right questions</p>
                </div>

                <Card padding="lg" className="text-center border-gray-200">
                    <div className="py-8">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Generate Interview Questions</h2>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                            AI will generate questions to ask and questions to avoid.
                        </p>
                        {/* Parent handles generation */}
                    </div>
                </Card>
            </div>
        )
    }

    // Safety check for array
    const safeQuestions = Array.isArray(questions) ? questions : (questions as any)?.questions || []

    if (!Array.isArray(safeQuestions) || safeQuestions.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                No questions generated yet.
            </div>
        )
    }

    // Split into ask vs avoid
    const askQuestions = safeQuestions.filter((q: CustomerQuestion) => q.flagType === 'ask')
    const avoidQuestions = safeQuestions.filter((q: CustomerQuestion) => q.flagType === 'avoid')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Customer Questions</h1>
                    <p className="text-gray-500 mt-1">{safeQuestions.length} questions generated</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Ask These - subtle green accent */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <h2 className="font-semibold text-gray-900">Questions to Ask</h2>
                        <span className="text-xs text-gray-400">{askQuestions.length}</span>
                    </div>
                    <div className="space-y-2">
                        {askQuestions.map((q) => (
                            <Card
                                key={q.id}
                                padding="none"
                                className="border-gray-200 hover:border-green-200 transition-colors cursor-pointer"
                                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <span className="text-xs text-gray-400 uppercase tracking-wide">
                                                {q.category}
                                            </span>
                                            <p className="text-gray-900 mt-1">{q.question}</p>
                                            {expandedId === q.id && q.insight && (
                                                <p className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded">
                                                    💡 {q.insight}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleCopy(q.question, q.id)
                                            }}
                                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {copiedId === q.id ? (
                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Avoid These - subtle red accent */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        <h2 className="font-semibold text-gray-600">Questions to Avoid</h2>
                        <span className="text-xs text-gray-400">{avoidQuestions.length}</span>
                    </div>
                    <div className="space-y-2">
                        {avoidQuestions.map((q) => (
                            <Card
                                key={q.id}
                                padding="none"
                                className="border-gray-100 bg-gray-50/50 hover:border-red-100 transition-colors cursor-pointer"
                                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            >
                                <div className="p-4">
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-400 uppercase tracking-wide">
                                            {q.category}
                                        </span>
                                        <p className="text-gray-500 mt-1">{q.question}</p>
                                        {expandedId === q.id && q.insight && (
                                            <p className="mt-3 text-sm text-red-700 bg-red-50 p-2 rounded">
                                                ⚠️ {q.insight}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tips */}
            <Card padding="md" className="bg-gray-50 border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm mb-2">The Mom Test Tips</h3>
                <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Talk about their life, not your idea</li>
                    <li>• Ask about the past, not hypothetical futures</li>
                    <li>• If they haven&apos;t looked for a solution, the problem isn&apos;t real enough</li>
                </ul>
            </Card>
        </div>
    )
}
