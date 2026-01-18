interface ProBadgeProps {
    size?: 'sm' | 'md'
    className?: string
}

export function ProBadge({ size = 'sm', className = '' }: ProBadgeProps) {
    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs'
    }

    return (
        <span
            className={`inline-flex items-center font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded ${sizeClasses[size]} ${className}`}
        >
            PRO
        </span>
    )
}

interface LockedFeatureProps {
    children: React.ReactNode
    isLocked: boolean
    onUpgradeClick?: () => void
    className?: string
}

export function LockedFeature({ children, isLocked, onUpgradeClick, className = '' }: LockedFeatureProps) {
    if (!isLocked) return <>{children}</>

    return (
        <div className={`relative ${className}`}>
            <div className="opacity-50 pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg">
                <button
                    onClick={onUpgradeClick}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 hover:shadow-xl transition-all text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Upgrade to unlock</span>
                    <ProBadge size="sm" />
                </button>
            </div>
        </div>
    )
}
