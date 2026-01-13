'use client'

import { useState } from 'react'
import { Card, Progress, Button } from '@/components/ui'
import { evaluateIdea } from '@/app/actions/ai'
import type { IdeaEvaluation, Startup } from '@/types'
import { cn } from '@/lib/utils'

const scoreLabels: Record<string, string> = {
    marketPotential: 'Market Potential',
    feasibility: 'Feasibility',
    competition: 'Competition Level',
    uniqueness: 'Uniqueness',
}

const scoreDescriptions: Record<string, string> = {
    marketPotential: 'Size and growth of the target market',
    feasibility: 'Technical and operational viability',
    competition: 'Level of existing competition (lower is easier)',
    uniqueness: 'How differentiated the solution is',
}

const scoreIcons: Record<string, React.ReactNode> = {
    marketPotential: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    feasibility: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    competition: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    uniqueness: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
}

function getOverallScore(scores: IdeaEvaluation['scores']): number {
    const values = Object.values(scores)
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function getScoreGrade(score: number): { grade: string; color: string; bgColor: string; message: string } {
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-500', message: 'Excellent potential!' }
    if (score >= 65) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-500', message: 'Strong idea with room to improve' }
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-500', message: 'Decent but needs work' }
    if (score >= 35) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-500', message: 'Significant challenges ahead' }
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-500', message: 'Needs major rethinking' }
}

interface OverviewViewProps {
    project: Startup
    initialEvaluation: IdeaEvaluation | null
}

export function OverviewView({ project, initialEvaluation }: OverviewViewProps) {
    const [evaluation, setEvaluation] = useState<IdeaEvaluation | null>(initialEvaluation)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await evaluateIdea(project.id, {
            idea: project.idea,
            targetUsers: project.targetUsers,
            businessType: project.businessType,
            geography: project.geography,
            founderType: project.founderType,
        })
        if (result) {
            setEvaluation(result)
        }
        setIsGenerating(false)
    }

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
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Analyzing...' : 'Generate Evaluation'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    const scores = Object.entries(evaluation.scores) as [string, number][]
    const overallScore = getOverallScore(evaluation.scores)
    const gradeInfo = getScoreGrade(overallScore)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Idea Evaluation</h1>
                    <p className="text-gray-600 mt-1">Honest assessment of your startup idea</p>
                </div>
                <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                    Regenerate
                </Button>
            </div>

            {/* Overall Score Card */}
            <Card padding="lg" className="bg-linear-to-br from-indigo-50 via-white to-purple-50 border-indigo-100">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Score Circle */}
                    <div className="relative">
                        <div className={cn(
                            "w-32 h-32 rounded-full flex items-center justify-center shadow-lg",
                            gradeInfo.bgColor
                        )}>
                            <div className="text-center text-white">
                                <div className="text-4xl font-bold">{overallScore}</div>
                                <div className="text-sm opacity-90">out of 100</div>
                            </div>
                        </div>
                        <div className={cn(
                            "absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-bold border-4",
                            gradeInfo.color,
                            `border-current`
                        )}>
                            {gradeInfo.grade}
                        </div>
                    </div>

                    {/* Verdict */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className={cn("text-2xl font-bold mb-2", gradeInfo.color)}>
                            {gradeInfo.message}
                        </h2>
                        <p className="text-xl font-medium text-gray-900 mb-2">{evaluation.verdict}</p>
                        <p className="text-gray-600 leading-relaxed">{evaluation.explanation}</p>
                    </div>
                </div>
            </Card>

            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scores.map(([key, value]) => (
                    <Card key={key} padding="md" className="hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-2 rounded-lg",
                                value >= 70 ? "bg-green-100 text-green-600" :
                                    value >= 50 ? "bg-yellow-100 text-yellow-600" :
                                        "bg-red-100 text-red-600"
                            )}>
                                {scoreIcons[key]}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{scoreLabels[key]}</h3>
                                        <p className="text-xs text-gray-500">{scoreDescriptions[key]}</p>
                                    </div>
                                    <span className={cn(
                                        "text-2xl font-bold",
                                        value >= 70 ? "text-green-600" :
                                            value >= 50 ? "text-yellow-600" :
                                                "text-red-600"
                                    )}>
                                        {value}
                                    </span>
                                </div>
                                <Progress value={value} size="md" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Warning Box */}
            <Card padding="md" className="border-amber-200 bg-amber-50">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h3 className="font-medium text-amber-800">Honest Assessment</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            These scores are meant to give you a realistic view. A low score doesn&apos;t mean you should give up —
                            it means you should focus on addressing those weaknesses before investing heavily.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
