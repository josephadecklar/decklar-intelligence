'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TopBar({ title }: { title: string }) {
    const [lastUpdate, setLastUpdate] = useState<string>('')
    const router = useRouter()

    useEffect(() => {
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        setLastUpdate(`Today at ${timeString}`)
    }, [])

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const q = formData.get('search') as string
        if (q?.trim()) {
            router.push(`/search?q=${encodeURIComponent(q.trim())}`)
        }
    }

    return (
        <div style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
        }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Search */}
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <Search size={16} style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                    }} />
                    <input
                        name="search"
                        type="text"
                        placeholder="Search companies..."
                        style={{
                            paddingLeft: '2.25rem',
                            paddingRight: '1rem',
                            paddingTop: '0.5rem',
                            paddingBottom: '0.5rem',
                            width: '280px',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                            color: '#374151',
                        }}
                    />
                </form>

                {/* Last Update Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                    }} />
                    <span>Last AI update: {lastUpdate}</span>
                </div>
            </div>
        </div>
    )
}
