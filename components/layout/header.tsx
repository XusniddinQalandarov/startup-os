import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Container } from '@/components/layout'

interface HeaderProps {
    startupName?: string
    status?: string
    className?: string
    children?: ReactNode
}

const statusStyles: Record<string, string> = {
    evaluating: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    evaluated: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    in_progress: 'bg-green-500/20 text-green-300 border-green-500/30',
    completed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
}

export function Header({ startupName, status, className, children }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 pt-6">
            <Container maxWidth="xl">
                <div
                    className={cn(
                        'bg-gray-900 rounded-3xl overflow-hidden shadow-2xl',
                        className
                    )}
                >
                    {/* Bottom gradient bar - matching footer's top bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="px-6 md:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {startupName && (
                                <>
                                    <h1 className="text-lg font-semibold text-white">{startupName}</h1>
                                    {status && (
                                        <span
                                            className={cn(
                                                'px-3 py-1 text-xs font-medium rounded-full capitalize border',
                                                statusStyles[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                            )}
                                        >
                                            {status.replace('_', ' ')}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        {children && <div className="flex items-center gap-4">{children}</div>}
                    </div>
                </div>
            </Container>
        </header>
    )
}
