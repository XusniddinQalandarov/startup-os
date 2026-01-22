'use client'

import { useEffect, useRef } from 'react'
import { IdeaEvaluation, IdeaType } from '@/types'
import { gsap } from 'gsap'

interface ScoreCardProps {
    evaluation: IdeaEvaluation
    ideaType?: IdeaType
}

export function ScoreCard({ evaluation, ideaType }: ScoreCardProps) {
    const isB2B = ideaType === 'B2B' || ideaType === 'B2G'
    const circleRef = useRef<SVGCircleElement>(null)
    const scoreRef = useRef<HTMLSpanElement>(null)

    // 7 Dimensions config (Adaptive for B2B vs B2C)
    const dimensions = [
        {
            key: 'problemSeverity',
            label: 'Problem Severity',
            weight: isB2B ? '20%' : '15%',
            description: isB2B ? 'Is this a painful, budget-owning problem?' : 'How real and painful is the problem?'
        },
        {
            key: 'targetCustomerClarity',
            label: isB2B ? 'Buyer Clarity' : 'Customer Clarity',
            weight: '15%',
            description: isB2B ? 'Is the economic buyer clearly identifiable?' : 'Do we know exactly who this is for?'
        },
        {
            key: 'marketOpportunity',
            label: isB2B ? 'ICP Precision' : 'Market Opportunity',
            weight: '15%',
            description: isB2B ? 'Industry, company size, role specificity' : 'Is the market large and growing?'
        },
        {
            key: 'competitiveDifferentiation',
            label: isB2B ? 'Competitive Moat' : 'Differentiation',
            weight: isB2B ? '10%' : '15%',
            description: isB2B ? 'Switching costs, data lock-in, workflow depth' : 'Why this over alternatives?'
        },
        {
            key: 'executionComplexity',
            label: isB2B ? 'Sales Complexity' : 'Execution Feasibility',
            weight: isB2B ? '10%' : '15%',
            description: isB2B ? 'Deal cycle length, stakeholders, friction' : 'Can you build and deliver this?'
        },
        {
            key: 'tractionValidation',
            label: isB2B ? 'Expansion Potential' : 'Traction & Signals',
            weight: isB2B ? '10%' : '15%',
            description: isB2B ? 'Upsell, seat expansion, usage growth' : 'Is there real-world interest?'
        },
        {
            key: 'riskProfile',
            label: isB2B ? 'Willingness to Pay' : 'Risk Profile',
            weight: isB2B ? '20%' : '10%',
            description: isB2B ? 'Evidence this problem gets budget approval' : 'Are risks manageable?'
        },
    ]

    // Helper to get color for 1-5 scores
    const getScoreColor = (score: number) => {
        if (score >= 4) return 'text-emerald-600'
        if (score >= 3) return 'text-amber-600'
        return 'text-red-600'
    }

    const getScoreBarColor = (score: number) => {
        if (score >= 4) return 'bg-emerald-500'
        if (score >= 3) return 'bg-amber-500'
        return 'text-red-500'
    }

    const getCircleColor = (score: number) => {
        if (score >= 80) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' } // emerald
        if (score >= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' } // amber
        return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' } // red
    }

    // Convert 1-5 score to percentage for visual display
    const scoreToPercentage = (score: number) => (score / 5) * 100

    // Animate circular progress on mount
    useEffect(() => {
        if (!circleRef.current || !scoreRef.current) return

        const radius = 70
        const circumference = 2 * Math.PI * radius
        const progress = evaluation.totalScore / 100

        // Set initial state
        circleRef.current.style.strokeDasharray = `${circumference}`
        circleRef.current.style.strokeDashoffset = `${circumference}`

        // Animate circle
        gsap.to(circleRef.current, {
            strokeDashoffset: circumference - (progress * circumference),
            duration: 2,
            ease: 'power2.out',
            delay: 0.3
        })

        // Animate number
        gsap.fromTo(scoreRef.current,
            { textContent: 0 },
            {
                textContent: evaluation.totalScore,
                duration: 2,
                ease: 'power2.out',
                delay: 0.3,
                snap: { textContent: 1 },
                onUpdate: function () {
                    if (scoreRef.current) {
                        scoreRef.current.textContent = String(Math.round(Number(this.targets()[0].textContent)))
                    }
                }
            }
        )
    }, [evaluation.totalScore])

    const circleColors = getCircleColor(evaluation.totalScore)

    return (
        <div className="space-y-8">
            {/* Total Score Header with Animated Circle */}
            <div className="avoid-break flex flex-col sm:flex-row gap-6 items-center p-8 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Weighted Score</h3>
                    <p className="text-sm text-gray-500">Based on ideY Standard v1 Framework</p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Score</div>
                        <div className={`text-3xl font-bold ${getScoreColor(evaluation.totalScore / 20)}`}>
                            {evaluation.totalScore}/100
                        </div>
                    </div>
                    {/* Animated Circular Progress */}
                    <div className="relative">
                        <svg className="w-36 h-36 transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="72"
                                cy="72"
                                r="70"
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth="8"
                            />
                            {/* Progress circle with glow effect */}
                            <circle
                                ref={circleRef}
                                cx="72"
                                cy="72"
                                r="70"
                                fill="none"
                                stroke={circleColors.stroke}
                                strokeWidth="8"
                                strokeLinecap="round"
                                style={{
                                    filter: `drop-shadow(0 0 8px ${circleColors.glow})`,
                                    transition: 'stroke 0.3s ease'
                                }}
                            />
                        </svg>
                        {/* Score number in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span
                                ref={scoreRef}
                                className={`text-4xl font-bold ${getScoreColor(evaluation.totalScore / 20)}`}
                            >
                                0
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dimensions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">Dimension</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Weight</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Analysis</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {dimensions.map((dim) => {
                                const score = evaluation.scores[dim.key as keyof typeof evaluation.scores] as number
                                const details = evaluation.scoreDetails?.[dim.key]

                                return (
                                    <tr key={dim.key} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 px-6 align-top">
                                            <div className="font-medium text-gray-900">{dim.label}</div>
                                            <div className="text-xs text-gray-500 mt-1">{dim.description}</div>
                                        </td>
                                        <td className="py-5 px-6 align-top text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                                                {dim.weight}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 align-top">
                                            {details ? (
                                                <div className="space-y-2">
                                                    <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                                                        {details.bullets.map((bullet, i) => (
                                                            <li key={i}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                    <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-100">
                                                        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-0.5">Risk:</span>
                                                        <span className="text-sm text-gray-600 italic">{details.keyRisk}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-400 italic">V1 Evaluation (Legacy)</span>
                                                    <span className="text-xs text-indigo-500 cursor-pointer hover:underline" onClick={() => window.location.reload()}>
                                                        Re-evaluate for details
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-5 px-6 align-top">
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-center">
                                                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                                        {score}
                                                    </span>
                                                    <span className="text-xs text-gray-400 ml-0.5">/5</span>
                                                </div>
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${getScoreBarColor(score)} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${scoreToPercentage(score)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modern Gradient Summary Sections */}
            <div className="avoid-break grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Strengths - Modern gradient */}
                <div className="relative overflow-hidden rounded-2xl p-6 border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50/50 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl" />
                    <h4 className="relative flex items-center gap-2 text-lg font-bold text-emerald-900 mb-4">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Key Strengths
                    </h4>
                    <ul className="relative space-y-3">
                        {evaluation.keyStrengths?.map((strength, i) => (
                            <li key={i} className="flex gap-3 text-emerald-900 text-sm">
                                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-sm" />
                                <span className="flex-1">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Key Risks - Modern gradient */}
                <div className="relative overflow-hidden rounded-2xl p-6 border border-red-200/50 bg-gradient-to-br from-red-50 via-orange-50/30 to-red-50/50 shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-transparent rounded-full blur-2xl" />
                    <h4 className="relative flex items-center gap-2 text-lg font-bold text-red-900 mb-4">
                        <div className="p-1.5 rounded-lg bg-red-500/10">
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        Key Risks
                    </h4>
                    <ul className="relative space-y-3">
                        {evaluation.keyRisks?.map((risk, i) => (
                            <li key={i} className="flex gap-3 text-red-900 text-sm">
                                <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 shadow-sm" />
                                <span className="flex-1">{risk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
