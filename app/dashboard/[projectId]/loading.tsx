import { Card } from "@/components/ui"

export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-8 w-1/3 bg-gray-200/60 rounded-lg mb-2"></div>
                <div className="h-5 w-1/2 bg-gray-100/60 rounded-lg"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-40 border-gray-100 bg-white/50" padding="md">
                        <div className="space-y-4">
                            <div className="h-6 w-3/4 bg-gray-200/60 rounded"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-100/60 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-100/60 rounded"></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="h-64 border-gray-100 bg-white/50" padding="lg">
                <div className="space-y-4">
                    <div className="h-8 w-1/4 bg-gray-200/60 rounded"></div>
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-100/60 rounded"></div>
                        <div className="h-4 w-full bg-gray-100/60 rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-100/60 rounded"></div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
