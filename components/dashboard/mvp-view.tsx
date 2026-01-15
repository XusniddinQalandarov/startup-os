'use client'

import { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, Button, Modal, Input } from '@/components/ui'
import { generateMvpScope, updateMvpFeatures } from '@/app/actions/ai'
import { MvpFeature, Startup } from '@/types'
import { cn } from '@/lib/utils'

type FeaturePriority = 'must_have' | 'later' | 'not_now'

interface MvpViewProps {
    project: Startup
    initialFeatures: MvpFeature[] | null
}

const columns: { id: FeaturePriority; title: string; color: string; headerColor: string; activeColor: string }[] = [
    { id: 'must_have', title: 'Must Have', color: 'bg-green-50/50', headerColor: 'bg-green-100 text-green-900', activeColor: 'ring-2 ring-green-400 bg-green-100' },
    { id: 'later', title: 'Later', color: 'bg-yellow-50/50', headerColor: 'bg-yellow-100 text-yellow-900', activeColor: 'ring-2 ring-yellow-400 bg-yellow-100' },
    { id: 'not_now', title: 'Not Now', color: 'bg-gray-50', headerColor: 'bg-gray-100 text-gray-900', activeColor: 'ring-2 ring-gray-400 bg-gray-200' },
]

interface SortableFeatureProps {
    feature: MvpFeature
}

function SortableFeature({ feature }: SortableFeatureProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: feature.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 1000 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <FeatureCard feature={feature} isDragging={isDragging} />
        </div>
    )
}

function FeatureCard({ feature, isDragging }: { feature: MvpFeature; isDragging?: boolean }) {
    return (
        <Card
            padding="sm"
            className={cn(
                "bg-white shadow-sm hover:shadow-md transition-all cursor-grab group",
                isDragging && "shadow-xl rotate-2 scale-105"
            )}
        >
            <h3 className="font-medium text-gray-900">{feature.title}</h3>
            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
                {feature.description}
            </p>
        </Card>
    )
}

interface DroppableColumnProps {
    column: typeof columns[0]
    features: MvpFeature[]
    isActive: boolean
}

function DroppableColumn({ column, features, isActive }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    })

    const featureIds = features.map(f => f.id)

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className={cn(
                "p-3 border-b border-gray-100 rounded-t-xl font-medium flex items-center justify-between",
                column.headerColor
            )}>
                <span className="capitalize">{column.title}</span>
                <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">{features.length}</span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 rounded-b-xl max-h-[calc(100vh-280px)] min-h-140 overflow-y-auto overflow-x-hidden no-scrollbar transition-all duration-150",
                    column.color,
                    (isOver || isActive) && column.activeColor
                )}
            >
                <SortableContext items={featureIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {features.map(feature => (
                            <SortableFeature key={feature.id} feature={feature} />
                        ))}
                        {features.length === 0 && (
                            <div className={cn(
                                "flex items-center justify-center h-24 rounded-lg border-2 border-dashed transition-colors",
                                (isOver || isActive)
                                    ? "border-current bg-white/50 text-gray-600"
                                    : "border-gray-200 text-gray-400"
                            )}>
                                <span className="text-sm italic">
                                    {isOver ? 'Drop here!' : 'No features'}
                                </span>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    )
}

export function MvpView({ project, initialFeatures }: MvpViewProps) {
    const [features, setFeatures] = useState<MvpFeature[] | null>(initialFeatures)
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeFeature, setActiveFeature] = useState<MvpFeature | null>(null)
    const [activeColumn, setActiveColumn] = useState<FeaturePriority | null>(null)

    // Add Feature State
    const [showAddModal, setShowAddModal] = useState(false)
    const [newFeature, setNewFeature] = useState<{ title: string; description: string; priority: FeaturePriority }>({
        title: '',
        description: '',
        priority: 'must_have'
    })

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleGenerate = async () => {
        setIsGenerating(true)
        const result = await generateMvpScope(project.id, project.idea)
        if (result) {
            setFeatures(result)
        }
        setIsGenerating(false)
    }

    const handleAddFeature = () => {
        if (!newFeature.title.trim()) return

        const feature: MvpFeature = {
            id: `custom-${Date.now()}`,
            title: newFeature.title,
            description: newFeature.description,
            priority: newFeature.priority
        }

        setFeatures(prev => prev ? [...prev, feature] : [feature])
        setShowAddModal(false)
        setNewFeature({ title: '', description: '', priority: 'must_have' })
    }

    const handleDragStart = (event: DragStartEvent) => {
        if (!features) return
        const feature = features.find(f => f.id === event.active.id)
        if (feature) {
            setActiveFeature(feature)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event
        if (!over || !features) {
            setActiveColumn(null)
            return
        }

        // Check if over a column
        const overColumn = columns.find(c => c.id === over.id)
        if (overColumn) {
            setActiveColumn(overColumn.id)
            return
        }

        // Check if over a feature - get its column
        const overFeature = features.find(f => f.id === over.id)
        if (overFeature) {
            setActiveColumn(overFeature.priority)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveFeature(null)
        setActiveColumn(null)

        if (!over || !features) return

        const draggedFeature = features.find(f => f.id === active.id)
        if (!draggedFeature) return

        let newPriority: FeaturePriority | null = null

        // Check if dropped over a column directly
        const overColumn = columns.find(c => c.id === over.id)
        if (overColumn && draggedFeature.priority !== overColumn.id) {
            newPriority = overColumn.id
        }

        // Check if dropped over another feature
        const overFeature = features.find(f => f.id === over.id)
        if (overFeature && draggedFeature.priority !== overFeature.priority) {
            newPriority = overFeature.priority
        }

        // Update local state and persist to database
        if (newPriority) {
            const updatedFeatures = features.map(f =>
                f.id === draggedFeature.id ? { ...f, priority: newPriority } : f
            )
            setFeatures(updatedFeatures)
            
            // Persist to database
            updateMvpFeatures(project.id, updatedFeatures)
        }
    }

    const getFeaturesByPriority = (priority: FeaturePriority) =>
        features?.filter(f => f.priority === priority) || []

    if (!features) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">MVP Scope</h1>
                    <p className="text-gray-600 mt-1">Define what to build now vs later</p>
                </div>

                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Define MVP Features</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Identify the core features needed for your launch and what can wait.
                        </p>
                        <Button onClick={handleGenerate} isLoading={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate Scope'}
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">MVP Scope</h1>
                    <p className="text-gray-600 mt-1">Drag features between columns to reprioritize</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowAddModal(true)}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Feature
                    </Button>
                    <Button variant="secondary" onClick={handleGenerate} isLoading={isGenerating}>
                        Regenerate
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {columns.map(column => (
                        <DroppableColumn
                            key={column.id}
                            column={column}
                            features={getFeaturesByPriority(column.id)}
                            isActive={activeColumn === column.id}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeFeature && (
                        <div className="rotate-2 scale-105 shadow-2xl opacity-90">
                            <FeatureCard feature={activeFeature} isDragging />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add MVP Feature"
                footer={
                    <Button onClick={handleAddFeature} disabled={!newFeature.title.trim()}>
                        Add Feature
                    </Button>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Feature Title"
                        placeholder="e.g. User Authentication"
                        value={newFeature.title}
                        onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                            placeholder="Describe what this feature does..."
                            value={newFeature.description}
                            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <select
                            className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newFeature.priority}
                            onChange={(e) => setNewFeature({ ...newFeature, priority: e.target.value as FeaturePriority })}
                        >
                            <option value="must_have">Must Have</option>
                            <option value="later">Later</option>
                            <option value="not_now">Not Now</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
