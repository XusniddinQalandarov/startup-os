'use client'

import { useState } from 'react'
import { Button, Modal, Input } from '@/components/ui'
import { upgradeToPremium, downgradeToFreemium } from '@/app/actions/subscription'
import Link from 'next/link'

interface SubscriptionManagerProps {
    isPremium: boolean
}

export function SubscriptionManager({ isPremium }: SubscriptionManagerProps) {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
    const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [promoCode, setPromoCode] = useState('')
    const [promoApplied, setPromoApplied] = useState(false)
    const [promoError, setPromoError] = useState('')

    const handleApplyPromo = () => {
        if (promoCode.trim().toUpperCase() === 'LSMD4100') {
            setPromoApplied(true)
            setPromoError('')
        } else {
            setPromoApplied(false)
            setPromoError('Invalid promo code')
        }
    }

    const handleUpgrade = async () => {
        setIsLoading(true)
        try {
            await upgradeToPremium(promoApplied ? 'LSMD4100' : undefined)
            setIsUpgradeModalOpen(false)
            setPromoCode('')
            setPromoApplied(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDowngrade = async () => {
        setIsLoading(true)
        try {
            await downgradeToFreemium()
            setIsDowngradeModalOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={`text-lg font-bold ${isPremium ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {isPremium ? 'Premium Plan' : 'Free Plan'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        {isPremium
                            ? 'You have access to all premium features.'
                            : 'Upgrade to unlock unlimited projects and advanced AI analysis.'}
                    </p>
                </div>

                {isPremium ? (
                    <button
                        onClick={() => setIsDowngradeModalOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-100 transition-colors"
                    >
                        Cancel Subscription
                    </button>
                ) : (
                    <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Upgrade to Premium
                    </button>
                )}
            </div>

            {isPremium && (
                <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between text-xs text-gray-400">
                    <span>Manage your billing and payment method</span>
                    {/* Placeholder for future implementation */}
                    <span className="text-gray-300">Stripe Integration Coming Soon</span>
                </div>
            )}

            {/* Upgrade Modal */}
            <Modal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                title="Upgrade to Premium"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsUpgradeModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpgrade}
                            isLoading={isLoading}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                        >
                            {promoApplied ? 'Start 1 Week Free Trial' : 'Pay $19.00'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-6 py-2">
                    {/* Plan Summary */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900">Pro Plan</span>
                            <span className="font-bold text-lg text-gray-900">$19.00<span className="text-sm text-gray-500 font-normal">/mo</span></span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Unlimited Projects
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Advanced AI Analysis
                            </li>
                        </ul>
                    </div>

                    {/* Promo Code Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Promo Code</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter code"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(e.target.value)
                                        setPromoError('')
                                        setPromoApplied(false)
                                    }}
                                    className={promoError ? 'border-red-300 focus:ring-red-200' : ''}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleApplyPromo}
                                disabled={!promoCode || promoApplied}
                            >
                                Apply
                            </Button>
                        </div>
                        {promoError && <p className="text-xs text-red-500">{promoError}</p>}
                        {promoApplied && (
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Code applied: 100% discount for 1 week
                            </p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Downgrade Modal */}
            <Modal
                isOpen={isDowngradeModalOpen}
                onClose={() => setIsDowngradeModalOpen(false)}
                title="Cancel Subscription"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsDowngradeModalOpen(false)}>
                            Keep Plan
                        </Button>
                        <Button
                            onClick={handleDowngrade}
                            isLoading={isLoading}
                            className="bg-red-500 hover:bg-red-600 text-white border-0"
                        >
                            Confirm Cancellation
                        </Button>
                    </>
                }
            >
                <div className="py-2">
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to cancel your Premium subscription? You will lose access to unlimited projects and advanced AI features immediately.
                    </p>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-red-700">
                        <p>Note: Refunds are not automatically processed. Please contact support if you believe this is an error.</p>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
