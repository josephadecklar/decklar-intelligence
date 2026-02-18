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

function getScoreDotColor(score: number): string {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#9ca3af'
}

function getRecommendationLabel(recommendation: string): string {
    const r = recommendation?.toLowerCase() || ''
    if (r.includes('high')) return 'High Priority'
    if (r.includes('medium') || r.includes('mid')) return 'Medium Priority'
    return 'Low Priority'
}

function getRecommendationStyle(recommendation: string): React.CSSProperties {
    const r = recommendation?.toLowerCase() || ''
    if (r.includes('high')) return { backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }
    if (r.includes('medium') || r.includes('mid')) return { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }
    return { backgroundColor: '#f3f4f6', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }
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

export default async function ProspectDetailPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params
    const companyName = decodeURIComponent(name)

    // Fetch from JOIN to get metadata (logo, etc)
    const { data: metadata } = await supabase
        .from('research_metadata')
        .select('*, company_research!inner(*)')
        .eq('company_research.company_name', companyName)
        .single()

    if (!metadata) {
        // Try direct fetch in case metadata trigger hasn't fired yet for some random reason
        const { data: fallback } = await supabase
            .from('company_research')
            .select('*')
            .eq('company_name', companyName)
            .single()

        if (!fallback) notFound()

        // Use fallback if metadata missing
        var prospect = fallback;
        var logoUrl = null;
        var updatedAt = fallback.updated_at || fallback.created_at;
    } else {
        var prospect = metadata.company_research;
        var logoUrl = metadata.logo_url;
        var updatedAt = metadata.updated_at;
    }

    const { data: notes } = await supabase
        .from('company_notes')
        .select('*')
        .eq('company_name', companyName)
        .eq('company_type', 'Prospect')
        .order('created_at', { ascending: true })

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <TopBar title={prospect.company_name} />

            <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Back Link */}
                <Link
                    href="/prospects"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}
                >
                    <ArrowLeft size={16} />
                    Back to Prospects
                </Link>

                {/* Header Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: logoUrl ? '#ffffff' : '#f3f4f6',
                            border: logoUrl ? '1px solid #e5e7eb' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt={prospect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                            ) : (
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#9ca3af' }}>{prospect.company_name.charAt(0)}</span>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', margin: '0 0 0.75rem' }}>{prospect.company_name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getScoreDotColor(prospect.lead_score) }} />
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(prospect.lead_score) }}>{prospect.lead_score}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Lead Score</span>
                                </div>
                                <span style={getRecommendationStyle(prospect.lead_recommendation)}>
                                    {getRecommendationLabel(prospect.lead_recommendation)}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                    Last updated: {getTimeAgo(updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Hook Banner */}
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', borderLeft: '4px solid #0284c7', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>💡</span>
                        <div>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', margin: '0 0 0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sales Hook</h3>
                            <p style={{ color: '#1e3a8a', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                                {prospect.summary_for_sales}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Intelligence Sections */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <CollapsibleSection title="Company Overview" icon="🏢" content={prospect.company_overview} />
                    <CollapsibleSection title="Decision Maker Roles" icon="👤" content={prospect.decision_maker_roles} />
                    <CollapsibleSection title="Visibility Pain Points" icon="⚠️" content={prospect.visibility_pain_points} />
                    <CollapsibleSection title="Technology & Logistics Needs" icon="⚙️" content={prospect.technology_and_logistics_needs} />
                    <CollapsibleSection title="Supply Chain Profile" icon="🔗" content={prospect.supply_chain_profile} />
                    <CollapsibleSection title="Operational Scale" icon="📏" content={prospect.operational_scale} />
                    <CollapsibleSection title="Financial Profile" icon="💰" content={prospect.financial_profile} />
                    <CollapsibleSection title="Growth & Initiatives" icon="📈" content={prospect.growth_and_initiatives} />
                    <CollapsibleSection title="Risk Factors" icon="🛡️" content={prospect.risk_factors} />
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
                                <div key={note.id} style={{ borderLeft: '3px solid #bfdbfe', paddingLeft: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
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
                        <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#0284c7', color: 'white', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
