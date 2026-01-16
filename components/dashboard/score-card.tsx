import { IdeaEvaluation, IdeaType } from '@/types'

interface ScoreCardProps {
    evaluation: IdeaEvaluation
    ideaType?: IdeaType
}

export function ScoreCard({ evaluation, ideaType }: ScoreCardProps) {
    const isB2B = ideaType === 'B2B' || ideaType === 'B2G'

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

    // Helper to get color for score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50'
        if (score >= 60) return 'text-amber-600 bg-amber-50'
        return 'text-red-600 bg-red-50'
    }

    const getScoreBarColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-500'
        if (score >= 60) return 'bg-amber-500'
        return 'bg-red-500'
    }

    return (
        <div className="space-y-8">
            {/* Total Score Header */}
            <div className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Weighted Score</h3>
                    <p className="text-sm text-gray-500">Based on ideY Standard v1 Framework</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Score</div>
                        <div className={`text-3xl font-bold ${getScoreColor(evaluation.totalScore).split(' ')[0]}`}>
                            {evaluation.totalScore}/100
                        </div>
                    </div>
                    {/* Semi-circle Gauge / Visual can go here if needed, keeping it simple for now */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${evaluation.totalScore >= 80 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
                        evaluation.totalScore >= 60 ? 'border-amber-500 text-amber-600 bg-amber-50' :
                            'border-red-500 text-red-600 bg-red-50'
                        }`}>
                        <span className="text-2xl font-bold">{evaluation.totalScore}</span>
                    </div>
                </div>
            </div>

            {/* Dimensions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Dimension</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Weight</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analysis</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Score</th>
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
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600">
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
                                                    <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-50">
                                                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider mt-0.5">Risk:</span>
                                                        <span className="text-sm text-gray-500 italic">{details.keyRisk}</span>
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
                                                <span className={`text-lg font-bold ${getScoreColor(score).split(' ')[0]}`}>
                                                    {score}
                                                </span>
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${getScoreBarColor(score)}`}
                                                        style={{ width: `${score}%` }}
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

            {/* Summary Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-emerald-900 mb-4">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Key Strengths
                    </h4>
                    <ul className="space-y-3">
                        {evaluation.keyStrengths?.map((strength, i) => (
                            <li key={i} className="flex gap-3 text-emerald-800 text-sm">
                                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                {strength}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-red-900 mb-4">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Key Risks
                    </h4>
                    <ul className="space-y-3">
                        {evaluation.keyRisks?.map((risk, i) => (
                            <li key={i} className="flex gap-3 text-red-800 text-sm">
                                <span className="block w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                                {risk}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
