'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/layout'


const footerLinks = {
    product: {
        title: 'Product',
        links: [
            { name: 'Features', href: '/#features' },
            { name: 'Pricing', href: '/#pricing' },
            { name: 'How It Works', href: '/#how-it-works' },
            { name: 'Roadmap', href: '/roadmap' }
        ]
    },
    company: {
        title: 'Company',
        links: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' }
        ]
    },

    legal: {
        title: 'Legal',
        links: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Cookie Policy', href: '/cookies' }
        ]
    }
}

const socialLinks = [
    {
        name: 'Twitter',
        href: 'https://twitter.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        )
    },
    {
        name: 'GitHub',
        href: 'https://github.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
        )
    },
    {
        name: 'LinkedIn',
        href: 'https://linkedin.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        )
    },
    {
        name: 'Discord',
        href: 'https://discord.com',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
        )
    }
]

export function Footer() {
    const footerRef = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (footerRef.current) {
            observer.observe(footerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <footer
            ref={footerRef}
            className={`relative mt-24 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            {/* Floating container */}
            <Container maxWidth="xl">
                <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Top gradient bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="px-6 sm:px-8 md:px-12 py-10 sm:py-12">
                        {/* Main grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
                            {/* Brand column */}
                            <div className="col-span-2 lg:col-span-2 footer-col">
                                <Link href="/" className="inline-flex items-center gap-2 mb-4">
                                    <Image src="/idey.webp" alt="ideY Logo" width={40} height={30} className="w-auto h-8" />
                                    <span className="font-bold text-xl text-white">
                                        ideY
                                    </span>
                                </Link>
                                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                                    Turn your startup idea into reality with AI-powered validation and execution tools.
                                </p>

                                {/* Social links */}
                                <div className="flex items-center gap-3">
                                    {socialLinks.map(social => (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                                            aria-label={social.name}
                                        >
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Link columns */}
                            {Object.values(footerLinks).map((column) => (
                                <div key={column.title} className="footer-col">
                                    <h4 className="text-white font-semibold mb-4">{column.title}</h4>
                                    <ul className="space-y-3">
                                        {column.links.map(link => {
                                            // Check if it's an anchor link (e.g., /#features)
                                            const isAnchorLink = link.href.startsWith('/#')

                                            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                                                if (isAnchorLink) {
                                                    e.preventDefault()
                                                    const id = link.href.replace('/#', '')
                                                    const element = document.getElementById(id)
                                                    if (element) {
                                                        element.scrollIntoView({
                                                            behavior: 'smooth',
                                                            block: 'start'
                                                        })
                                                    }
                                                }
                                            }

                                            return (
                                                <li key={link.name}>
                                                    <Link
                                                        href={link.href}
                                                        onClick={handleClick}
                                                        className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                                                    >
                                                        {link.name}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Bottom bar */}
                        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-gray-500 text-sm">
                                © {new Date().getFullYear()} ideY. All rights reserved.
                            </p>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span>Built for founders who ship!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Spacer at bottom */}
            <div className="h-12" />
        </footer>
    )
}
