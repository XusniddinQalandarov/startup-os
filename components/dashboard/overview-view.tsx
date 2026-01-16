'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'
import type { IdeaEvaluation, Startup } from '@/types'
import { ScoreCard } from './score-card'

interface OverviewViewProps {
    project: Startup
    initialEvaluation: IdeaEvaluation | null
}

export function OverviewView({ project, initialEvaluation }: OverviewViewProps) {
    const [evaluation] = useState<IdeaEvaluation | null>(initialEvaluation)

    if (!evaluation) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Idea Evaluation</h1>
                    <p className="text-gray-600 mt-1">Get an honest assessment of your startup idea</p>
                </div>

                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Ready to evaluate</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Click the button below to generate an honest evaluation of your idea using AI.
                        </p>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Idea Evaluation</h1>
                    <p className="text-gray-600 mt-1">Honest assessment of your startup idea</p>
                </div>
            </div>

            <ScoreCard evaluation={evaluation} ideaType={project.idea_type} />
        </div>
    )
}
