'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui'

interface EditableContentCardProps {
    title: string
    content: string
    onSave: (newContent: string) => void
    isLoading?: boolean
}

// Parse markdown-like formatting to JSX
function renderFormattedText(text: string): React.ReactNode[] {
    if (!text) return []

    // Split by lines first
    const lines = text.split('\n')

    return lines.map((line, lineIndex) => {
        // Process **bold** markers
        const parts: React.ReactNode[] = []
        let remaining = line
        let partIndex = 0

        while (remaining.length > 0) {
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/)

            if (boldMatch && boldMatch.index !== undefined) {
                // Add text before the bold
                if (boldMatch.index > 0) {
                    parts.push(
                        <span key={`${lineIndex}-${partIndex++}`}>
                            {remaining.substring(0, boldMatch.index)}
                        </span>
                    )
                }
                // Add the bold text
                parts.push(
                    <strong key={`${lineIndex}-${partIndex++}`} className="font-semibold text-gray-900">
                        {boldMatch[1]}
                    </strong>
                )
                remaining = remaining.substring(boldMatch.index + boldMatch[0].length)
            } else {
                // No more bold markers, add the rest
                parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining}</span>)
                break
            }
        }

        return (
            <span key={lineIndex}>
                {parts}
                {lineIndex < lines.length - 1 && <br />}
            </span>
        )
    })
}

export function EditableContentCard({ title, content, onSave, isLoading }: EditableContentCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(content)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setEditedContent(content)
    }, [content])

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            // Auto-resize
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [isEditing])

    const handleSave = () => {
        onSave(editedContent)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditedContent(content)
        setIsEditing(false)
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value)
        // Auto-resize
        e.target.style.height = 'auto'
        e.target.style.height = e.target.scrollHeight + 'px'
    }

    return (
        <div className="group">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        aria-label="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        ref={textareaRef}
                        value={editedContent}
                        onChange={handleTextareaChange}
                        className="w-full p-3 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                        placeholder="Enter content..."
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} isLoading={isLoading}>
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-600 leading-relaxed">
                    {renderFormattedText(content)}
                </p>
            )}
        </div>
    )
}
