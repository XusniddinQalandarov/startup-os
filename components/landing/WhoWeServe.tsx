'use client'

import { useEffect, useRef } from 'react'
import { Container } from '@/components/layout'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const organizations = [
    {
        title: 'Accelerators & Incubators',
        description: 'Screen applications efficiently with standardized Build/Pivot/Kill recommendations using our ideY Standard v1 framework. Evaluate cohorts at scale without sacrificing quality.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        hoverColor: 'hover:shadow-indigo-100/50',
        iconColor: 'text-indigo-200'
    },
    {
        title: 'Angel Investors',
        description: 'Make informed investment decisions with detailed risk assessments, market validation, and execution feasibility analysis for every pitch that crosses your desk.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        hoverColor: 'hover:shadow-emerald-100/50',
        iconColor: 'text-emerald-200'
    },
    {
        title: 'Venture Funds',
        description: 'Streamline deal flow evaluation with a consistent scoring framework. Maintain investment thesis standards across your entire portfolio decision-making process.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        hoverColor: 'hover:shadow-amber-100/50',
        iconColor: 'text-amber-200'
    },
    {
        title: 'University Startup Clubs',
        description: 'Teach structured entrepreneurship with professional-grade validation tools. Equip the next generation of founders with institutional-level frameworks.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        hoverColor: 'hover:shadow-pink-100/50',
        iconColor: 'text-pink-200'
    }
]

export function WhoWeServe() {
    const sectionRef = useRef<HTMLElement>(null)
    const cardsRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.from('.org-title', {
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
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: 'power3.out'
                })
            })
        }, sectionRef)

        ScrollTrigger.refresh()
        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent pointer-events-none" />

            <Container className="max-w-6xl">
                <div className="text-center mb-16 org-title">
                    <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        Who We Serve
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                        Built for the{' '}
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            Innovation Ecosystem
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Designed for the institutions shaping tomorrow's ventures
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {organizations.map((org, index) => (
                        <div
                            key={org.title}
                            ref={el => { if (el) cardsRef.current[index] = el }}
                            className="group relative opacity-0 translate-y-12"
                        >
                            <div className={`relative bg-gray-50/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl ${org.hoverColor} transition-all duration-500 hover:-translate-y-1 h-full overflow-hidden`}>
                                {/* Big background icon - bottom right */}
                                <div className={`absolute -bottom-6 -right-6 w-40 h-40 ${org.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                                    {org.icon}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {org.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {org.description}
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
