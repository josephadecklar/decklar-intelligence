import TopBar from '@/components/TopBar'
import CollapsibleSection from '@/components/CollapsibleSection'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

function getScoreColor(score: number): string {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#d97706'
    return '#6b7280'
}

function getHealthBarColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#9ca3af'
}

function getTierStyle(tier: string): React.CSSProperties {
    const t = tier?.toUpperCase() || ''
    if (t === 'ENTERPRISE') return { backgroundColor: '#1e3a8a', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }
    if (t === 'MID-MARKET') return { backgroundColor: '#2563eb', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }
    return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }
}

function getTimeAgo(date: string) {
    if (!date) return 'Unknown'
    const now = new Date()
    const updated = new Date(date)
    const diffHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `Today at ${updated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params
    const companyName = decodeURIComponent(name)

    const { data: customer } = await supabase
        .from('decklar_customers')
        .select('*')
        .eq('company_name', companyName)
        .single()

    if (!customer) {
        notFound()
    }

    const { data: notes } = await supabase
        .from('company_notes')
        .select('*')
        .eq('company_name', companyName)
        .eq('company_type', 'Customer')
        .order('created_at', { ascending: true })

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <TopBar title={customer.company_name} />

            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Back Link */}
                <Link
                    href="/customers"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}
                >
                    <ArrowLeft size={16} />
                    Back to Customers
                </Link>

                {/* Header Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', margin: '0 0 0.75rem' }}>{customer.company_name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span style={getTierStyle(customer.account_tier)}>{customer.account_tier}</span>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{customer.industry}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '100px', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${customer.health_score}%`, backgroundColor: getHealthBarColor(customer.health_score), borderRadius: '9999px' }} />
                                    </div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getScoreColor(customer.health_score) }}>{customer.health_score}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Health</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                    Last updated: {getTimeAgo(customer.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategic Summary Banner */}
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderLeft: '4px solid #22c55e', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📋</span>
                        <div>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', margin: '0 0 0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Strategic Summary</h3>
                            <p style={{ color: '#14532d', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                                {customer.strategic_summary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Intelligence Sections */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <CollapsibleSection title="Latest News" icon="📰" content={customer.latest_news_summary} />
                    <CollapsibleSection title="Funding & Financial Moves" icon="💰" content={customer.funding_or_financial_moves} />
                    <CollapsibleSection title="Leadership Changes" icon="👤" content={customer.leadership_changes} />
                    <CollapsibleSection title="Expansion & New Contracts" icon="📈" content={customer.expansion_or_contracts} />
                    <CollapsibleSection title="Regulatory & Compliance Updates" icon="⚖️" content={customer.regulatory_compliance_updates} />
                </div>

                {/* Notes Section */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} />
                        Team Notes ({notes?.length || 0})
                    </h3>

                    {notes && notes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            {notes.map((note) => (
                                <div key={note.id} style={{ borderLeft: '3px solid #bbf7d0', paddingLeft: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                                            {note.author_name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '0.875rem' }}>{note.author_name}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{getTimeAgo(note.created_at)}</p>
                                        </div>
                                    </div>
                                    <p style={{ color: '#374151', margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>{note.note_text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic', marginBottom: '1.5rem' }}>No team notes yet. Add the first note below.</p>
                    )}

                    {/* Add Note Form */}
                    <div>
                        <textarea
                            placeholder="Add a note..."
                            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            rows={3}
                        />
                        <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
