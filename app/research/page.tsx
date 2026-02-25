'use client'

import React, { useState, useEffect } from 'react'

import TopBar from '@/components/TopBar'
import {
    getResearchQueue,
    getDeepResearchData,
    getCompanyNews,
    checkProspectStatusAction,
    updateResearchStatus,
    removeFromResearch,
    addToProspectsAction
} from '@/app/actions/supabase'
import { supabase } from '@/lib/supabase'
import DeepResearchPanel from './DeepResearchPanel'
import {
    Search, Trash2, FlaskConical, Clock, FileText, Beaker,
    ExternalLink, Newspaper, MapPin, ChevronRight, UserPlus, Check
} from 'lucide-react'



/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function ResearchPage() {
    const [researchQueue, setResearchQueue] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'queued' | 'completed'>('all')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'research' | 'news'>('research')
    const [hasResearchData, setHasResearchData] = useState(false)
    const [deepResearchData, setDeepResearchData] = useState<any>(null)
    const [isResearchLoading, setIsResearchLoading] = useState(false)
    const [isProspect, setIsProspect] = useState(false)
    const [isAddingProspect, setIsAddingProspect] = useState(false)
    const [companyNews, setCompanyNews] = useState<any[]>([])

    const fetchResearchQueue = async () => {
        setLoading(true)
        try {
            const data = await getResearchQueue()
            setResearchQueue(data)
        } catch (error) {
            console.error('Error fetching research queue:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchResearchQueue() }, [])

    // Handle initial selection (from query param or default to first item)
    useEffect(() => {
        if (loading || researchQueue.length === 0) return

        const params = new URLSearchParams(window.location.search)
        const companyParam = params.get('company')

        if (companyParam) {
            // Priority 1: Select matching company from query param
            const match = researchQueue.find(
                (q: any) => q.company_name?.toLowerCase() === companyParam.toLowerCase()
            )
            if (match) {
                setSelectedItem(match)
            } else {
                // If not in queue, create a synthetic item for the deep research fetch
                setSelectedItem({ company_name: companyParam, id: null, _synthetic: true })
            }
        } else if (!selectedItem) {
            // Priority 2: Default to first item if nothing selected yet
            setSelectedItem(researchQueue[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, researchQueue])

    // Check and fetch deep research data for the selected company
    useEffect(() => {
        if (!selectedItem) {
            setHasResearchData(false)
            setDeepResearchData(null)
            return
        }

        async function fetchDeepResearch() {
            setIsResearchLoading(true)
            try {
                const data = await getDeepResearchData(selectedItem.company_name)
                if (data) {
                    setHasResearchData(true)
                    setDeepResearchData(data)
                    // Auto-mark as completed in research_queue if not already
                    if (selectedItem?.research_status !== 'completed' && selectedItem.id) {
                        await updateResearchStatus(selectedItem.id, 'completed')
                        // Update local state immediately so badge refreshes
                        setResearchQueue(prev => prev.map(q =>
                            q.id === selectedItem.id ? { ...q, research_status: 'completed' } : q
                        ))
                        setSelectedItem((prev: any) => ({ ...prev, research_status: 'completed' }))
                    }
                } else {
                    setHasResearchData(false)
                    setDeepResearchData(null)
                }
            } catch (error) {
                console.error('Error fetching deep research:', error)
            } finally {
                setIsResearchLoading(false)
            }
        }

        fetchDeepResearch()

        // Fetch all news for this company
        async function fetchCompanyNewsBatch() {
            if (!selectedItem?.company_name) return
            try {
                const data = await getCompanyNews(selectedItem.company_name)
                setCompanyNews(data)
            } catch (error) {
                console.error('Error fetching company news:', error)
            }
        }
        fetchCompanyNewsBatch()

        // Check if already a prospect
        async function checkProspectStatusBatch() {
            if (!selectedItem?.company_name) return
            try {
                const isP = await checkProspectStatusAction(selectedItem.company_name)
                setIsProspect(isP)
            } catch (error) {
                console.error('Error checking prospect status:', error)
            }
        }
        checkProspectStatusBatch()
    }, [selectedItem])

    // Reinitialise the Flowise chat bubble whenever the selected company changes
    useEffect(() => {
        const companyName = selectedItem?.company_name || 'this company'
        const companyId = selectedItem?.id || ''

        // Remove previous injected script + any existing chat widget
        const oldScript = document.getElementById('flowise-chat-script')
        if (oldScript) oldScript.remove()
        const oldWidget = document.querySelector('flowise-chatbot')
        if (oldWidget) oldWidget.remove()

        // Inject a fresh ES-module script with company-specific config
        const script = document.createElement('script')
        script.id = 'flowise-chat-script'
        script.type = 'module'
        script.textContent = `
            import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
            Chatbot.init({
                chatflowid: "0edf1e82-d8d7-4b4e-ac4e-21d4cf5c10ee",
                apiHost: "/api/flowise",
                theme: {
                    button: {
                        backgroundColor: "#6366f1",
                        right: 24, bottom: 24, size: 48,
                        iconColor: "white"
                    },
                    chatWindow: {
                        title: "Company Research Agent",
                        welcomeMessage: "Hi! I'm your AI Research Agent. Ask me anything about ${companyName}.",
                        backgroundColor: "#ffffff",
                        botMessage: { backgroundColor: "#f7f8ff", textColor: "#303235" },
                        userMessage: { backgroundColor: "#6366f1", textColor: "#ffffff" },
                        textInput: {
                            placeholder: "Ask about ${companyName}...",
                            backgroundColor: "#ffffff"
                        }
                    }
                },
                chatflowConfig: {
                    vars: { companyName: "${companyName}", companyId: "${companyId}" }
                }
            });
        `
        document.head.appendChild(script)

        return () => {
            // Cleanup on unmount
            document.getElementById('flowise-chat-script')?.remove()
            document.querySelector('flowise-chatbot')?.remove()
        }
    }, [selectedItem])



    const handleRemoveFromResearch = async (item: any) => {
        if (!item.id) return
        setDeletingId(item.id)
        try {
            await removeFromResearch(item.id)
            const updated = researchQueue.filter(r => r.id !== item.id)
            setResearchQueue(updated)
            if (selectedItem?.id === item.id) setSelectedItem(updated[0] ?? null)
        } catch (e) {
            console.error(e)
        } finally {
            setDeletingId(null)
        }
    }

    const filteredQueue = researchQueue.filter(item => {
        const matchesSearch = item.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || item.research_status === statusFilter
        return matchesSearch && matchesStatus
    })

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const handleAddToProspects = async () => {
        if (!selectedItem || isProspect || isAddingProspect) return
        setIsAddingProspect(true)
        try {
            await addToProspectsAction(selectedItem.company_name, selectedItem.logo_url)
            setIsProspect(true)
        } catch (e) {
            console.error(e)
        } finally {
            setIsAddingProspect(false)
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden' }}>
            <TopBar title="Research Queue" />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#f9fafb' }}>

                {/* ── Left: Company List ── */}
                <div style={{
                    width: '280px', flexShrink: 0,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    borderRight: '1px solid #e5e7eb', backgroundColor: '#ffffff'
                }}>
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text" placeholder="Search..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.45rem 0.6rem 0.45rem 2rem',
                                    fontSize: '0.8rem', borderRadius: '0.4rem',
                                    border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                                    fontWeight: 500, outline: 'none'
                                }}
                            />
                        </div>
                        {/* ── Status filter pills ── */}
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.55rem' }}>
                            {(['all', 'completed', 'queued'] as const).map(f => {
                                const labels: Record<string, string> = { all: 'All', completed: '✓ Researched', queued: '⏳ Queued' }
                                const active = statusFilter === f
                                const colors: Record<string, { bg: string; color: string; border: string }> = {
                                    all: { bg: active ? '#111827' : '#f1f5f9', color: active ? '#ffffff' : '#6b7280', border: active ? '#111827' : '#e5e7eb' },
                                    completed: { bg: active ? '#059669' : '#f0fdf4', color: active ? '#ffffff' : '#059669', border: active ? '#059669' : '#bbf7d0' },
                                    queued: { bg: active ? '#d97706' : '#fffbeb', color: active ? '#ffffff' : '#d97706', border: active ? '#d97706' : '#fde68a' },
                                }
                                const c = colors[f]
                                return (
                                    <button key={f} onClick={() => setStatusFilter(f)} style={{
                                        fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.55rem',
                                        borderRadius: '999px', border: `1px solid ${c.border}`,
                                        backgroundColor: c.bg, color: c.color, cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}>{labels[f]}</button>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: '0.45rem', fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>
                            {filteredQueue.length} {filteredQueue.length === 1 ? 'company' : 'companies'}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div style={{ width: '22px', height: '22px', border: '2px solid #f3f4f6', borderTop: '2px solid #111827', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : filteredQueue.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem', textAlign: 'center', color: '#9ca3af' }}>
                                <FlaskConical size={36} strokeWidth={1} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', margin: 0 }}>No companies yet</p>
                                <p style={{ fontSize: '0.7rem', marginTop: '0.4rem' }}>Add from Discovery feed</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {filteredQueue.map(item => {
                                    const isSelected = selectedItem?.id === item.id
                                    return (
                                        <div key={item.id}
                                            onClick={() => { setSelectedItem(item); setActiveTab('research') }}
                                            style={{
                                                position: 'relative',
                                                padding: '0.65rem 0.75rem',
                                                backgroundColor: isSelected ? '#f1f5f9' : '#ffffff',
                                                borderRadius: '0.5rem', cursor: 'pointer',
                                                border: `1px solid ${isSelected ? '#cbd5e1' : 'transparent'}`,
                                                transition: 'all 0.15s',
                                                display: 'flex', alignItems: 'center', gap: '0.6rem'
                                            }}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb' }}
                                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff' }}
                                        >
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                backgroundColor: item.logo_url ? '#ffffff' : '#f3f4f6',
                                                border: '1px solid #e5e7eb',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, fontWeight: 800, fontSize: '0.8rem',
                                                color: '#374151', overflow: 'hidden'
                                            }}>
                                                {item.logo_url
                                                    ? <img src={item.logo_url} alt={item.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                                                    : item.company_name?.charAt(0)?.toUpperCase() || '?'
                                                }
                                            </div>
                                            {/* status badge */}
                                            {item.research_status === 'completed' && (
                                                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#fff', fontWeight: 900, flexShrink: 0 }}>✓</div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.company_name}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 500, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <Clock size={9} />{formatDate(item.added_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Main Content ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
                    {selectedItem ? (
                        <>
                            {/* Header + Tabs */}
                            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #e5e7eb', flexShrink: 0, backgroundColor: '#ffffff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '10px',
                                            backgroundColor: selectedItem.logo_url ? '#ffffff' : '#f3f4f6',
                                            border: '1px solid #e5e7eb',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '1.1rem', color: '#111827', overflow: 'hidden'
                                        }}>
                                            {selectedItem.logo_url
                                                ? <img src={selectedItem.logo_url} alt={selectedItem.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
                                                : selectedItem.company_name?.charAt(0)?.toUpperCase() || '?'
                                            }
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>{selectedItem.company_name}</h2>
                                            {selectedItem.lead_data?.signal_type && (
                                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                                                    {selectedItem.lead_data.signal_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={handleAddToProspects}
                                            disabled={isProspect || isAddingProspect}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #e5e7eb',
                                                backgroundColor: isProspect ? '#f0fdf4' : '#ffffff',
                                                color: isProspect ? '#16a34a' : '#111827',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                cursor: (isProspect || isAddingProspect) ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={(e) => { if (!isProspect && !isAddingProspect) e.currentTarget.style.backgroundColor = '#f9fafb' }}
                                            onMouseLeave={(e) => { if (!isProspect && !isAddingProspect) e.currentTarget.style.backgroundColor = '#ffffff' }}
                                        >
                                            {isProspect ? <Check size={14} /> : (isAddingProspect ? <Clock size={14} /> : <UserPlus size={14} />)}
                                            {isProspect ? 'In Prospects' : (isAddingProspect ? 'Adding...' : 'Add to Prospects')}
                                        </button>

                                        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', padding: '3px', gap: '2px' }}>
                                            {(['research', 'news'] as const).map(tab => (
                                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                                    padding: '0.45rem 1rem', borderRadius: '0.4rem', border: 'none',
                                                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                    backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                                                    color: activeTab === tab ? '#111827' : '#64748b',
                                                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                                                }}>
                                                    {tab === 'research' ? <Beaker size={14} /> : <Newspaper size={14} />}
                                                    {tab === 'research' ? 'Research' : 'News Links'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                                {activeTab === 'research' ? (
                                    hasResearchData ? (
                                        <DeepResearchPanel
                                            companyName={selectedItem.company_name}
                                            data={deepResearchData}
                                            loading={isResearchLoading}
                                        />
                                    ) : (
                                        /* ── CTA (no data yet) ── */
                                        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                                            <div style={{
                                                padding: '2.5rem', backgroundColor: '#f8fafc',
                                                borderRadius: '1rem', border: '1px solid #e2e8f0',
                                                textAlign: 'center', marginBottom: '1.5rem'
                                            }}>
                                                <Beaker size={40} color="#94a3b8" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                                                    Ready to research {selectedItem.company_name}?
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem 0', lineHeight: 1.5, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                                                    Start an AI-powered deep dive to uncover opportunities, pain points, and decision makers.
                                                </p>
                                                <button style={{
                                                    padding: '0.75rem 2rem', backgroundColor: '#111827',
                                                    color: '#ffffff', border: 'none', borderRadius: '0.5rem',
                                                    fontWeight: 700, fontSize: '0.9rem',
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1f2937' }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#111827' }}
                                                >
                                                    <Beaker size={16} /> Start Researching
                                                </button>
                                            </div>
                                            <button onClick={() => handleRemoveFromResearch(selectedItem)}
                                                disabled={deletingId === selectedItem.id}
                                                style={{
                                                    width: '100%', padding: '0.65rem',
                                                    backgroundColor: '#ffffff', color: '#ef4444',
                                                    border: '1px solid #fecaca', borderRadius: '0.5rem',
                                                    fontWeight: 600, fontSize: '0.75rem',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                                    cursor: deletingId === selectedItem.id ? 'not-allowed' : 'pointer',
                                                    opacity: deletingId === selectedItem.id ? 0.5 : 1
                                                }}
                                            >
                                                <Trash2 size={13} />
                                                {deletingId === selectedItem.id ? 'Removing…' : 'Remove from Research'}
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    /* ── News Tab ── */
                                    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                                        {companyNews.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                {companyNews.map((news, idx) => (
                                                    <div key={news.id} style={{
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '1rem',
                                                        border: '1px solid #e5e7eb',
                                                        padding: '1.5rem',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                                    }}>
                                                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                            {news.news_og_image && (
                                                                <div style={{ width: '180px', height: '120px', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0, border: '1px solid #f3f4f6' }}>
                                                                    <img src={news.news_og_image} alt="News" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                            )}
                                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                                                                        {news.news_headline}
                                                                    </h3>
                                                                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>
                                                                        {formatDate(news.publish_date || news.created_at)}
                                                                    </span>
                                                                </div>

                                                                {news.news_summary && (
                                                                    <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                                                                        {news.news_summary}
                                                                    </p>
                                                                )}

                                                                {news.decklar_benefit && (
                                                                    <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #dcfce7' }}>
                                                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Decklar Opportunity</div>
                                                                        <p style={{ fontSize: '0.8rem', color: '#14532d', margin: 0, fontWeight: 600, lineHeight: 1.4 }}>{news.decklar_benefit}</p>
                                                                    </div>
                                                                )}

                                                                {news.news_link && (
                                                                    <a href={news.news_link} target="_blank" rel="noopener noreferrer" style={{
                                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                                        fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none',
                                                                        fontWeight: 700, alignSelf: 'flex-start'
                                                                    }}>
                                                                        Read Full Article <ExternalLink size={12} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: '#9ca3af', textAlign: 'center' }}>
                                                <Newspaper size={40} strokeWidth={1} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No news data available</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', padding: '2rem', textAlign: 'center' }}>
                            <FileText size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>Select a company to get started</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Choose a company from the list to view research options</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>


        </div>
    )
}
