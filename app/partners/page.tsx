import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { Container } from '@/components/layout'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Footer } from '@/components/landing'

export default function PartnersPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Header */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 pt-4">
        <header className="mx-auto max-w-6xl bg-white/80 backdrop-blur-xl rounded-full border border-gray-200/50 shadow-lg shadow-gray-200/50">
          <Container className="h-14 flex items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/idey.webp" alt="ideY Logo" width={48} height={36} className="w-auto h-8" />
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ideY
              </span>
            </Link>

            <nav className="flex items-center gap-3">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Back to Home
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-5 shadow-lg shadow-indigo-200/50 border-0">
                  GET STARTED
                </Button>
              </Link>
            </nav>
          </Container>
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full">
        {/* Hero Section */}
        <section className="flex items-center justify-center min-h-[90vh]">
          <Container className="max-w-4xl text-center py-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-8">
              <span className="text-sm font-medium text-indigo-600">For Organizations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gray-900">Empower Your Portfolio with </span>
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Data-Driven Decisions
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              ideY provides accelerators, incubators, angel investors, and university startup programs with a structured, AI-powered framework to evaluate startup ideas consistently and at scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-8 shadow-xl shadow-indigo-200/50 border-0">
                  Schedule a Demo
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Button>
              </Link>
              <a href="mailto:xusniddinqalandarov2004@gmail.com">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600">
                  Contact Us
                </Button>
              </a>
            </div>
          </Container>
        </section>

        {/* Who We Serve */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <Container className="max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              Built for the Innovation Ecosystem
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Accelerators & Incubators */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accelerators & Incubators</h3>
                <p className="text-sm text-gray-600">
                  Screen applications efficiently. Get standardized Build/Pivot/Kill recommendations for every startup idea using our ideY Standard v1 framework.
                </p>
              </div>

              {/* Angel Investors */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Angel Investors</h3>
                <p className="text-sm text-gray-600">
                  Make informed investment decisions. Get detailed risk assessments, market validation, and execution feasibility analysis for every pitch.
                </p>
              </div>

              {/* Venture Funds */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Venture Funds</h3>
                <p className="text-sm text-gray-600">
                  Streamline deal flow evaluation. Consistent scoring framework for portfolio decision-making.
                </p>
              </div>

              {/* University Programs */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">University Startup Clubs</h3>
                <p className="text-sm text-gray-600">
                  Teach structured entrepreneurship. Give students professional-grade tools to validate their ideas.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Key Benefits */}
        <section className="py-16">
          <Container className="max-w-5xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
              Why Organizations Choose ideY
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Eliminate bias, save time, and make better investment decisions with our structured validation framework.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Standardized Evaluation */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Standardized Evaluation</h3>
                  <p className="text-gray-600">
                    Use the ideY Standard v1 framework to score every startup consistently across 7 key dimensions.
                  </p>
                </div>
              </div>

              {/* Scalable Screening */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast AI-Powered Analysis</h3>
                  <p className="text-gray-600">
                    Evaluate ideas in minutes, not hours. AI-powered market research, competitor analysis, and risk assessment.
                  </p>
                </div>
              </div>

              {/* Data-Driven Decisions */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data-Driven Decisions</h3>
                  <p className="text-gray-600">
                    Clear Build/Pivot/Kill verdicts backed by market research, risk analysis, and competitive intelligence.
                  </p>
                </div>
              </div>

              {/* Portfolio Management */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Reports</h3>
                  <p className="text-gray-600">
                    Export detailed PDF reports with evaluation scores, risk analysis, and Build/Pivot/Kill verdicts ready to share with your team.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Pricing for Organizations */}
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
          <Container className="max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                Organization Pricing
              </h2>
              <p className="text-lg text-gray-600">
                Custom plans designed for your team size and evaluation volume
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Plan</h3>
                  <p className="text-gray-600">For accelerators, VCs, and institutions</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900 mb-1">Custom</div>
                  <div className="text-sm text-gray-500">Based on your needs</div>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Unlimited startup idea evaluations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">ideY Standard v1 framework scoring (7 dimensions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">AI-powered market research and competitor analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Build/Pivot/Kill verdict with detailed rationale</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Professional PDF export for reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Priority support and custom volume pricing</span>
                </li>
                <li className="flex items-start gap-3 opacity-60">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500">Coming soon: Multi-user team access & white-label branding</span>
                </li>
              </ul>

              <a href="mailto:xusniddinqalandarov2004@gmail.com">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-indigo-200/50 border-0">
                  Contact Sales
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </Button>
              </a>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Container className="max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Ready to Transform Your Deal Flow?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join leading accelerators and investors using ideY to make better, faster decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-8 shadow-xl shadow-indigo-200/50 border-0">
                  Start Free Trial
                </Button>
              </Link>
              <a href="mailto:xusniddinqalandarov2004@gmail.com">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600">
                  Schedule Demo
                </Button>
              </a>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  )
}
