'use client'

import React, { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import DiscoveryPanel from '@/components/DiscoveryPanel'
import { supabase } from '@/lib/supabase'
import { Newspaper, Search, Building2, MapPin, ExternalLink, Plus, Linkedin, Lightbulb, Globe, CheckCircle2 } from 'lucide-react'

export default function DiscoveryPage() {
    const [newsLeads, setNewsLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [addingResearch, setAddingResearch] = useState<string | null>(null)
    const [filter, setFilter] = useState('Today')
    const [selectedLead, setSelectedLead] = useState<any>(null)

    const fetchNewsLeads = async () => {
        setLoading(true)

        const now = new Date()
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)

        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        sevenDaysAgo.setHours(0, 0, 0, 0)

        let query = supabase
            .from('decklar_leads_news')
            .select('*, leads_news_metadata(logo_url, status)')
            .order('created_at', { ascending: false })

        if (filter === 'Today') {
            query = query.gte('created_at', todayStart.toISOString())
        } else if (filter === 'Last 7 Days') {
            query = query
                .gte('created_at', sevenDaysAgo.toISOString())
                .lt('created_at', todayStart.toISOString())
        } else if (filter === 'All Time') {
            query = query.lt('created_at', sevenDaysAgo.toISOString())
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching news leads:', error)
        } else {
            // Flatten metadata into each lead
            const enrichedData = (data || []).map(lead => {
                const meta = Array.isArray(lead.leads_news_metadata)
                    ? lead.leads_news_metadata[0]
                    : lead.leads_news_metadata;
                return {
                    ...lead,
                    logo_url: meta?.logo_url || lead.logo_url || null,
                    lead_status: meta?.status || 'discovery',
                    added_to_research: meta?.status === 'research' || meta?.status === 'prospect' || lead.added_to_research
                }
            })
            setNewsLeads(enrichedData)
            if (enrichedData.length > 0 && !selectedLead) {
                setSelectedLead(enrichedData[0])
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchNewsLeads()
    }, [filter])

    // Update selected lead if the list updates and the selected one is in it
    useEffect(() => {
        if (selectedLead && newsLeads.length > 0) {
            const upToDateLead = newsLeads.find(l => l.id === selectedLead.id)
            if (upToDateLead) {
                setSelectedLead(upToDateLead)
            }
        }
    }, [newsLeads])

    const handleAddToResearch = async (leadId: string) => {
        setAddingResearch(leadId)

        // Get the company name for the research queue
        const lead = newsLeads.find(l => l.id === leadId)

        // Optimistic UI Update first
        const updatedLeads = newsLeads.map(l => l.id === leadId ? { ...l, added_to_research: true, lead_status: 'research' } : l)
        setNewsLeads(updatedLeads)

        try {
            // 1. Update leads_news_metadata status
            const { error: metaError } = await supabase
                .from('leads_news_metadata')
                .update({
                    status: 'research',
                    updated_at: new Date().toISOString()
                })
                .eq('lead_id', leadId)

            if (metaError) {
                console.warn('Could not update metadata status:', metaError.message)
            }

            // 2. Insert into research_queue
            const { error: queueError } = await supabase
                .from('research_queue')
                .upsert({
                    news_lead_id: leadId,
                    company_name: lead?.company_name || 'Unknown',
                    research_status: 'queued'
                }, { onConflict: 'news_lead_id' })

            if (queueError) {
                console.warn('Could not add to research queue:', queueError.message)
            }
        } catch (e) {
            console.error(e)
        }

        setTimeout(() => {
            setAddingResearch(null)
        }, 600)
    }

    const filteredLeads = newsLeads.filter(lead =>
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.news_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden' }}>
            <TopBar title="Discovery Feed" />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#f9fafb' }}>

                {/* Left Side - Feed List Container */}
                <div style={{
                    flex: '1',
                    minWidth: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    overflow: 'hidden' // Important for inner scroll
                }}>

                    {/* Fixed Header Area */}
                    <div style={{ padding: '1rem 2rem', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                {['Today', 'Last 7 Days', 'All Time'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '0.5rem 0.85rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            backgroundColor: filter === f ? '#111827' : '#ffffff',
                                            color: filter === f ? '#ffffff' : '#4b5563',
                                            border: '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.02em'
                                        }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable List Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '0 2rem 2rem 2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                                <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #111827', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            </div>
                        ) : filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '0.75rem',
                                        border: selectedLead?.id === lead.id ? '2px solid #111827' : '1px solid #e5e7eb',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedLead?.id === lead.id ? '0 4px 12px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexShrink: 0,
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    {lead.added_to_research && (
                                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
                                            <CheckCircle2 size={16} color="#16a34a" fill="#dcfce7" />
                                        </div>
                                    )}

                                    {/* Card Header - Minimal */}
                                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                backgroundColor: lead.logo_url ? '#ffffff' : '#f3f4f6',
                                                border: '1px solid #e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}>
                                                {lead.logo_url ? (
                                                    <img src={lead.logo_url} alt={lead.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1px' }} />
                                                ) : (
                                                    <Building2 size={12} color="#9ca3af" />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: 800, color: '#111827', fontSize: '0.85rem' }}>{lead.company_name}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 500 }}>• {new Date(lead.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body - Focus on News */}
                                    <div style={{ display: 'flex', padding: '1rem', gap: '1rem', alignItems: 'flex-start' }}>
                                        {lead.news_og_image && (
                                            <div style={{ width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0, border: '1px solid #f3f4f6' }}>
                                                <img src={lead.news_og_image} alt="News" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.3 }}>
                                                {lead.news_headline}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.8rem',
                                                color: '#4b5563',
                                                lineHeight: 1.4,
                                                margin: 0,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {lead.news_summary}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px dashed #ced4da' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569' }}>No signals found</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Detail Panel */}
                <div style={{ width: '450px', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', flexShrink: 0 }}>
                    <DiscoveryPanel
                        leadData={selectedLead}
                        onAddToResearch={handleAddToResearch}
                        addingId={addingResearch}
                    />
                </div>

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
