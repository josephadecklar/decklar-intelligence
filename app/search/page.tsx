'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Link from 'next/link'
import { Search, Building2, MapPin, ArrowRight } from 'lucide-react'
import { searchCompanies } from '@/app/actions/supabase'

function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState(query)
    const router = useRouter()

    useEffect(() => {
        if (query) {
            handleSearch(query)
        } else {
            setResults([])
        }
    }, [query])

    const handleSearch = async (q: string) => {
        setLoading(true)
        try {
            const combined = await searchCompanies(q)
            setResults(combined)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={24} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter company name..."
                            style={{
                                width: '100%',
                                padding: '1.25rem 1.125rem 1.25rem 3.5rem',
                                fontSize: '1.125rem',
                                borderRadius: '1rem',
                                border: '2px solid #e5e7eb',
                                outline: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#0284c7'
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(2, 132, 199, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb'
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    </div>
                </form>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #0284c7', borderRadius: '50%', display: 'inline-block', animation: 'spin 1.1s linear infinite' }} />
                        <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1.125rem' }}>Searching the intelligence platform...</p>
                    </div>
                ) : query ? (
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
                            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.map((result) => (
                                <Link
                                    key={`${result.type}-${result.id}`}
                                    href={`/${result.type.toLowerCase()}s/${encodeURIComponent(result.company_name)}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1.25rem',
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '1rem',
                                        textDecoration: 'none',
                                        gap: '1.5rem',
                                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: result.logo_url ? '#ffffff' : (result.type === 'Prospect' ? '#f0f9ff' : '#ecfdf5'),
                                        border: result.logo_url ? '1px solid #e5e7eb' : 'none',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: result.type === 'Prospect' ? '#0284c7' : '#16a34a',
                                        flexShrink: 0,
                                        overflow: 'hidden'
                                    }}>
                                        {result.logo_url ? (
                                            <img
                                                src={result.logo_url}
                                                alt={result.company_name}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.style.backgroundColor = result.type === 'Prospect' ? '#f0f9ff' : '#ecfdf5';
                                                        parent.innerHTML = '<div style="font-weight: 700; font-size: 1.25rem">' + result.company_name.charAt(0) + '</div>';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{result.company_name.charAt(0)}</div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>{result.company_name}</h3>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '9999px',
                                                backgroundColor: result.type === 'Prospect' ? '#dbeafe' : '#dcfce7',
                                                color: result.type === 'Prospect' ? '#1e40af' : '#166534',
                                                textTransform: 'uppercase'
                                            }}>
                                                {result.type}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <MapPin size={14} />
                                                {(() => {
                                                    const loc = result.location;
                                                    if (!loc) return "USA";
                                                    const parts = loc.split(',').map((p: string) => p.trim());
                                                    const lastPart = parts[parts.length - 1];
                                                    if (lastPart.length === 2 && lastPart === lastPart.toUpperCase()) return "USA";
                                                    if (["US", "USA", "United States"].includes(lastPart)) return "USA";
                                                    return lastPart;
                                                })()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <Building2 size={14} /> {result.industry}
                                            </span>
                                            <span style={{ fontWeight: 600, color: '#111827' }}>
                                                {result.type === 'Prospect' ? 'Lead Score' : 'Health Score'}: {result.score}
                                            </span>
                                        </div>
                                    </div>

                                    <ArrowRight size={20} style={{ color: '#9ca3af' }} />
                                </Link>
                            ))}

                            {results.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed #d1d5db' }}>
                                    <p style={{ color: '#6b7280', margin: 0 }}>No companies found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Search the Platform</h3>
                        <p style={{ color: '#6b7280', margin: 0 }}>Find prospects and customers across your entire territory.</p>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default function SearchPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <TopBar title="Search" />
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    )
}
