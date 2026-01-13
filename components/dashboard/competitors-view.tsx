'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { analyzeCompetitors } from '@/app/actions/ai'
import type { Startup } from '@/types'

interface Competitor {
    name: string
    website?: string
    description: string
    strengths: string[]
    weaknesses: string[]
    pricing?: string
    marketShare?: string
}

interface CompetitorAnalysis {
    competitors: Competitor[]
    marketOverview: string
    opportunities: string[]
    threats: string[]
    sources: { title: string; url: string }[]
}

interface CompetitorsViewProps {
    project: Startup
    initialAnalysis: CompetitorAnalysis | null
}

export function CompetitorsView({ project, initialAnalysis }: CompetitorsViewProps) {
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(initialAnalysis)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        setIsAnalyzing(true)
        setError(null)
        try {
            console.log('Starting competitor analysis...')
            const result = await analyzeCompetitors(project.id, project.idea, project.targetUsers)
            console.log('Competitor analysis result:', result)
            if (result) {
                setAnalysis(result as CompetitorAnalysis)
            } else {
                setError('Analysis returned no data. Please try again.')
            }
        } catch (err) {
            console.error('Competitor analysis error:', err)
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            setError(`Error: ${errorMessage}`)
        } finally {
            setIsAnalyzing(false)
        }
    }

    if (!analysis) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Competitor Analysis</h1>
                    <p className="text-gray-500 mt-1">Discover who you&apos;re up against in the market</p>
                </div>

                <Card padding="lg" className="text-center border-gray-200">
                    <div className="py-8">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Analyze Competition</h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                            We&apos;ll search the web to find competitors and analyze their strengths and weaknesses.
                        </p>
                        <Button onClick={handleAnalyze} isLoading={isAnalyzing}>
                            {isAnalyzing ? 'Searching...' : 'Analyze Competitors'}
                        </Button>
                        {isAnalyzing && (
                            <p className="text-sm text-gray-400 mt-4">
                                Searching the web... This may take 30-60 seconds.
                            </p>
                        )}
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Competitor Analysis</h1>
                    <p className="text-gray-500 mt-1">{analysis.competitors.length} competitors found</p>
                </div>
                <Button variant="secondary" onClick={handleAnalyze} isLoading={isAnalyzing}>
                    Refresh
                </Button>
            </div>

            {/* Market Overview */}
            <Card padding="md" className="border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h2 className="font-semibold text-gray-900">Market Overview</h2>
                </div>
                <p className="text-gray-600">{analysis.marketOverview}</p>
            </Card>

            {/* Competitors Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Competitors</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {analysis.competitors.map((competitor, index) => (
                        <Card
                            key={index}
                            padding="none"
                            className="border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => setExpandedCompetitor(
                                expandedCompetitor === competitor.name ? null : competitor.name
                            )}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{competitor.name}</h3>
                                        {competitor.website && (
                                            <a
                                                href={competitor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-sm text-indigo-600 hover:underline"
                                            >
                                                {competitor.website}
                                            </a>
                                        )}
                                    </div>
                                    {competitor.marketShare && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {competitor.marketShare}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm mt-2">{competitor.description}</p>

                                {expandedCompetitor === competitor.name && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Strengths
                                                </h4>
                                                <ul className="space-y-1">
                                                    {competitor.strengths.map((s, i) => (
                                                        <li key={i} className="text-sm text-gray-600">• {s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Weaknesses
                                                </h4>
                                                <ul className="space-y-1">
                                                    {competitor.weaknesses.map((w, i) => (
                                                        <li key={i} className="text-sm text-gray-600">• {w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        {competitor.pricing && (
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">Pricing: </span>
                                                <span className="text-gray-600">{competitor.pricing}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Opportunities & Threats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card padding="md" className="border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Opportunities
                    </h3>
                    <ul className="space-y-2">
                        {analysis.opportunities.map((opp, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {opp}
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card padding="md" className="border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Threats
                    </h3>
                    <ul className="space-y-2">
                        {analysis.threats.map((threat, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                {threat}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Sources */}
            {analysis.sources && analysis.sources.length > 0 && (
                <Card padding="md" className="border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Sources
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {analysis.sources.map((source, i) => (
                            <a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm bg-white border border-gray-200 px-3 py-1.5 rounded text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors truncate max-w-xs"
                            >
                                {source.title}
                            </a>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
