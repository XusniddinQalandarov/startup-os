import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { Container } from '@/components/layout'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { HowItWorks, AITechnology, Features, PricingPlans, Footer, AppShowcase } from '@/components/landing'
import { getUser } from '@/app/actions/auth'

export default async function LandingPage() {
  const user = await getUser()

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />

      {/* Header - Floating pill design */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 pt-4">
        <header className="mx-auto max-w-6xl bg-white/80 backdrop-blur-xl rounded-full border border-gray-200/50 shadow-lg shadow-gray-200/50">
          <Container className="h-14 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/idey.webp" alt="ideY Logo" width={48} height={36} className="w-auto h-8" />
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ideY
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  How It Works
                </a>
                <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </a>
              </nav>
            </div>

            <nav className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Profile Icon */}
                  <Link href="/profile" className="relative group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-indigo-200/50 ring-2 ring-white hover:ring-indigo-200 transition-all duration-300 hover:scale-105">
                      {user.email?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      My Projects
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-5 shadow-lg shadow-indigo-200/50 border-0 transition-all duration-300">
                      GET STARTED
                      <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </Container>
        </header>
      </div>

      {/* Hero */}
      <main className="flex-1 relative z-10 w-full">
        <section className="flex items-center justify-center min-h-[85vh]">
          <Container className="text-center max-w-3xl py-24">
            {/* Badge - light theme */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">Build what's worth building</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gray-900">Turn your </span>
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                startup idea
              </span>
              <br />
              <span className="text-gray-900">into reality</span>
            </h1>

            <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
              Get honest feedback, customer questions, MVP scope, roadmap, and actionable tasks.
              <span className="font-medium text-gray-900"> No hype, just execution.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/profile">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-200/50 border-0 px-8">
                    Go to My Projects
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              ) : (
                <Link href="/onboarding">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-200/50 border-0 px-8">
                    Evaluate my idea
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              )}

              {user ? (
                <Link href="/onboarding">
                  <Button size="lg" variant="secondary" className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white">
                    + New Project
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white">
                    I have an account
                  </Button>
                </Link>
              )}
            </div>

            {/* Social proof - light theme */}
            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-300 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-300 border-2 border-white" />
                </div>
                <span>Trusted by founders</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1">5.0 rating</span>
              </div>
            </div>
          </Container>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works">
          <HowItWorks />
        </section>

        {/* App Screenshots Showcase */}
        <AppShowcase />

        {/* AI Technology Section */}
        <AITechnology />

        {/* Features Section */}
        <section id="features">
          <Features />
        </section>

        {/* Pricing Section */}
        <PricingPlans />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
