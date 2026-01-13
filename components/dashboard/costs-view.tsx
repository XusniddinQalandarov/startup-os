'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { generateCosts } from '@/app/actions/ai'
import { CostEstimate, Startup } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'

interface CostsViewProps {
    project: Startup
    initialCosts: CostEstimate[] | null
}

export function CostsView({ project, initialCosts }: CostsViewProps) {
    const [costs, setCosts] = useState<CostEstimate[] | null>(initialCosts)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await generateCosts(project.id, project.idea)
        if (result) {
            setCosts(result)
        }
        setIsGenerating(false)
    }

    if (!costs) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Cost Estimates</h1>
                    <p className="text-gray-600 mt-1">Realistic monthly burn rate for your startup</p>
                </div>

                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Estimate Costs</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Get a realistic estimate of monthly costs. We prioritize free tiers and actual startup pricing.
                        </p>
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Estimating...' : 'Estimate Costs'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    const totalCost = costs.reduce((sum, item) => sum + item.monthlyCost, 0)
    const requiredCost = costs
        .filter(item => !item.isOptional)
        .reduce((sum, item) => sum + item.monthlyCost, 0)
    const optionalCost = totalCost - requiredCost

    const groupedCosts = costs.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, CostEstimate[]>)

    const categoryIcons: Record<string, React.ReactNode> = {
        Infrastructure: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
        ),
        Tools: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        AI: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        Marketing: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        ),
        Other: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
        ),
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Cost Estimates</h1>
                    <p className="text-gray-600 mt-1">Realistic monthly burn rate</p>
                </div>
                <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                    Regenerate
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="md" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <p className="text-sm font-medium text-green-800 opacity-80 mb-1">Essential Monthly</p>
                    <p className="text-3xl font-bold text-green-700">{formatCurrency(requiredCost)}</p>
                    <p className="text-xs text-green-600 mt-1">Minimum to run your startup</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
                    <p className="text-sm font-medium text-amber-800 opacity-80 mb-1">Optional Add-ons</p>
                    <p className="text-3xl font-bold text-amber-700">{formatCurrency(optionalCost)}</p>
                    <p className="text-xs text-amber-600 mt-1">Nice-to-have services</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                    <p className="text-sm font-medium text-indigo-800 opacity-80 mb-1">Total Monthly</p>
                    <p className="text-3xl font-bold text-indigo-700">{formatCurrency(totalCost)}</p>
                    <p className="text-xs text-indigo-600 mt-1">All services included</p>
                </Card>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-4">
                {Object.entries(groupedCosts).map(([category, items]) => {
                    const categoryTotal = items.reduce((sum, item) => sum + item.monthlyCost, 0)

                    return (
                        <Card key={category} padding="none" className="overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                        {categoryIcons[category] || categoryIcons.Other}
                                    </span>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">{category}</h2>
                                        <p className="text-xs text-gray-500">{items.length} items</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(categoryTotal)}</span>
                            </div>
                            <ul className="divide-y divide-gray-100">
                                {items.map((item, index) => (
                                    <li key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">{item.item}</p>
                                                    {item.isOptional && (
                                                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                            Optional
                                                        </span>
                                                    )}
                                                    {item.monthlyCost === 0 && (
                                                        <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                            Free Tier
                                                        </span>
                                                    )}
                                                </div>
                                                {item.note && (
                                                    <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "font-semibold",
                                                item.monthlyCost === 0 ? "text-green-600" : "text-gray-900"
                                            )}>
                                                {item.monthlyCost === 0 ? 'Free' : formatCurrency(item.monthlyCost)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )
                })}
            </div>

            {/* Tip */}
            <Card padding="md" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h3 className="font-semibold text-green-900">Startup Cost Tips</h3>
                        <ul className="text-sm text-green-800 mt-2 space-y-1">
                            <li>• Start with free tiers everywhere - upgrade only when you need to</li>
                            <li>• Most MVPs can run on $50-100/month total</li>
                            <li>• Avoid paid marketing until you have product-market fit</li>
                            <li>• Use open-source tools when possible</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    )
}
