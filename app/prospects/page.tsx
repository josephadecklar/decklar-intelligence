'use client'

import React, { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import {
    getProspects,
    updateProspectMetadata,
    triggerFlowiseAction,
    getProspectLeads,
    syncProspectLeads,
    updateLeadOutreach
} from '@/app/actions/supabase'
import {
    Search, UserPlus, Clock, FileText, ChevronRight,
    TrendingUp, Target, Users, MapPin, Globe, Linkedin,
    Briefcase, Activity, ShieldCheck, Mail, Phone, ExternalLink,
    Sparkles, Zap, MessageSquare, CheckCircle, Copy, RefreshCw,
    SearchCode, UserSearch
} from 'lucide-react'

/* ══════════════════════════════════════════════════════════════════
   PROSPECTS PAGE (REDESIGN)
   Focus: Enrichment (Apollo/Google) & AI Outreach
   Orchestrated via Flowise
   Data persisted in decklar_prospects.metadata
   ══════════════════════════════════════════════════════════════════ */


export default function ProspectsPage() {
    const [prospects, setProspects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProspect, setSelectedProspect] = useState<any>(null)
    const [selectedLead, setSelectedLead] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [leads, setLeads] = useState<any[]>([])
    const [loadingLeads, setLoadingLeads] = useState(false)

    // Status states
    const [isProcessing, setIsProcessing] = useState(false)
    const [processStatus, setProcessStatus] = useState('')

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

    const fetchLeads = async (prospectId: string) => {
        setLoadingLeads(true)
        try {
            const data = await getProspectLeads(prospectId)
            setLeads(data)
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoadingLeads(false)
        }
    }

    useEffect(() => {
        fetchProspects()
    }, [])

    useEffect(() => {
        if (selectedProspect?.id) {
            fetchLeads(selectedProspect.id)
        } else {
            setLeads([])
        }
    }, [selectedProspect?.id])

    const filteredProspects = prospects.filter(p =>
        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    }

    const handleFlowiseAction = async (type: 'apollo' | 'google' | 'email' | 'leads') => {
        if (!selectedProspect) return

        setIsProcessing(true)
        setProcessStatus(
            type === 'email' ? 'Generating AI Draft...' :
                type === 'leads' ? 'Finding Target Leads...' :
                    `Searching ${type === 'apollo' ? 'Contacts' : 'Company News'}...`
        )

        try {
            let result: any;
            if (type === 'email' && selectedLead) {
                const messageFlowId = 'e4b8a872-5e9d-4d24-9123-7345a9073fa5'
                const messageUrl = `https://supplygraph-staging.decklar.com/api/v1/prediction/${messageFlowId}`

                const payload = JSON.stringify({
                    lead_id: selectedLead.id,
                    company_name: selectedProspect.company_name,
                    contact_details: `Name: ${selectedLead.name}, Snippet: ${selectedLead.snippet || ''}, Location: ${selectedLead.location || ''}`
                });

                result = await triggerFlowiseAction(
                    payload,
                    'EMAIL',
                    undefined,
                    messageUrl
                );

                const leadUrl = selectedLead.linkedin_url || selectedLead.link;

                // 1. Data Extraction: Handle Array responses
                if (Array.isArray(result)) {
                    console.log('Detected Array response from Flowise');
                    // Find the object that matches our lead, or has an outreach_data key
                    const found = result.find(item =>
                        item.linkedin_url === leadUrl ||
                        item.link === leadUrl ||
                        (item.outreach_data && (item.linkedin_url === leadUrl || item.link === leadUrl))
                    );
                    result = found || result[0];
                }

                // 2. Data Extraction: Handle URL-keyed results
                if (result && typeof result === 'object' && result[leadUrl]) {
                    console.log('Detected URL-keyed result, extracting nested data...');
                    result = result[leadUrl];
                }

                // 3. Data Extraction: Ensure we only have the 'outreach_data' part if it's a full lead object
                if (result && typeof result === 'object' && result.outreach_data) {
                    console.log('Detected lead record, extracting outreach_data property...');
                    result = result.outreach_data;
                }

                // Final check: if result is still a string (and not an object), parsing probably failed or it's empty
                if (!result || (typeof result === 'string' && result.trim() === '')) {
                    console.warn('Final result is empty or invalid:', result);
                }

                // Save to the NEW table
                await updateLeadOutreach(selectedProspect.id, leadUrl, result);

                // Update local state
                setLeads(prev => prev.map(l => {
                    if (l.linkedin_url === (selectedLead.linkedin_url || selectedLead.link)) {
                        return { ...l, outreach_data: result };
                    }
                    return l;
                }));

                setSelectedLead({
                    ...selectedLead,
                    outreach_data: result
                });
            } else if (type === 'leads') {
                const leadsUrl = process.env.NEXT_PUBLIC_FLOWISE_LEADS_URL || 'https://supplygraph-staging.decklar.com/api/v1/prediction/692535d4-d1c1-4c90-9766-7f949d01f39d'
                result = await triggerFlowiseAction(
                    selectedProspect.company_name,
                    'LEADS',
                    undefined,
                    leadsUrl
                )

                // Sync to BOTH legacy and NEW table
                await syncProspectLeads(selectedProspect.id, result);

                // Refresh local status
                await fetchLeads(selectedProspect.id);

                setSelectedProspect({
                    ...selectedProspect,
                    leads_data: result
                })
            } else {
                const chatflowIds = {
                    apollo: 'bc2b6f34-1926-444f-801a-853245645645',
                    google: 'dc5b6f34-1926-444f-801a-853245645645'
                }

                result = await triggerFlowiseAction(
                    selectedProspect.company_name,
                    type.toUpperCase(),
                    chatflowIds[type as 'apollo' | 'google']
                )

                const update: any = {}
                if (type === 'apollo') update.decision_makers = result
                if (type === 'google') update.search_intelligence = result

                await updateProspectMetadata(selectedProspect.id, update)

                setSelectedProspect({
                    ...selectedProspect,
                    metadata: {
                        ...(selectedProspect.metadata || {}),
                        ...update
                    }
                })
            }

            setProcessStatus('Updated successfully!')
            setTimeout(() => setProcessStatus(''), 2000)
        } catch (error: any) {
            console.error('Action failed:', error)
            setProcessStatus(`Error: ${error.message}`)
            setTimeout(() => setProcessStatus(''), 5000)
        } finally {
            setIsProcessing(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
            <TopBar
                title={`Prospects ${selectedProspect ? ` / ${selectedProspect.company_name}` : ''}`}
                onBack={selectedProspect ? () => setSelectedProspect(null) : undefined}
            />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* ── Left: Prospects Sidebar ── */}
                <div style={{
                    width: '280px', flexShrink: 0,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    borderRight: '1px solid #e5e7eb', backgroundColor: '#ffffff',
                    zIndex: 10
                }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text" placeholder="Search targets..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                                    fontSize: '0.8rem', borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                                    fontWeight: 500, outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div className="spinner" />
                            </div>
                        ) : filteredProspects.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
                                <Target size={32} color="#cbd5e1" strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', margin: 0 }}>No Targets</h3>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>Add companies to start outreach</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {filteredProspects.map(prospect => {
                                    const isSelected = selectedProspect?.id === prospect.id
                                    return (
                                        <div key={prospect.id}
                                            onClick={() => {
                                                setSelectedProspect(prospect);
                                                setSelectedLead(null);
                                            }}
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
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, overflow: 'hidden'
                                            }}>
                                                {prospect.logo_url
                                                    ? <img src={prospect.logo_url} alt={prospect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
                                                    : <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.85rem' }}>{prospect.company_name?.charAt(0)}</span>
                                                }
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {prospect.company_name}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500, marginTop: '0.15rem' }}>
                                                    {formatDate(prospect.created_at)}
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

                {/* ── Right: Operations Bench ── */}
                <div style={{ flex: 1, display: 'flex', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                    {selectedProspect ? (
                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                            {/* ── Middle: LinkedIn Leads Column ── */}
                            <div style={{
                                width: '450px', flexShrink: 0, display: 'flex', flexDirection: 'column',
                                borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc'
                            }}>
                                {/* Company Header Lite */}
                                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0
                                    }}>
                                        {selectedProspect.logo_url
                                            ? <img src={selectedProspect.logo_url} alt={selectedProspect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
                                            : <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.9rem' }}>{selectedProspect.company_name?.charAt(0)}</span>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProspect.company_name}</h2>
                                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.1rem' }}>
                                            {selectedProspect.metadata?.decision_makers && (
                                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <CheckCircle size={8} /> Enriched
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                            onClick={() => window.open(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(selectedProspect.company_name)}`, '_blank')}
                                            style={{ padding: '0.35rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}
                                            title="LinkedIn Profiler"
                                        >
                                            <Linkedin size={12} color="#0077b5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Leads List Header */}
                                <div style={{ padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={14} color="#64748b" />
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', margin: 0 }}>LinkedIn Leads</h3>
                                        {leads.length > 0 ? (
                                            <span style={{ padding: '0.1rem 0.4rem', backgroundColor: '#f1f5f9', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>
                                                {leads.length} contacts
                                            </span>
                                        ) : null}
                                    </div>
                                    {(() => {
                                        const hasLeads = leads.length > 0;

                                        return (
                                            <button
                                                disabled={hasLeads || isProcessing}
                                                onClick={() => handleFlowiseAction('leads')}
                                                style={{
                                                    padding: '0.35rem 0.62rem',
                                                    backgroundColor: hasLeads ? '#ecfdf5' : '#3b82f6',
                                                    color: hasLeads ? '#059669' : 'white',
                                                    borderRadius: '6px', border: hasLeads ? '1px solid #d1fae5' : 'none', fontWeight: 700, fontSize: '0.62rem',
                                                    cursor: hasLeads ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                    opacity: (isProcessing && !hasLeads) ? 0.6 : 1
                                                }}
                                            >
                                                {hasLeads ? <CheckCircle size={10} /> : isProcessing ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                                {hasLeads ? 'Completed' : 'Find'}
                                            </button>
                                        );
                                    })()}
                                </div>

                                {/* Leads List */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                                    {loadingLeads ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                            <div className="spinner" />
                                        </div>
                                    ) : leads.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {leads.map((lead: any, idx: number) => {
                                                const isLeadSelected = selectedLead?.id === lead.id;
                                                return (
                                                    <div key={lead.id}
                                                        onClick={() => setSelectedLead(lead)}
                                                        className="lead-card"
                                                        style={{
                                                            padding: '0.75rem',
                                                            backgroundColor: isLeadSelected ? '#eff6ff' : '#ffffff',
                                                            borderRadius: '0.75rem',
                                                            border: `1px solid ${isLeadSelected ? '#bfdbfe' : '#eef2f6'}`,
                                                            boxShadow: isLeadSelected ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                                                            transition: 'all 0.15s ease',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.4rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                                                                    {lead.name}
                                                                </h4>
                                                                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginTop: '0.1rem' }}>
                                                                    {lead.title}
                                                                </div>
                                                            </div>
                                                            <Linkedin size={12} color={isLeadSelected ? '#3b82f6' : '#94a3b8'} />
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8' }}>
                                                            <MapPin size={9} strokeWidth={2.5} />
                                                            {lead.location || 'Remote'}
                                                        </div>

                                                        <div style={{
                                                            fontSize: '0.7rem',
                                                            color: '#475569',
                                                            lineHeight: 1.4,
                                                            padding: '0.5rem',
                                                            backgroundColor: isLeadSelected ? '#ffffff' : '#f8fafc',
                                                            borderRadius: '6px',
                                                            border: '1px solid #f1f5f9',
                                                            marginTop: '0.2rem'
                                                        }}>
                                                            {lead.snippet || 'No profile summary available.'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', opacity: 0.6 }}>
                                            <UserSearch size={32} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                                            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>No leads identified yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Right: Outreach / Detail Column ── */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                                {selectedLead ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        {/* Lead Detail Header */}
                                        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedLead.name}</h3>
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', margin: '0.1rem 0 0.5rem 0' }}>{selectedLead.title || selectedLead.role} @ {selectedProspect.company_name}</p>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <span style={{ padding: '0.15rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <MapPin size={9} /> {selectedLead.location}
                                                        </span>
                                                        <a href={selectedLead.linkedin_url || selectedLead.link} target="_blank" rel="noopener noreferrer" style={{ padding: '0.15rem 0.5rem', backgroundColor: '#eff6ff', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                                                            <Linkedin size={9} fill="currentColor" /> Profile
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outreach Engine Section */}
                                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                                            {/* Section Header Card */}
                                            <div style={{
                                                padding: '1rem 1.25rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '1rem',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                marginBottom: '1.25rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div style={{ padding: '0.4rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                                                        <MessageSquare size={16} color="#10b981" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Outreach Agent</h3>
                                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0 }}>AI-generated pitch for {selectedLead.name.split(' ')[0]}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        disabled={isProcessing}
                                                        onClick={() => handleFlowiseAction('email')}
                                                        style={{
                                                            padding: '0.35rem 0.7rem', backgroundColor: '#10b981', color: 'white',
                                                            borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.7rem',
                                                            lineHeight: 1,
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isProcessing ? 0.6 : 1
                                                        }}
                                                    >
                                                        <Sparkles size={12} /> {selectedLead.outreach_data || selectedLead.outreach ? 'Regenerate' : 'Generate Message'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                {(() => {
                                                    // Strategy: Try individual row data first, then fallback to nested object in current lead
                                                    const outreach = selectedLead.outreach_data || selectedLead.outreach;

                                                    if (!outreach || (!outreach.linkedin && !outreach.email && !outreach.li_msg_1)) {
                                                        return (
                                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '3.5rem 1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                                <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '50%', marginBottom: '1.25rem' }}>
                                                                    <Mail size={28} color="#94a3b8" strokeWidth={1.5} />
                                                                </div>
                                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Generate Draft</h4>
                                                                <p style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '280px', margin: '0.6rem auto 0' }}>
                                                                    Create high-converting LinkedIn & Email variations tailored for this contact.
                                                                </p>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                            {/* LinkedIn Variations Box */}
                                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                                                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fdfdfd' }}>
                                                                    <Linkedin size={14} fill="#0077b5" color="#0077b5" />
                                                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LinkedIn Agent</h4>
                                                                </div>
                                                                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                    {[1, 2, 3].map((v) => {
                                                                        const varData = (outreach.linkedin as any)?.[`variation_${v}`] || {
                                                                            tone: (outreach as any)?.[`li_tone_${v}`] || '',
                                                                            message: (outreach as any)?.[`li_msg_${v}`]
                                                                        };
                                                                        if (!varData.message) return null;
                                                                        return (
                                                                            <div key={`li-${v}`} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
                                                                                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fdfdfd', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b' }}>VARIATION {v} {varData.tone && <span style={{ color: '#3b82f6', marginLeft: '0.4rem' }}>• {varData.tone.toUpperCase()}</span>}</span>
                                                                                    <button onClick={() => copyToClipboard(varData.message)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }} title="Copy message"><Copy size={10} /></button>
                                                                                </div>
                                                                                <div style={{ padding: '0.75rem', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{varData.message}</div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Email Variations Box */}
                                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                                                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fdfdfd' }}>
                                                                    <Mail size={14} color="#ea4335" />
                                                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Agent</h4>
                                                                </div>
                                                                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                    {[1, 2].map((v) => {
                                                                        const varData = (outreach.email as any)?.[`variation_${v}`] || {
                                                                            tone: (outreach as any)?.[`email_tone_${v}`] || '',
                                                                            subject: (outreach as any)?.[`email_subject_${v}`],
                                                                            body: (outreach as any)?.[`email_body_${v}`]
                                                                        };
                                                                        if (!varData.body) return null;
                                                                        return (
                                                                            <div key={`email-${v}`} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
                                                                                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fdfdfd', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b' }}>VARIATION {v} {varData.tone && <span style={{ color: '#ef4444', marginLeft: '0.4rem' }}>• {varData.tone.toUpperCase()}</span>}</span>
                                                                                    <button onClick={() => copyToClipboard(`Subject: ${varData.subject}\n\n${varData.body}`)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }} title="Copy email"><Copy size={10} /></button>
                                                                                </div>
                                                                                <div style={{ padding: '0.75rem', borderBottom: '1px dashed #e2e8f0' }}>
                                                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.2rem' }}>SUBJECT:</div>
                                                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b' }}>{varData.subject}</div>
                                                                                </div>
                                                                                <div style={{ padding: '0.75rem', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{varData.body}</div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                                        <MessageSquare size={32} color="#cbd5e1" strokeWidth={1} style={{ marginBottom: '1rem' }} />
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b', margin: 0 }}>Outreach Architect</h3>
                                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', maxWidth: '240px' }}>
                                            Select a contact from the LinkedIn leads list to generate a personalized outreach message.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '2rem', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <Briefcase size={32} color="#cbd5e1" strokeWidth={1} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Operations Bench</h3>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', maxWidth: '320px' }}>
                                Select a target account to begin enrichment and architecture.
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
                input:focus {
                    background-color: #ffffff !important;
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
                }
                .lead-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1) !important;
                    border-color: #bfdbfe !important;
                }
                .view-profile-btn:hover {
                    background-color: #2563eb !important;
                    color: white !important;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div >
    )
}
