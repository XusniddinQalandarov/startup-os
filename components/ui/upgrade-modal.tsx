'use client'

import { Modal, Button } from '@/components/ui'
import Link from 'next/link'

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    feature?: string  // Which feature triggered the modal
    title?: string
    description?: string
}

export function UpgradeModal({
    isOpen,
    onClose,
    feature,
    title = 'Upgrade to Pro',
    description
}: UpgradeModalProps) {
    const featureDescriptions: Record<string, string> = {
        projects: 'Create unlimited projects and evaluate multiple ideas simultaneously.',
        evaluation: 'Re-evaluate your idea anytime as you refine your pitch.',
        competitors: 'Get full SWOT analysis and market positioning insights.',
        context: 'Switch between B2B, B2C, and Marketplace evaluation modes.',
        snapshots: 'Track score changes over time with version history.',
        comparison: 'Compare different versions side-by-side.',
        export: 'Export professional reports for investors and mentors.',
        suggestions: 'Get actionable steps to improve your score.',
    }

    const defaultDescription = description ||
        (feature && featureDescriptions[feature]) ||
        'Unlock premium features to supercharge your startup validation.'

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Maybe Later
                    </Button>
                    <Link href="/#pricing">
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0">
                            View Plans
                        </Button>
                    </Link>
                </>
            }
        >
            <div className="text-center py-6">
                {/* Lock Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    {defaultDescription}
                </p>

                {/* Pro Benefits */}
                <div className="bg-gray-50 rounded-xl p-4 text-left">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pro includes:</p>
                    <ul className="space-y-2">
                        {[
                            'Unlimited projects',
                            'Unlimited re-evaluations',
                            'Full competitor analysis',
                            'Score snapshots & history',
                            'Export reports',
                            'Fix suggestions'
                        ].map((benefit) => (
                            <li key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Modal>
    )
}
