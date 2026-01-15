'use client'

// Startup-themed icons for the background - using pure CSS animations for better performance
const icons = [
    // Lightbulb - Ideas
    <svg key="lightbulb" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>,
    // Rocket - Launch
    <svg key="rocket" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>,
    // Target - Goals
    <svg key="target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>,
    // Chart - Growth
    <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18M7 16l4-4 4 4 5-6" />
    </svg>,
    // Code - Tech
    <svg key="code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>,
    // Users - Team
    <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" />
    </svg>,
    // Star - Quality
    <svg key="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>,
    // Zap - Speed
    <svg key="zap" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>,
]

// Pre-computed positions for icons (4x4 grid with randomization)
const iconPositions = [
    { x: 8, y: 10, size: 32, delay: 0 },
    { x: 32, y: 8, size: 28, delay: 1.2 },
    { x: 58, y: 12, size: 36, delay: 0.4 },
    { x: 85, y: 6, size: 30, delay: 1.8 },
    { x: 12, y: 32, size: 34, delay: 0.8 },
    { x: 38, y: 28, size: 26, delay: 2.2 },
    { x: 62, y: 35, size: 32, delay: 0.2 },
    { x: 88, y: 30, size: 28, delay: 1.4 },
    { x: 6, y: 55, size: 30, delay: 1.6 },
    { x: 35, y: 58, size: 36, delay: 0.6 },
    { x: 60, y: 52, size: 28, delay: 2.0 },
    { x: 82, y: 56, size: 34, delay: 1.0 },
    { x: 15, y: 78, size: 32, delay: 2.4 },
    { x: 40, y: 82, size: 30, delay: 0.3 },
    { x: 65, y: 76, size: 26, delay: 1.5 },
    { x: 90, y: 80, size: 32, delay: 0.9 },
]

export function AnimatedBackground() {
    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        >
            {/* Light background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50" />

            {/* Large gradient orbs - using CSS transforms for GPU acceleration */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
                style={{ animation: 'pulse 8s ease-in-out infinite' }}
            />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
                style={{ animation: 'pulse 8s ease-in-out infinite 2s' }}
            />
            <div
                className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-gradient-to-r from-indigo-100/30 to-violet-100/20 rounded-full blur-3xl"
                style={{ animation: 'pulse 6s ease-in-out infinite 1s' }}
            />

            {/* Floating Icons - subtle movement, consistent colors */}
            {iconPositions.map((pos, index) => (
                <div
                    key={index}
                    className="absolute text-purple-300/30 floating-icon"
                    style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: pos.size,
                        height: pos.size,
                        animationDelay: `${pos.delay}s`,
                        animationDuration: `${6 + (index % 3)}s`,
                    }}
                >
                    {icons[index % icons.length]}
                </div>
            ))}

            {/* CSS Keyframes */}
            <style jsx>{`
                .floating-icon {
                    animation: floatIcon ease-in-out infinite;
                }
                
                @keyframes floatIcon {
                    0%, 100% {
                        transform: translate(-50%, -50%) translateY(0px);
                    }
                    50% {
                        transform: translate(-50%, -50%) translateY(-20px);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.6;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </div>
    )
}
