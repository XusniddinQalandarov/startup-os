'use client'

import { useState } from 'react'
import { Card, Button, Modal } from '@/components/ui'
import { generateProjectAnalysis } from '@/app/actions/ai'
import type { Startup } from '@/types'

interface AnalysisSection {
    id: string
    title: string
    content: string
    editable?: boolean
}

interface ProjectAnalysisData {
    problemStatement: AnalysisSection
    targetAudience: AnalysisSection
    valueProposition: AnalysisSection
    tam: AnalysisSection
    sam: AnalysisSection
    som: AnalysisSection
    businessModel: AnalysisSection
    keyMetrics: AnalysisSection
    unfairAdvantage: AnalysisSection
    channels: AnalysisSection
}

interface AnalysisViewProps {
    project: Startup
    initialAnalysis: ProjectAnalysisData | null
}

// SVG Icons for each section
const sectionIcons: Record<string, React.ReactNode> = {
    problemStatement: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    targetAudience: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    valueProposition: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    tam: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    sam: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    som: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    businessModel: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    keyMetrics: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    unfairAdvantage: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    channels: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
    ),
}

const sectionLabels: Record<string, string> = {
    problemStatement: 'Problem Statement',
    targetAudience: 'Target Audience',
    valueProposition: 'Value Proposition',
    tam: 'TAM (Total Market)',
    sam: 'SAM (Serviceable Market)',
    som: 'SOM (Obtainable Market)',
    businessModel: 'Business Model',
    keyMetrics: 'Key Metrics',
    unfairAdvantage: 'Unfair Advantage',
    channels: 'Distribution Channels',
}

export function AnalysisView({ project, initialAnalysis }: AnalysisViewProps) {
    const [analysis, setAnalysis] = useState<ProjectAnalysisData | null>(initialAnalysis)
    const [isGenerating, setIsGenerating] = useState(false)
    const [editingSection, setEditingSection] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'business' | 'execution'>('overview')

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await generateProjectAnalysis(project.id, project.idea, project.targetUsers, project.businessType)
        if (result) {
            setAnalysis(result as ProjectAnalysisData)
        }
        setIsGenerating(false)
    }

    const handleEdit = (sectionId: string, currentContent: string) => {
        setEditingSection(sectionId)
        setEditValue(currentContent)
    }

    const handleSaveEdit = () => {
        if (!analysis || !editingSection) return

        setAnalysis({
            ...analysis,
            [editingSection]: {
                ...analysis[editingSection as keyof ProjectAnalysisData],
                content: editValue,
            },
        })
        setEditingSection(null)
        setEditValue('')
    }

    // Helper to format text with bold and lists
    const formatContent = (text: string) => {
        if (!text) return null

        // Clean up the text
        const cleanedText = text.trim()
        
        // Split into paragraphs and list items
        // Look for actual line breaks or patterns that indicate new paragraphs
        const lines = cleanedText.split(/\n+/).filter(line => line.trim())
        
        return lines.map((line, i) => {
            const trimmedLine = line.trim()
            if (!trimmedLine) return null

            // Check if it's a numbered list item (must be at start of line)
            const numberedMatch = trimmedLine.match(/^(\d+[\.\)])\s+(.+)/)
            if (numberedMatch) {
                return (
                    <div key={i} className="flex gap-3 ml-1 mb-3">
                        <span className="text-indigo-600 font-semibold mt-0.5 select-none shrink-0">
                            {numberedMatch[1]}
                        </span>
                        <div className="text-gray-700 leading-relaxed flex-1">
                            {highlightBold(numberedMatch[2])}
                        </div>
                    </div>
                )
            }

            // Check if it's a bullet point
            const bulletMatch = trimmedLine.match(/^([-•])\s+(.+)/)
            if (bulletMatch) {
                return (
                    <div key={i} className="flex gap-3 ml-1 mb-3">
                        <span className="text-indigo-600 font-semibold mt-0.5 select-none shrink-0">
                            •
                        </span>
                        <div className="text-gray-700 leading-relaxed flex-1">
                            {highlightBold(bulletMatch[2])}
                        </div>
                    </div>
                )
            }

            // Check if it's a heading (ends with colon or starts with all caps)
            const isHeading = trimmedLine.match(/^([A-Z][^:]+):/) || trimmedLine.match(/^[A-Z\s]{3,}:/)
            if (isHeading) {
                const parts = trimmedLine.split(':')
                return (
                    <div key={i} className="mb-3">
                        <h4 className="font-semibold text-gray-900 mb-1">{parts[0]}:</h4>
                        {parts[1] && (
                            <p className="text-gray-700 leading-relaxed ml-0">
                                {highlightBold(parts.slice(1).join(':').trim())}
                            </p>
                        )}
                    </div>
                )
            }

            // Regular paragraph
            return (
                <p key={i} className="mb-3 text-gray-700 leading-relaxed">
                    {highlightBold(trimmedLine)}
                </p>
            )
        }).filter(Boolean)
    }

    // Helper to bold text between ** ** or highlight special terms
    const highlightBold = (text: string) => {
        if (!text) return null
        
        // Split by **text** for markdown-style bold
        const parts = text.split(/(\*\*[^*]+\*\*)/)
        
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-semibold text-gray-900">
                        {part.slice(2, -2)}
                    </strong>
                )
            }
            
            // Highlight dollar amounts, percentages, and percentage ranges
            const withHighlights = part.split(/(\$[\d,]+[KMB]?|~?\d+\.?\d*-\d+\.?\d*%|~?\d+\.?\d*%)/g).map((segment, j) => {
                if (segment.match(/^\$[\d,]+[KMB]?$/)) {
                    return <span key={`${i}-${j}`} className="font-semibold text-indigo-600">{segment}</span>
                }
                if (segment.match(/^~?\d+\.?\d*-\d+\.?\d*%$/)) {
                    return <span key={`${i}-${j}`} className="font-semibold text-emerald-600">{segment}</span>
                }
                if (segment.match(/^~?\d+\.?\d*%$/)) {
                    return <span key={`${i}-${j}`} className="font-semibold text-emerald-600">{segment}</span>
                }
                return segment
            })
            
            return <span key={i}>{withHighlights}</span>
        })
    }

    // Extract numbers for Market Size from text
    const extractMarketData = (text: string) => {
        if (!text) return 'N/A'
        
        // Look for typical currency formats like $68.9M, $48.2M, $50K
        // Prioritize with suffixes (K/M/B)
        const withSuffixMatch = text.match(/\$[\d,.]+\s*[KMBkmb](?![a-z])/i)
        if (withSuffixMatch) {
            return withSuffixMatch[0].replace(/\s+/g, '')
        }

        // Fallback to any dollar amount followed by space/end
        const dollarMatch = text.match(/\$[\d,.]+(?=\s|$)/)
        if (dollarMatch) {
            return dollarMatch[0]
        }
        
        return 'Calculate'
    }

    // Extract a clean preview from content
    const extractPreview = (text: string, maxLength: number = 150) => {
        if (!text) return ''
        
        // Remove markdown and formatting
        const clean = text
            .replace(/\*\*/g, '')
            .replace(/\n+/g, ' ')
            .replace(/\d+[\.\)]\s+/g, '')
            .trim()
        
        // Get first sentence or maxLength chars
        const firstSentence = clean.split(/[.!?]\s+/)[0]
        if (firstSentence && firstSentence.length < maxLength) {
            return firstSentence + '...'
        }
        
        return clean.substring(0, maxLength) + '...'
    }

    if (!analysis) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Project Analysis</h1>
                    <p className="text-gray-500 mt-1">Comprehensive startup analysis framework</p>
                </div>

                <Card padding="lg" className="text-center border-gray-200">
                    <div className="py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Generate Comprehensive Analysis</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Get a detailed breakdown of your problem, market size (TAM/SAM/SOM), business model, and go-to-market strategy.
                        </p>
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Analyzing Project...' : 'Generate Analysis'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // Define tabs content
    const tabs = [
        { id: 'overview', label: 'Overview', icon: sectionIcons.problemStatement },
        { id: 'market', label: 'Market Study', icon: sectionIcons.tam },
        { id: 'business', label: 'Business Model', icon: sectionIcons.businessModel },
        { id: 'execution', label: 'Execution', icon: sectionIcons.channels },
    ]

    const renderSectionCard = (key: keyof ProjectAnalysisData) => {
        const section = analysis[key]
        return (
            <Card
                key={key}
                padding="none"
                className="border-gray-200 hover:border-gray-300 transition-all group overflow-hidden"
            >
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">{sectionIcons[key]}</span>
                        <h3 className="font-semibold text-gray-900">{sectionLabels[key]}</h3>
                    </div>
                    <button
                        onClick={() => handleEdit(key, section.content)}
                        className="text-xs text-gray-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 px-2 py-1 rounded hover:bg-white"
                    >
                        Edit
                    </button>
                </div>
                <div className="p-5 text-sm">
                    {formatContent(section.content)}
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Project Analysis</h1>
                    <p className="text-gray-500 mt-1">Deep dive into your startup mechanics</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                        Re-Analyze
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSectionCard('problemStatement')}
                            {renderSectionCard('valueProposition')}
                        </div>
                        {renderSectionCard('targetAudience')}
                    </div>
                )}

                {activeTab === 'market' && (
                    <div className="space-y-6">
                        {/* Market Analysis Sections */}
                        <div className="grid grid-cols-1 gap-4">
                            {renderSectionCard('tam')}
                            {renderSectionCard('sam')}
                            {renderSectionCard('som')}
                        </div>
                    </div>
                )}

                {activeTab === 'business' && (
                    <div className="space-y-6">
                        {renderSectionCard('businessModel')}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSectionCard('unfairAdvantage')}
                            {renderSectionCard('keyMetrics')}
                        </div>
                    </div>
                )}

                {activeTab === 'execution' && (
                    <div className="space-y-6">
                        {renderSectionCard('channels')}
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3 text-sm text-yellow-800">
                            <span className="text-lg">💡</span>
                            <p>Focus on one channel at a time. The most common mistake is trying to do everything at once.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingSection}
                onClose={() => setEditingSection(null)}
                title={editingSection ? `Edit ${sectionLabels[editingSection]}` : 'Edit'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditingSection(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Edit this section to better reflect your startup.
                        Use **bold** for emphasis and - for bullet points.
                    </p>
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm font-mono leading-relaxed"
                        placeholder="Enter your content..."
                    />
                </div>
            </Modal>
        </div>
    )
}
