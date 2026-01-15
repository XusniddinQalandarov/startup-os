'use client'

import { useEffect, useRef } from 'react'
import { Container } from '@/components/layout'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
    {
        number: '01',
        title: 'Submit Your Idea',
        description: 'Describe your startup concept in natural language. Our AI understands context, nuance, and ambition.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        )
    },
    {
        number: '02',
        title: 'AI Analysis',
        description: 'Get comprehensive market research, competitor analysis, risk assessment, and customer persona generation.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        number: '03',
        title: 'Build Your MVP',
        description: 'Follow the AI-generated roadmap with actionable tasks, milestones, and clear priorities.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        number: '04',
        title: 'Launch & Iterate',
        description: 'Execute your plan with confidence. Track progress, adapt to feedback, and scale systematically.',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    }
]

export function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null)
    const stepsRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.hiw-title', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })

            stepsRef.current.forEach((step, index) => {
                gsap.from(step, {
                    scrollTrigger: {
                        trigger: step,
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

        ScrollTrigger.refresh()
        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent pointer-events-none" />

            <Container>
                <div className="text-center mb-16 hiw-title">
                    <span className="inline-block px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                        How It Works
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        From idea to execution in
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> 4 simple steps</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Our AI-powered platform transforms your startup concept into an actionable plan,
                        guiding you through every phase of validation and building.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            ref={el => { if (el) stepsRef.current[index] = el }}
                            className="relative group"
                        >
                            <div className="relative bg-gray-50/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-1 h-full overflow-hidden">
                                {/* Step number - top right */}
                                <span className="absolute top-4 right-4 text-5xl font-bold text-gray-100 group-hover:text-indigo-100 transition-colors z-10">
                                    {step.number}
                                </span>

                                {/* Big background icon - bottom right */}
                                <div className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-100 group-hover:text-indigo-200 transition-colors opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500">
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {step.description}
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
