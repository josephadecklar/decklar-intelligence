'use client'

import React, { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { getProspects, updateProspectMetadata, triggerFlowiseAction } from '@/app/actions/supabase'
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

type Tab = 'enrichment' | 'outreach'

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProspect, setSelectedProspect] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<Tab>('enrichment')

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

    useEffect(() => {
        fetchProspects()
    }, [])

    const filteredProspects = prospects.filter(p =>
        p.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    }

    const handleFlowiseAction = async (type: 'apollo' | 'google' | 'email') => {
        if (!selectedProspect) return

        setIsProcessing(true)
        setProcessStatus(type === 'email' ? 'Generating AI Draft...' : `Searching ${type === 'apollo' ? 'Decision Makers' : 'Company News'}...`)

        try {
            // Placeholders for Chatflow IDs - User will need to provide these
            const chatflowIds = {
                apollo: 'bc2b6f34-1926-444f-801a-853245645645', // Placeholder
                google: 'dc5b6f34-1926-444f-801a-853245645645', // Placeholder
                email: 'ec8b6f34-1926-444f-801a-853245645645'  // Placeholder
            }

            const result = await triggerFlowiseAction(
                selectedProspect.company_name,
                type.toUpperCase(),
                chatflowIds[type]
            )

            // Save to metadata
            const update: any = {}
            if (type === 'apollo') update.decision_makers = result
            if (type === 'google') update.search_intelligence = result
            if (type === 'email') update.ai_email_draft = result

            await updateProspectMetadata(selectedProspect.id, update)

            // Update local state
            setSelectedProspect({
                ...selectedProspect,
                metadata: {
                    ...(selectedProspect.metadata || {}),
                    ...update
                }
            })

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
            <TopBar title="Growth Intelligence & Outreach" />

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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                    {selectedProspect ? (
                        <>
                            {/* Profile Header */}
                            <div style={{ padding: '1.25rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                        {selectedProspect.logo_url
                                            ? <img src={selectedProspect.logo_url} alt={selectedProspect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                            : <span style={{ fontWeight: 900, color: '#3b82f6', fontSize: '1.2rem' }}>{selectedProspect.company_name?.charAt(0)}</span>
                                        }
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{selectedProspect.company_name}</h2>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                            <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Globe size={10} /> Intelligence Active
                                            </span>
                                            {selectedProspect.metadata?.decision_makers && (
                                                <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#ecfdf5', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <CheckCircle size={10} /> Enriched
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => window.open(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(selectedProspect.company_name)}`, '_blank')}
                                            style={{ padding: '0.45rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '0.5rem', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}
                                        >
                                            <Linkedin size={14} color="#0077b5" /> Profiler
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedProspect.company_name + ' contacts email')}`, '_blank')}
                                            style={{ padding: '0.45rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '0.5rem', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}
                                        >
                                            <Search size={14} /> Web
                                        </button>
                                    </div>
                                    {processStatus && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6' }}>{processStatus}</span>}
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div style={{ display: 'flex', padding: '0 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setActiveTab('enrichment')}
                                    style={{
                                        padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 700,
                                        color: activeTab === 'enrichment' ? '#3b82f6' : '#94a3b8',
                                        backgroundColor: 'transparent',
                                        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                        borderBottom: `2px solid ${activeTab === 'enrichment' ? '#3b82f6' : 'transparent'}`,
                                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Zap size={14} /> Lead Enrichment
                                </button>
                                <button
                                    onClick={() => setActiveTab('outreach')}
                                    style={{
                                        padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 700,
                                        color: activeTab === 'outreach' ? '#10b981' : '#94a3b8',
                                        backgroundColor: 'transparent',
                                        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                        borderBottom: `2px solid ${activeTab === 'outreach' ? '#10b981' : 'transparent'}`,
                                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Mail size={14} /> Outreach Architect
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
                                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                                    {activeTab === 'enrichment' ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                                            {/* Apollo Section */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ padding: '0.4rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                                                                <UserSearch size={16} color="#3b82f6" />
                                                            </div>
                                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Apollo Contacts</h3>
                                                        </div>
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleFlowiseAction('apollo')}
                                                            style={{
                                                                padding: '0.4rem 0.75rem', backgroundColor: '#3b82f6', color: 'white',
                                                                borderRadius: '0.4rem', border: 'none', fontWeight: 700, fontSize: '0.75rem',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: isProcessing ? 0.6 : 1
                                                            }}
                                                        >
                                                            {selectedProspect.metadata?.decision_makers ? <RefreshCw size={12} /> : <Sparkles size={12} />}
                                                            {selectedProspect.metadata?.decision_makers ? 'Refresh' : 'Enrich'}
                                                        </button>
                                                    </div>

                                                    <div style={{ minHeight: '150px', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #e2e8f0' }}>
                                                        {selectedProspect.metadata?.decision_makers ? (
                                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#444', lineHeight: 1.5 }}>
                                                                {typeof selectedProspect.metadata.decision_makers === 'string'
                                                                    ? selectedProspect.metadata.decision_makers
                                                                    : JSON.stringify(selectedProspect.metadata.decision_makers, null, 2)
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', paddingTop: '1.5rem' }}>
                                                                <Users size={24} strokeWidth={1} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                                                                <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>No Data</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Google Search Section */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ padding: '0.4rem', backgroundColor: '#fff7ed', borderRadius: '0.5rem' }}>
                                                                <SearchCode size={16} color="#f97316" />
                                                            </div>
                                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Web Intelligence</h3>
                                                        </div>
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleFlowiseAction('google')}
                                                            style={{
                                                                padding: '0.4rem 0.75rem', backgroundColor: '#f97316', color: 'white',
                                                                borderRadius: '0.4rem', border: 'none', fontWeight: 700, fontSize: '0.75rem',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: isProcessing ? 0.6 : 1
                                                            }}
                                                        >
                                                            {selectedProspect.metadata?.search_intelligence ? <RefreshCw size={12} /> : <Globe size={12} />}
                                                            {selectedProspect.metadata?.search_intelligence ? 'Rescan' : 'Scan'}
                                                        </button>
                                                    </div>

                                                    <div style={{ minHeight: '150px', padding: '0.75rem', backgroundColor: '#fffcf9', borderRadius: '0.75rem', border: '1px dashed #fed7aa' }}>
                                                        {selectedProspect.metadata?.search_intelligence ? (
                                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: '#444', lineHeight: 1.5 }}>
                                                                {typeof selectedProspect.metadata.search_intelligence === 'string'
                                                                    ? selectedProspect.metadata.search_intelligence
                                                                    : JSON.stringify(selectedProspect.metadata.search_intelligence, null, 2)
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', paddingTop: '1.5rem' }}>
                                                                <Activity size={24} strokeWidth={1} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                                                                <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>No Signals</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Outreach Architect */
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfdfd' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <div style={{ padding: '0.4rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem' }}>
                                                            <MessageSquare size={16} color="#10b981" />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Pitch Draft</h3>
                                                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>AI-generated based on current signals</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                        {selectedProspect.metadata?.ai_email_draft && (
                                                            <button
                                                                onClick={() => copyToClipboard(selectedProspect.metadata.ai_email_draft)}
                                                                style={{ padding: '0.45rem 0.75rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '0.4rem', color: '#475569', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                            >
                                                                <Copy size={12} /> Copy
                                                            </button>
                                                        )}
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleFlowiseAction('email')}
                                                            style={{
                                                                padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white',
                                                                borderRadius: '0.5rem', border: 'none', fontWeight: 800, fontSize: '0.78rem',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isProcessing ? 0.6 : 1
                                                            }}
                                                        >
                                                            <Sparkles size={14} /> {selectedProspect.metadata?.ai_email_draft ? 'Regenerate' : 'Architect Pitch'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div style={{ padding: '1.5rem' }}>
                                                    {selectedProspect.metadata?.ai_email_draft ? (
                                                        <div style={{
                                                            backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem',
                                                            border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.82rem',
                                                            lineHeight: 1.6, minHeight: '200px', whiteSpace: 'pre-wrap', fontFamily: 'inherit'
                                                        }}>
                                                            {selectedProspect.metadata.ai_email_draft}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
                                                            <Mail size={32} color="#94a3b8" strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569', margin: 0 }}>No Data Drafted</h4>
                                                            <p style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '300px', margin: '0.5rem auto 1.25rem auto' }}>
                                                                Generate a high-converting email draft based on this prospect's signals.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
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
            `}</style>
        </div>
    )
}
