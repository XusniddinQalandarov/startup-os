'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Button } from '@/components/ui'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const plans = [
    {
        name: 'Starter',
        price: { monthly: 0, annual: 0 },
        description: 'Perfect for testing the waters with your first idea.',
        features: [
            { text: '1 Project', included: true },
            { text: 'Basic AI Analysis', included: true },
            { text: 'Task Management', included: true },
            { text: 'Email Support', included: true },
            { text: 'Advanced Market Research', included: false },
            { text: 'Competitor Deep Dive', included: false },
            { text: 'Priority Processing', included: false },
            { text: 'Team Collaboration', included: false }
        ],
        cta: 'Get Started Free',
        href: '/signup',
        popular: false
    },
    {
        name: 'Pro',
        price: { monthly: 19, annual: 15 },
        description: 'For serious founders ready to execute their vision.',
        features: [
            { text: 'Unlimited Projects', included: true },
            { text: 'Advanced AI Analysis', included: true },
            { text: 'Full Task Management', included: true },
            { text: 'Priority Support', included: true },
            { text: 'Advanced Market Research', included: true },
            { text: 'Competitor Deep Dive', included: true },
            { text: 'Priority Processing', included: true },
            { text: 'Team Collaboration', included: false }
        ],
        cta: 'Upgrade to Pro',
        href: '/signup?plan=pro',
        popular: true
    },
    {
        name: 'Team',
        price: { monthly: 49, annual: 39 },
        description: 'Collaborate with your co-founders and early team.',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Up to 5 Team Members', included: true },
            { text: 'Shared Projects', included: true },
            { text: 'Team Analytics', included: true },
            { text: 'Role Permissions', included: true },
            { text: 'Dedicated Support', included: true },
            { text: 'API Access', included: true },
            { text: 'Custom Integrations', included: true }
        ],
        cta: 'Start Team Plan',
        href: '/signup?plan=team',
        popular: false
    }
]

export function PricingPlans() {
    const [isAnnual, setIsAnnual] = useState(true)
    const sectionRef = useRef<HTMLElement>(null)
    const cardsRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.from('.pricing-title', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })

            // Toggle animation
            gsap.from('.pricing-toggle', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.2,
                ease: 'power3.out'
            })

            // Cards stagger animation
            cardsRef.current.forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    y: 60,
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.15,
                    ease: 'power3.out'
                })
            })
        }, sectionRef)

        // Refresh ScrollTrigger after component mount
        ScrollTrigger.refresh()

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="pricing" className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white">
            <Container>
                <div className="text-center mb-12 pricing-title">
                    <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        Pricing Plans
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Simple, transparent
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> pricing</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Start free, upgrade when you're ready. No hidden fees, no surprises.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-12 pricing-toggle">
                    <div className="inline-flex items-center gap-3 p-1.5 bg-gray-100 rounded-full">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${!isAnnual
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${isAnnual
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Annual
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            ref={el => { if (el) cardsRef.current[index] = el }}
                            className={`relative group ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className={`h-full rounded-2xl p-6 transition-all duration-500 ${plan.popular
                                ? 'bg-white border-2 border-indigo-200 shadow-xl shadow-indigo-100/50'
                                : 'bg-white/80 border border-gray-200 hover:border-indigo-100 hover:shadow-lg'
                                }`}>
                                {/* Header */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ${isAnnual ? plan.price.annual : plan.price.monthly}
                                        </span>
                                        {plan.price.monthly > 0 && (
                                            <span className="text-gray-500">/month</span>
                                        )}
                                    </div>
                                    {isAnnual && plan.price.annual > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Billed annually (${plan.price.annual * 12}/year)
                                        </p>
                                    )}
                                </div>

                                {/* CTA */}
                                <Link href={plan.href} className="block mb-6">
                                    <Button
                                        className={`w-full ${plan.popular
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200/50 border-0'
                                            : ''
                                            }`}
                                        variant={plan.popular ? 'primary' : 'secondary'}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>

                                {/* Features */}
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature.text} className="flex items-center gap-3 text-sm">
                                            {feature.included ? (
                                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <p className="text-center text-sm text-gray-500 mt-12">
                    All plans include SSL security, 99.9% uptime SLA, and regular updates.
                    <br />
                    Questions? <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">Contact our team</Link>
                </p>
            </Container>
        </section>
    )
}
