'use client'

import { useState } from 'react'
import { Card, Button, Modal, Input } from '@/components/ui'
import { generateRoadmap } from '@/app/actions/ai'
import { RoadmapPhase, Startup } from '@/types'

interface RoadmapViewProps {
    project: Startup
    initialRoadmap: RoadmapPhase[] | null
}

type TimelineType = 'hackathon' | 'sprint' | 'standard' | 'custom'

const timelinePresets: Record<TimelineType, { label: string; description: string; totalWeeks: number }> = {
    hackathon: { label: '🚀 Hackathon', description: '24-48 hours', totalWeeks: 0.1 },
    sprint: { label: '⚡ Sprint', description: '1-2 weeks', totalWeeks: 2 },
    standard: { label: '📅 Standard', description: '8-12 weeks', totalWeeks: 10 },
    custom: { label: '⚙️ Custom', description: 'Set your own deadline', totalWeeks: 0 },
}

export function RoadmapView({ project, initialRoadmap }: RoadmapViewProps) {
    const [roadmap, setRoadmap] = useState<RoadmapPhase[] | null>(initialRoadmap)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showTimelineModal, setShowTimelineModal] = useState(false)
    const [selectedTimeline, setSelectedTimeline] = useState<TimelineType>('standard')
    const [customDays, setCustomDays] = useState(30)

    const handleGenerate = async (timelineType?: TimelineType, days?: number) => {
        setIsGenerating(true)
        setShowTimelineModal(false)

        // Pass undefined for mvpFeatures and techStack when calling standalone
        const result = await generateRoadmap(
            project.id,
            project.idea,
            undefined,  // mvpFeatures - not available in standalone call
            undefined,  // techStack - not available in standalone call
            timelineType || selectedTimeline,
            days || customDays
        )
        if (result) {
            setRoadmap(result)
        }
        setIsGenerating(false)
    }

    const getTotalWeeks = () => {
        if (!roadmap) return 0
        return roadmap.reduce((sum, phase) => sum + phase.durationWeeks, 0)
    }

    if (!roadmap) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Roadmap</h1>
                    <p className="text-gray-600 mt-1">Plan your execution with realistic timelines</p>
                </div>

                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Create Your Roadmap</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Choose your timeline and we'll generate a realistic execution plan.
                        </p>
                        <Button onClick={() => setShowTimelineModal(true)}>
                            Choose Timeline
                        </Button>
                    </div>
                </Card>

                {/* Timeline Selection Modal */}
                <Modal
                    isOpen={showTimelineModal}
                    onClose={() => setShowTimelineModal(false)}
                    title="Choose Your Timeline"
                    footer={
                        <Button
                            onClick={() => handleGenerate()}
                            isLoading={isGenerating}
                            disabled={selectedTimeline === 'custom' && customDays < 1}
                        >
                            Generate Roadmap
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            How much time do you have? We'll adapt the roadmap to your constraints.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {(Object.entries(timelinePresets) as [TimelineType, typeof timelinePresets.hackathon][]).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTimeline(key)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTimeline === key
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl">{preset.label.split(' ')[0]}</span>
                                    <h3 className="font-semibold text-gray-900 mt-1">{preset.label.split(' ')[1]}</h3>
                                    <p className="text-sm text-gray-500">{preset.description}</p>
                                </button>
                            ))}
                        </div>

                        {selectedTimeline === 'custom' && (
                            <div className="pt-4 border-t border-gray-100">
                                <Input
                                    label="Total days available"
                                    type="number"
                                    value={customDays}
                                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                                    min={1}
                                    max={365}
                                />
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        )
    }

    const totalWeeks = getTotalWeeks()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Roadmap</h1>
                    <p className="text-gray-600 mt-1">
                        {totalWeeks < 1
                            ? `${Math.round(totalWeeks * 7)} days total`
                            : `${Math.round(totalWeeks)} weeks total`
                        }
                    </p>
                </div>
                <Button variant="secondary" onClick={() => setShowTimelineModal(true)} isLoading={isGenerating}>
                    Change Timeline
                </Button>
            </div>

            {/* Timeline Visualization */}
            <div className="relative border-l-2 border-indigo-200 ml-4 space-y-10 py-4">
                {roadmap.map((phase, index) => (
                    <div key={phase.id} className="relative pl-8">
                        {/* Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-md" />

                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className="text-lg font-bold text-gray-900">{phase.name}</h3>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                                    {phase.durationWeeks < 1
                                        ? `${Math.round(phase.durationWeeks * 7)} days`
                                        : `${phase.durationWeeks} week${phase.durationWeeks > 1 ? 's' : ''}`
                                    }
                                </span>
                            </div>

                            <p className="text-gray-600">{phase.description}</p>

                            <Card padding="md" className="bg-gray-50/50 mt-4">
                                <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Deliverables</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {phase.tasks.map((task, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {task}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline Modal for Regeneration */}
            <Modal
                isOpen={showTimelineModal}
                onClose={() => setShowTimelineModal(false)}
                title="Change Timeline"
                footer={
                    <Button
                        onClick={() => handleGenerate()}
                        isLoading={isGenerating}
                    >
                        Regenerate Roadmap
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {(Object.entries(timelinePresets) as [TimelineType, typeof timelinePresets.hackathon][]).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedTimeline(key)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTimeline === key
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-2xl">{preset.label.split(' ')[0]}</span>
                                <h3 className="font-semibold text-gray-900 mt-1">{preset.label.split(' ')[1]}</h3>
                                <p className="text-sm text-gray-500">{preset.description}</p>
                            </button>
                        ))}
                    </div>

                    {selectedTimeline === 'custom' && (
                        <div className="pt-4 border-t border-gray-100">
                            <Input
                                label="Total days available"
                                type="number"
                                value={customDays}
                                onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                                min={1}
                                max={365}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
