'use client'

import React, { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { getProspects, getDeepResearchData } from '@/app/actions/supabase'
import { supabase } from '@/lib/supabase'
import {
    Search, UserPlus, Clock, FileText, ChevronRight,
    TrendingUp, Target, Users, MapPin, Globe, Linkedin,
    Briefcase, Activity, ShieldCheck, Mail, Phone, ExternalLink
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   PROSPECTS PAGE
   Similar layout to Research page: Sidebar List + Content Area
══════════════════════════════════════════════════════════════════ */
export default function ProspectsPage() {
    const [prospects, setProspects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProspect, setSelectedProspect] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [deepResearch, setDeepResearch] = useState<any>(null)
    const [isResearchLoading, setIsResearchLoading] = useState(false)

    const fetchProspects = async () => {
        setLoading(true)
        try {
            const data = await getProspects()
            setProspects(data)
            if (data.length > 0 && !selectedProspect) {
                setSelectedProspect(data[0])
            }
        } catch (error) {
            console.error('Error fetching prospects:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProspects()
    }, [])

    useEffect(() => {
        if (!selectedProspect) {
            setDeepResearch(null)
            return
        }

        async function fetchDeepResearchBatch() {
            setIsResearchLoading(true)
            try {
                const data = await getDeepResearchData(selectedProspect.company_name)
                setDeepResearch(data)
            } catch (error) {
                console.error('Error fetching deep research:', error)
                setDeepResearch(null)
            } finally {
                setIsResearchLoading(false)
            }
        }

        fetchDeepResearchBatch()
    }, [selectedProspect])

    const filteredProspects = prospects.filter(p =>
        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    }

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden' }}>
            <TopBar title="Sales Prospects" />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#f9fafb' }}>

                {/* ── Left: Prospects List ── */}
                <div style={{
                    width: '300px', flexShrink: 0,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    borderRight: '1px solid #e5e7eb', backgroundColor: '#ffffff'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text" placeholder="Search prospects..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                                    fontSize: '0.85rem', borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                                    fontWeight: 500, outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                            {filteredProspects.length} Active {filteredProspects.length === 1 ? 'Prospect' : 'Prospects'}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div className="spinner" />
                            </div>
                        ) : filteredProspects.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem', textAlign: 'center', color: '#9ca3af' }}>
                                <UserPlus size={40} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>No prospects found</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Add companies from the Research page</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {filteredProspects.map(prospect => {
                                    const isSelected = selectedProspect?.id === prospect.id
                                    return (
                                        <div key={prospect.id}
                                            onClick={() => setSelectedProspect(prospect)}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                                borderRadius: '0.6rem', cursor: 'pointer',
                                                border: `1px solid ${isSelected ? '#bfdbfe' : 'transparent'}`,
                                                transition: 'all 0.15s',
                                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                                            }}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc' }}
                                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff' }}
                                        >
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '8px',
                                                backgroundColor: prospect.logo_url ? '#ffffff' : '#f3f4f6',
                                                border: '1px solid #e5e7eb',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, fontWeight: 800, fontSize: '0.9rem',
                                                color: '#3b82f6', overflow: 'hidden'
                                            }}>
                                                {prospect.logo_url
                                                    ? <img src={prospect.logo_url} alt={prospect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                                                    : prospect.company_name?.charAt(0)?.toUpperCase() || '?'
                                                }
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {prospect.company_name}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Clock size={10} /> {formatDate(prospect.created_at)}
                                                </div>
                                            </div>
                                            <ChevronRight size={14} color={isSelected ? '#3b82f6' : '#cbd5e1'} />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Prospect Detail Area ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                    {selectedProspect ? (
                        <>
                            {/* Header */}
                            <div style={{ padding: '1.5rem 2.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '12px',
                                            backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '1.4rem', color: '#1e293b', overflow: 'hidden',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {selectedProspect.logo_url
                                                ? <img src={selectedProspect.logo_url} alt={selectedProspect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                                : selectedProspect.company_name?.charAt(0)?.toUpperCase() || '?'
                                            }
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedProspect.company_name}</h2>
                                                {deepResearch?.lead_score && (
                                                    <div style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                                                        {deepResearch.lead_score} Lead Score
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                                                    <MapPin size={14} /> {deepResearch?.location || 'Global'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                                                    <TrendingUp size={14} /> Growth: Strong
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button style={{
                                            padding: '0.6rem 1.25rem', backgroundColor: '#3b82f6', color: '#ffffff',
                                            border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                                        }}>
                                            <Mail size={16} /> Contact Lead
                                        </button>
                                        <button style={{
                                            padding: '0.6rem 1.25rem', backgroundColor: '#ffffff', color: '#1e293b',
                                            border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                                        }}>
                                            <Briefcase size={16} /> Log Activity
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                                    {/* Left Column: Intelligence */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                        {/* Sales Strategy Section */}
                                        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                            <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Target size={20} color="#3b82f6" />
                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Strategic Sales Outreach</h3>
                                            </div>
                                            <div style={{ padding: '1.5rem' }}>
                                                {deepResearch ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>The "Why Now" Hook</div>
                                                            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                                                                {deepResearch.outreach_angle || "Focus on recent operational expansion and the need for scalable logistics infrastructure."}
                                                            </p>
                                                        </div>
                                                        <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #dbeafe' }}>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Decklar Value Prop</div>
                                                            <p style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                                                                {deepResearch.lead_recommendation || "Position Decklar as the bridge for their cross-border shipping blind spots."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                                                        <Activity size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                                                        <p style={{ fontSize: '0.85rem' }}>Deep research pending. Run research to see strategy hooks.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Company Context */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <Activity size={18} color="#059669" />
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Operations</h4>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                                                    {deepResearch?.visibility_pain_points || "Historical data indicates fragmented visibility across regional distribution centers."}
                                                </div>
                                            </div>
                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <TrendingUp size={18} color="#d97706" />
                                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Growth Path</h4>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                                                    {deepResearch?.growth_and_initiatives || "Multiple new facility openings planned across the Mid-West corridor by Q3."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Key People & Info */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                        {/* Decision Makers */}
                                        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} /> Key Decision Makers
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {deepResearch?.decision_maker_roles ? (
                                                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                                                        {deepResearch.decision_maker_roles}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f9fafb', border: '1px solid #f1f5f9' }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b' }}>VP of Logistics</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Technical Buyer</div>
                                                        </div>
                                                        <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f9fafb', border: '1px solid #f1f5f9' }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b' }}>Supply Chain Director</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Process Champion</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Links */}
                                        <div style={{ backgroundColor: '#1e293b', borderRadius: '1rem', padding: '1.25rem', color: '#ffffff' }}>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase' }}>Resources</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                <button style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem',
                                                    backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.4rem',
                                                    color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                                                }}>
                                                    <Globe size={14} /> Official Website
                                                </button>
                                                <button style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem',
                                                    backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.4rem',
                                                    color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                                                }}>
                                                    <Linkedin size={14} /> LinkedIn Company Page
                                                </button>
                                                <button style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem',
                                                    backgroundColor: 'rgba(59,130,246,0.2)', border: 'none', borderRadius: '0.4rem',
                                                    color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                                                }}>
                                                    <ShieldCheck size={14} /> Compliance Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', padding: '2rem', textAlign: 'center' }}>
                            <FileText size={48} strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: 0 }}>Select a Prospect</h3>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', maxWidth: '300px' }}>
                                Choose a company from the left to view deep sales insights and strategic hooks.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #f3f4f6;
                    border-top: 2px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
