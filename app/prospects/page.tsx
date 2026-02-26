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
                    width: '320px', flexShrink: 0,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    borderRight: '1px solid #e5e7eb', backgroundColor: '#ffffff',
                    boxShadow: '4px 0 12px rgba(0,0,0,0.03)', zIndex: 10
                }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text" placeholder="Search target companies..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
                                    fontSize: '0.9rem', borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
                                    fontWeight: 500, outline: 'none', transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div className="spinner" />
                            </div>
                        ) : filteredProspects.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Target size={32} color="#94a3b8" strokeWidth={1} />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', margin: 0 }}>No Targets Found</h3>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Add companies from Discovery or Research to start outreach</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {filteredProspects.map(prospect => {
                                    const isSelected = selectedProspect?.id === prospect.id
                                    return (
                                        <div key={prospect.id}
                                            onClick={() => setSelectedProspect(prospect)}
                                            style={{
                                                padding: '1rem',
                                                backgroundColor: isSelected ? '#3b82f6' : '#ffffff',
                                                borderRadius: '0.75rem', cursor: 'pointer',
                                                boxShadow: isSelected ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                                                border: `1px solid ${isSelected ? '#2563eb' : '#f1f5f9'}`,
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '1rem'
                                            }}
                                        >
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '10px',
                                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#ffffff',
                                                border: `1px solid ${isSelected ? 'transparent' : '#e2e8f0'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, overflow: 'hidden'
                                            }}>
                                                {prospect.logo_url
                                                    ? <img src={prospect.logo_url} alt={prospect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                                    : <span style={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#3b82f6', fontSize: '1.1rem' }}>{prospect.company_name?.charAt(0)}</span>
                                                }
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#ffffff' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {prospect.company_name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748b', fontWeight: 500, marginTop: '0.2rem' }}>
                                                    Targeted: {formatDate(prospect.created_at)}
                                                </div>
                                            </div>
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
                            <div style={{ padding: '2rem 3rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '72px', height: '72px', borderRadius: '16px',
                                        backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden'
                                    }}>
                                        {selectedProspect.logo_url
                                            ? <img src={selectedProspect.logo_url} alt={selectedProspect.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                                            : <span style={{ fontWeight: 900, color: '#3b82f6', fontSize: '1.8rem' }}>{selectedProspect.company_name?.charAt(0)}</span>
                                        }
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{selectedProspect.company_name}</h2>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                            <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Globe size={12} /> External Intelligence
                                            </span>
                                            {selectedProspect.metadata?.decision_makers && (
                                                <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#ecfdf5', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <CheckCircle size={12} /> Apollo Enriched
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => window.open(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(selectedProspect.company_name)}`, '_blank')}
                                            style={{ padding: '0.6rem 1rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '0.6rem', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <Linkedin size={16} color="#0077b5" /> Profiler
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedProspect.company_name + ' contacts email')}`, '_blank')}
                                            style={{ padding: '0.6rem 1rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '0.6rem', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <Search size={16} /> Deep Web
                                        </button>
                                    </div>
                                    {processStatus && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>{processStatus}</span>}
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div style={{ display: 'flex', padding: '0 3rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setActiveTab('enrichment')}
                                    style={{
                                        padding: '1.25rem 2rem', fontSize: '0.9rem', fontWeight: 700,
                                        color: activeTab === 'enrichment' ? '#3b82f6' : '#94a3b8',
                                        borderBottom: `2px solid ${activeTab === 'enrichment' ? '#3b82f6' : 'transparent'}`,
                                        backgroundColor: 'transparent', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.6rem'
                                    }}
                                >
                                    <Zap size={18} /> Lead Enrichment
                                </button>
                                <button
                                    onClick={() => setActiveTab('outreach')}
                                    style={{
                                        padding: '1.25rem 2rem', fontSize: '0.9rem', fontWeight: 700,
                                        color: activeTab === 'outreach' ? '#10b981' : '#94a3b8',
                                        borderBottom: `2px solid ${activeTab === 'outreach' ? '#10b981' : 'transparent'}`,
                                        backgroundColor: 'transparent', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.6rem'
                                    }}
                                >
                                    <Mail size={18} /> AI Outreach Architect
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3rem' }}>
                                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                                    {activeTab === 'enrichment' ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                            {/* Apollo Section */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem' }}>
                                                                <UserSearch size={20} color="#3b82f6" />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Apollo.io Contacts</h3>
                                                        </div>
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleFlowiseAction('apollo')}
                                                            style={{
                                                                padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white',
                                                                borderRadius: '0.5rem', border: 'none', fontWeight: 700, fontSize: '0.8rem',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isProcessing ? 0.6 : 1
                                                            }}
                                                        >
                                                            {selectedProspect.metadata?.decision_makers ? <RefreshCw size={14} /> : <Sparkles size={14} />}
                                                            {selectedProspect.metadata?.decision_makers ? 'Refresh' : 'Enrich Now'}
                                                        </button>
                                                    </div>

                                                    <div style={{ minHeight: '200px', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #e2e8f0' }}>
                                                        {selectedProspect.metadata?.decision_makers ? (
                                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>
                                                                {typeof selectedProspect.metadata.decision_makers === 'string'
                                                                    ? selectedProspect.metadata.decision_makers
                                                                    : JSON.stringify(selectedProspect.metadata.decision_makers, null, 2)
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', paddingTop: '2rem' }}>
                                                                <Users size={32} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                                                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No Decision Makers Found</p>
                                                                <p style={{ fontSize: '0.75rem' }}>Run Apollo enrichment to pull contact data</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Google Search Section */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ padding: '0.5rem', backgroundColor: '#fff7ed', borderRadius: '0.75rem' }}>
                                                                <SearchCode size={20} color="#f97316" />
                                                            </div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Web Intelligence</h3>
                                                        </div>
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleFlowiseAction('google')}
                                                            style={{
                                                                padding: '0.5rem 1rem', backgroundColor: '#f97316', color: 'white',
                                                                borderRadius: '0.5rem', border: 'none', fontWeight: 700, fontSize: '0.8rem',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: isProcessing ? 0.6 : 1
                                                            }}
                                                        >
                                                            {selectedProspect.metadata?.search_intelligence ? <RefreshCw size={14} /> : <Globe size={14} />}
                                                            {selectedProspect.metadata?.search_intelligence ? 'Rescan' : 'Start Scan'}
                                                        </button>
                                                    </div>

                                                    <div style={{ minHeight: '200px', padding: '1rem', backgroundColor: '#fffcf9', borderRadius: '1rem', border: '1px dashed #fed7aa' }}>
                                                        {selectedProspect.metadata?.search_intelligence ? (
                                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>
                                                                {typeof selectedProspect.metadata.search_intelligence === 'string'
                                                                    ? selectedProspect.metadata.search_intelligence
                                                                    : JSON.stringify(selectedProspect.metadata.search_intelligence, null, 2)
                                                                }
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', paddingTop: '2rem' }}>
                                                                <Activity size={32} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                                                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No Web Signals Found</p>
                                                                <p style={{ fontSize: '0.75rem' }}>Run Google Custom Search for latest triggers</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Outreach Architect */
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdfdfd' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', borderRadius: '0.75rem' }}>
                                                            <MessageSquare size={20} color="#10b981" />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Personalized Pitch Draft</h3>
                                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Using intelligence from Apollo & Search</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        {selectedProspect.metadata?.ai_email_draft && (
                                                            <button
                                                                onClick={() => copyToClipboard(selectedProspect.metadata.ai_email_draft)}
                                                                style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '0.5rem', color: '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                            >
                                                                <Copy size={14} /> Copy Body
                                                            </button>
                                                        )}
                                                        <button
                                                            disabled={isProcessing}
                                                            onClick={() => handleFlowiseAction('email')}
                                                            style={{
                                                                padding: '0.6rem 1.25rem', backgroundColor: '#10b981', color: 'white',
                                                                borderRadius: '0.6rem', border: 'none', fontWeight: 800, fontSize: '0.85rem',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isProcessing ? 0.6 : 1,
                                                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                                                            }}
                                                        >
                                                            <Sparkles size={16} /> {selectedProspect.metadata?.ai_email_draft ? 'Regenerate Email' : 'Architect Pitch Email'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div style={{ padding: '2.5rem' }}>
                                                    {selectedProspect.metadata?.ai_email_draft ? (
                                                        <div style={{
                                                            backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '1rem',
                                                            border: '1px solid #e2e8f0', color: '#334155', fontSize: '1rem',
                                                            lineHeight: 1.7, minHeight: '300px', whiteSpace: 'pre-wrap', fontFamily: 'inherit'
                                                        }}>
                                                            {selectedProspect.metadata.ai_email_draft}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                                                            <Mail size={48} color="#94a3b8" strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#475569' }}>Drafting Room Still Empty</h4>
                                                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '400px', margin: '0.75rem auto 1.5rem auto' }}>
                                                                Kickstart your outreach by generating a high-converting, personalized email draft based on this prospect's specific signals.
                                                            </p>
                                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                                                    <Zap size={14} color="#3b82f6" fill="#3b82f6" /> 1-Click Generation
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                                                    <Target size={14} color="#f97316" fill="#f97316" /> News-Aligned Content
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {selectedProspect.metadata?.ai_email_draft && (
                                                    <div style={{ padding: '1.25rem 2rem', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                                                            Tip: AI models perform best when you have enriched the lead with News & Decision Maker data first.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#ffffff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                                <Briefcase size={40} color="#cbd5e1" strokeWidth={1} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Operations Command Center</h3>
                            <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.75rem', maxWidth: '380px', lineHeight: 1.5 }}>
                                Select a target account from your list to begin deep enrichment and architect your outreach strategy.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid #3b82f6;
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
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    )
}
