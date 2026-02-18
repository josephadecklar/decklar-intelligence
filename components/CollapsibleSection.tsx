'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface SectionProps {
    title: string
    icon: string
    content: string
    defaultOpen?: boolean
}

export default function CollapsibleSection({ title, icon, content, defaultOpen = true }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div style={{ borderBottom: '1px solid #f3f4f6' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronDown size={18} style={{ color: '#9ca3af', flexShrink: 0 }} />
                ) : (
                    <ChevronRight size={18} style={{ color: '#9ca3af', flexShrink: 0 }} />
                )}
            </button>

            {isOpen && (
                <div style={{ padding: '0 1.5rem 1.25rem' }}>
                    <p style={{ color: '#374151', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                        {content}
                    </p>
                </div>
            )}
        </div>
    )
}
