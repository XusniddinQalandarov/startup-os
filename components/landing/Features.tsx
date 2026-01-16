'use client'

import { useEffect, useRef } from 'react'
import { Container } from '@/components/layout'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const features = [
    {
        title: 'Quantitative Validation',
        description: 'Score ideas against 7 dimensions including Problem Severity, Willingness to Pay, and Competitive Moat.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        gridClass: 'md:col-span-1'
    },
    {
        title: 'Portfolio Governance',
        description: 'Track portfolio companies with standardized metrics, task completion rates, and automated status reporting.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        gridClass: 'md:col-span-2'
    },
    {
        title: 'Execution Roadmap',
        description: 'Turn vague concepts into structured 3-phase execution plans with clear milestones and resource requirements.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
        gridClass: 'md:col-span-1 md:row-span-2'
    },
    {
        title: 'Deal Flow Analytics',
        description: 'Compare startups side-by-side with normalized data points to make objective investment decisions.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        gridClass: 'md:col-span-1'
    },
    {
        title: 'Market Intelligence',
        description: 'Auto-generated buyer interviews scripts and objection handling guides based on specific business models (B2B/B2C).',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        gridClass: 'md:col-span-1'
    },
    {
        title: 'Investment Memoranda',
        description: 'Export comprehensive diligence reports including risk profiles, competitive moats, and financial feasibilities.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
        ),
        gridClass: 'md:col-span-2'
    }
]

export function Features() {
    const sectionRef = useRef<HTMLElement>(null)
    const cardsRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.from('.features-title', {
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

            // Cards stagger animation
            cardsRef.current.forEach((card, index) => {
                gsap.to(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    delay: index * 0.08,
                    ease: 'power3.out'
                })
            })
        }, sectionRef)

        ScrollTrigger.refresh()
        return () => ctx.revert()
    }, [])

    return (
        <section id="features" ref={sectionRef} className="py-24 relative overflow-hidden">
            <Container>
                <div className="text-center mb-16 features-title">
                    <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        Structured Decision System
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Standardize your
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> investment logic</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A rigorous framework designed for institutional investors who value consistency, clarity, and explainability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            ref={el => { if (el) cardsRef.current[index] = el }}
                            className={`${feature.gridClass} group opacity-0 translate-y-12 scale-95`}
                        >
                            <div className="relative h-full bg-gray-50/50 rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                                {/* Big background icon - bottom right */}
                                <div className="absolute -bottom-6 -right-6 w-36 h-36 text-indigo-200 group-hover:scale-110 transition-transform duration-500">
                                    {feature.icon}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
