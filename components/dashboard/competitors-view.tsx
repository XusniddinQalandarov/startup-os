'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'
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
    const [error, setError] = useState<string | null>(null)
    const [comparisonOpen, setComparisonOpen] = useState(false)

    const handleAnalyze = async () => {
        setIsAnalyzing(true)
        setError(null)
        try {
            const result = await analyzeCompetitors(project.id, project.idea, project.targetUsers)
            if (result) {
                setAnalysis(result as CompetitorAnalysis)
            } else {
                setError('Analysis returned no data. Please try again.')
            }
        } catch (err) {
            console.error('Competitor analysis error:', err)
            setError('Analysis timed out or failed. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    if (!analysis) {
        return (
            <div className="space-y-6">
                <FullScreenLoader isLoading={isAnalyzing} message="Analyzing competitors and market landscape..." />

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Competitor Analysis</h1>
                    <p className="text-gray-500 mt-1">Discover who you&apos;re up against in the market</p>
                </div>

                <Card padding="lg" className="text-center border-gray-200 bg-white/50 backdrop-blur-sm">
                    <div className="py-12">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Analyze Competition</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            We&apos;ll search the web to find competitors and analyze their strengths and weaknesses using advanced AI.
                        </p>
                        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg shadow-indigo-200">
                            Start Analysis
                        </Button>
                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        )
    }

    // Heuristics for Stat Cards based on marketOverview
    const getMarketLandscape = (text: string) => {
        if (text.toLowerCase().includes('fragmented')) return 'Fragmented'
        if (text.toLowerCase().includes('consolidated') || text.toLowerCase().includes('dominated')) return 'Consolidated'
        if (text.toLowerCase().includes('emerging') || text.toLowerCase().includes('blue ocean')) return 'Emerging'
        return 'Competitive' // Default
    }

    const getEntryBarrier = (text: string) => {
        if (text.toLowerCase().includes('high barrier') || text.toLowerCase().includes('hard to enter')) return 'High'
        if (text.toLowerCase().includes('low barrier') || text.toLowerCase().includes('easy to enter')) return 'Low'
        return 'Medium' // Default
    }

    // Helper to extract bullets from description
    const getBullets = (text: string) => {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
        return sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 5)
    }

    return (
        <div className="space-y-8">
            <FullScreenLoader isLoading={isAnalyzing} message="Refreshing competitor analysis..." />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Market Intelligence</h1>
                    <p className="text-gray-500 text-sm mt-1">{analysis.competitors.length} active competitors identified</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50"
                    title="Refresh Analysis"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Market Insights - Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Market Landscape</div>
                    <div className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        {getMarketLandscape(analysis.marketOverview)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Structure</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ease of Entry</div>
                    <div className="text-2xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        {getEntryBarrier(analysis.marketOverview)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Barrier Level</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Growth Driver</div>
                    <div className="text-lg font-bold text-gray-900 truncate" title="SaaS Adoption">
                        SaaS Adoption
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Primary Trend</div>
                </div>
            </div>

            {/* Competitors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.competitors.map((competitor, index) => {
                    const domain = competitor.website ? new URL(competitor.website).hostname.replace('www.', '') : 'domain.com'
                    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                    const isDirect = index < 2 // Naive heuristic for now

                    return (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col overflow-hidden"
                        >
                            <div className="p-6 flex-1">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center">
                                        {/* Fallback to first letter if favicon fails/not ideal, but using img here */}
                                        <img src={favicon} alt={competitor.name} className="w-6 h-6 object-contain opacity-80"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <span className="hidden text-sm font-bold text-gray-400">{competitor.name.charAt(0)}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${isDirect
                                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {isDirect ? 'Direct' : 'Indirect'}
                                    </span>
                                </div>

                                {/* Title */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                        <a href={competitor.website || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                            {competitor.name}
                                            <svg className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </h3>
                                    <p className="text-xs text-indigo-500/80 font-medium truncate">{competitor.website?.replace('https://', '') || 'No website'}</p>
                                </div>

                                {/* Bullets */}
                                <ul className="space-y-1.5 mb-6">
                                    {getBullets(competitor.description).map((bullet, i) => (
                                        <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5 leading-relaxed">
                                            <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>

                                {/* Pros & Cons */}
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="space-y-1.5">
                                        {competitor.strengths.slice(0, 2).map((s, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                </div>
                                                <span className="text-xs text-gray-600 leading-tight">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-1.5">
                                        {competitor.weaknesses.slice(0, 2).map((w, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <svg className="w-2.5 h-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                                                </div>
                                                <span className="text-xs text-gray-600 leading-tight">{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer (Optional stats or price) */}
                            {competitor.pricing && (
                                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-medium">Pricing</span>
                                    <span className="text-gray-700 font-semibold">{competitor.pricing.split(' ')[0]}...</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>



            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">Want deeper insights?</h3>
                    <p className="text-xs text-gray-500 mt-1">Get detailed side-by-side comparison for all competitors.</p>
                </div>
                <Button
                    variant="outline"
                    className="text-gray-700 hover:text-indigo-600 hover:border-indigo-200"
                    onClick={() => setComparisonOpen(true)}
                >
                    Compare More
                </Button>
            </div>

            {/* Comparison Modal */}
            {comparisonOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-white/20 animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative z-20">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Strategic Comparison Matrix</h2>
                                <p className="text-sm text-gray-500 mt-1">Side-by-side analysis of market position and capabilities</p>
                            </div>
                            <button
                                onClick={() => setComparisonOpen(false)}
                                className="group p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 border border-transparent hover:border-gray-200"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-auto flex-1 bg-gray-50/30 scrollbar-hide">
                            <table className="w-full min-w-[800px] border-collapse">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 left-0 z-30 w-52 p-6 text-left bg-gray-50/95 backdrop-blur-sm border-b border-r border-gray-100/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dimensions</span>
                                        </th>
                                        {analysis.competitors.map((c, i) => {
                                            const domain = c.website ? new URL(c.website).hostname.replace('www.', '') : 'domain.com'
                                            const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                                            return (
                                                <th key={i} className="sticky top-0 z-20 w-80 p-6 text-left bg-white/95 backdrop-blur-sm border-b border-gray-100 border-r border-gray-50 last:border-r-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                                                            <img src={favicon} alt={c.name} className="w-5 h-5 object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                            <span className="hidden text-xs font-bold text-gray-400">{c.name.charAt(0)}</span>
                                                        </div>
                                                        <div className="font-bold text-gray-900 text-base">{c.name}</div>
                                                    </div>
                                                    <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 group">
                                                        {c.website?.replace('https://', '').replace(/\/$/, '')}
                                                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {/* Market Share */}
                                    <tr className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="sticky left-0 z-10 p-6 bg-white group-hover:bg-gray-50/50 border-r border-gray-100 align-top">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Market Position
                                            </div>
                                        </td>
                                        {analysis.competitors.map((c, i) => (
                                            <td key={i} className="p-6 align-top border-r border-gray-50 last:border-r-0">
                                                <span className="text-sm text-gray-700 leading-relaxed">
                                                    {c.marketShare || 'N/A'}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Pricing */}
                                    <tr className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="sticky left-0 z-10 p-6 bg-white group-hover:bg-gray-50/50 border-r border-gray-100 align-top">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Pricing Strategy
                                            </div>
                                        </td>
                                        {analysis.competitors.map((c, i) => (
                                            <td key={i} className="p-6 align-top border-r border-gray-50 last:border-r-0">
                                                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                                    {c.pricing || 'Contact for pricing'}
                                                </p>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Strengths */}
                                    <tr className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="sticky left-0 z-10 p-6 bg-white group-hover:bg-gray-50/50 border-r border-gray-100 align-top">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Core Strengths
                                            </div>
                                        </td>
                                        {analysis.competitors.map((c, i) => (
                                            <td key={i} className="p-6 align-top border-r border-gray-50 last:border-r-0">
                                                <div className="space-y-3">
                                                    {c.strengths.map((s, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm text-gray-600 group/item">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                            <span className="leading-snug">{s}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Weaknesses */}
                                    <tr className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="sticky left-0 z-10 p-6 bg-white group-hover:bg-gray-50/50 border-r border-gray-100 align-top">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Critical Weaknesses
                                            </div>
                                        </td>
                                        {analysis.competitors.map((c, i) => (
                                            <td key={i} className="p-6 align-top border-r border-gray-50 last:border-r-0">
                                                <div className="space-y-3">
                                                    {c.weaknesses.map((w, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm text-gray-600">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                            <span className="leading-snug">{w}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 backdrop-blur-xl relative z-20">
                            <Button
                                variant="secondary"
                                onClick={() => setComparisonOpen(false)}
                                className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                                Close View
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
