'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import NewsPanel from '@/components/NewsPanel'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Clock, Filter, Search, ArrowRight, Building2, MapPin, CheckCircle2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [filter, setFilter] = useState('Today')

  // Column Filters state
  const [nameFilter, setNameFilter] = useState('')
  const [scoreFilter, setScoreFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Expanded rows for news
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const fetchDiscoveries = async () => {
    setLoading(true)

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Discoveries/Prospects query
    let discoveryQuery = supabase
      .from('research_metadata')
      .select('*, company_research!inner(*)')

    // Customers query
    let customerQuery = supabase
      .from('decklar_customers')
      .select('*')

    if (filter === 'Today') {
      discoveryQuery = discoveryQuery.gte('updated_at', todayStart.toISOString())
      customerQuery = customerQuery.gte('updated_at', todayStart.toISOString())
    } else if (filter === 'Last 7 Days') {
      discoveryQuery = discoveryQuery
        .gte('updated_at', sevenDaysAgo.toISOString())
        .lt('updated_at', todayStart.toISOString())
      customerQuery = customerQuery
        .gte('updated_at', sevenDaysAgo.toISOString())
        .lt('updated_at', todayStart.toISOString())
    } else if (filter === 'All Time') {
      discoveryQuery = discoveryQuery.lt('updated_at', sevenDaysAgo.toISOString())
      customerQuery = customerQuery.lt('updated_at', sevenDaysAgo.toISOString())
    }

    const [discoveryRes, customerRes] = await Promise.all([
      discoveryQuery,
      customerQuery
    ])

    if (discoveryRes.error || customerRes.error) {
      console.error('Error fetching dashboard data:', discoveryRes.error || customerRes.error)
    } else {
      const discoveriesData = discoveryRes.data || []
      const customersData = customerRes.data || []

      const flattenedDiscoveries = discoveriesData.map(m => ({
        ...m.company_research,
        logo_url: m.logo_url,
        status: m.status,
        updated_at: m.updated_at,
        id: m.research_id
      }))

      const flattenedCustomers = customersData.map(c => ({
        ...c,
        lead_score: c.health_score, // Map health_score to lead_score for ranking
        status: 'customer',
        summary_for_sales: c.latest_news_summary,
        location: 'USA', // Default for customers since column is missing
        id: `cust-${c.id}`
      }))

      const flattened = [...flattenedDiscoveries, ...flattenedCustomers]
        .filter(item => item.company_name)
        .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));

      setDiscoveries(flattened)

      if (flattened.length > 0) {
        if (!selectedCompany || !flattened.find(d => d.id === selectedCompany.id)) {
          setSelectedCompany(flattened[0])
        } else {
          const freshSelected = flattened.find(d => d.id === selectedCompany.id);
          if (freshSelected) setSelectedCompany(freshSelected);
        }
      } else {
        setSelectedCompany(null)
      }
    }
    setLoading(false)
  }

  const filteredDiscoveries = React.useMemo(() => {
    return discoveries.filter(lead => {
      // Name filter
      if (nameFilter && !lead.company_name?.toLowerCase().includes(nameFilter.toLowerCase())) return false;

      // Score filter
      if (scoreFilter !== 'All') {
        const score = lead.lead_score || 0;
        if (scoreFilter === 'High (80+)' && score < 80) return false;
        if (scoreFilter === 'Medium (60-79)' && (score < 60 || score >= 80)) return false;
        if (scoreFilter === 'Low (<60)' && score >= 60) return false;
      }

      // Location filter
      if (locationFilter) {
        const loc = lead.location || 'USA'; // Consistency with display logic
        const country = (() => {
          const parts = loc.split(',').map((p: string) => p.trim());
          const lastPart = parts[parts.length - 1];
          if (lastPart.length === 2 && lastPart === lastPart.toUpperCase()) return "USA";
          if (["US", "USA", "United States"].includes(lastPart)) return "USA";
          return lastPart;
        })();
        if (!country.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter.toLowerCase() !== lead.status?.toLowerCase()) return false;
      }

      return true;
    });
  }, [discoveries, nameFilter, scoreFilter, locationFilter, statusFilter]);

  useEffect(() => {
    fetchDiscoveries()
  }, [filter])

  useEffect(() => {
    // Sync selected company if current selection is filtered out
    if (filteredDiscoveries.length > 0) {
      const isSelectedVisible = selectedCompany && filteredDiscoveries.find(d => d.id === selectedCompany.id);
      if (!isSelectedVisible) {
        setSelectedCompany(filteredDiscoveries[0]);
      }
    } else {
      setSelectedCompany(null);
    }
  }, [filteredDiscoveries, selectedCompany]);

  const filterInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.4rem 0.6rem',
    fontSize: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#374151',
    marginTop: '0.4rem',
    fontWeight: 500
  }

  const handleStatusUpdate = () => {
    fetchDiscoveries()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title="Dashboard" />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Middle Section: Discovery Feed Table */}
          <div style={{
            flex: 1,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexShrink: 0 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>Intelligence Feed</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                  {filter === 'Today' ? "New discoveries found in the last 24 hours." :
                    filter === 'Last 7 Days' ? "Discoveries from earlier this week (excluding today)." :
                      "Historical intelligence signals (prior to last 7 days)."}
                </p>
              </div>
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

            {/* Compact Filter Bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Search Company</div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    style={{ ...filterInputStyle, marginTop: 0, paddingLeft: '2rem' }}
                  />
                </div>
              </div>
              <div style={{ width: '140px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Lead Score</div>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  style={{ ...filterInputStyle, marginTop: 0 }}
                >
                  <option>All</option>
                  <option>High (80+)</option>
                  <option>Medium (60-79)</option>
                  <option>Low {"(<60)"}</option>
                </select>
              </div>
              <div style={{ width: '160px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Location</div>
                <input
                  type="text"
                  placeholder="e.g. USA"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  style={{ ...filterInputStyle, marginTop: 0 }}
                />
              </div>
              <div style={{ width: '140px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ ...filterInputStyle, marginTop: 0 }}
                >
                  <option>All</option>
                  <option>Discovery</option>
                  <option>Prospect</option>
                  <option>Customer</option>
                </select>
              </div>
              {/* Filter Reset if needed could go here */}
            </div>

            {/* Feed Container - Scrollable */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #111827', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : filteredDiscoveries.length > 0 ? (
                filteredDiscoveries.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedCompany(lead)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '1rem',
                      border: selectedCompany?.id === lead.id ? '2px solid #111827' : '1px solid #e5e7eb',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedCompany?.id === lead.id ? '0 8px 24px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      flexShrink: 0
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {lead.logo_url ? (
                            <img src={lead.logo_url} alt={lead.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                          ) : <Building2 size={14} color="#9ca3af" />}
                        </div>
                        <span style={{ fontWeight: 800, color: '#111827', fontSize: '1rem', letterSpacing: '-0.01em' }}>{lead.company_name}</span>
                      </div>

                      {lead.status === 'prospect' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#f0fdf4', padding: '0.25rem 0.5rem', borderRadius: '2rem', border: '1px solid #dcfce7' }}>
                          <CheckCircle2 size={10} /> Prospect
                        </div>
                      ) : lead.status === 'customer' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1e40af', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '2rem', border: '1px solid #dbeafe' }}>
                          <Building2 size={10} /> Customer
                        </div>
                      ) : (
                        <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', backgroundColor: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '2rem', border: '1px solid #f1f5f9' }}>
                          Discovery
                        </div>
                      )}
                    </div>

                    {/* Card Body - News Focused */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {lead.news_image_url && (
                        <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                          <img src={lead.news_image_url} alt="Intelligence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Intelligence Signal</div>
                        <p style={{
                          fontSize: '1rem',
                          color: '#334155',
                          lineHeight: 1.5,
                          margin: 0,
                          fontWeight: 600,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {lead.news_details || "Awaiting latest intelligence signals..."}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#ffffff',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Score</span>
                          <span style={{ fontWeight: 900, color: lead.lead_score >= 80 ? '#16a34a' : '#d97706', fontSize: '1.1rem' }}>{lead.lead_score}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Location</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                            <MapPin size={12} color="#94a3b8" />
                            {(() => {
                              if (!lead.location) return "USA";
                              const parts = lead.location.split(',').map((p: string) => p.trim());
                              const lastPart = parts[parts.length - 1];
                              if (lastPart.length === 2 && lastPart === lastPart.toUpperCase()) return "USA";
                              if (["US", "USA", "United States"].includes(lastPart)) return "USA";
                              return lastPart;
                            })()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {lead.news_link && (
                          <a
                            href={lead.news_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.5rem 0.8rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              textDecoration: 'none',
                              border: 'None',
                              transition: 'all 0.2s'
                            }}
                          >
                            Source <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: selectedCompany?.id === lead.id ? '#111827' : '#ffffff',
                            color: selectedCompany?.id === lead.id ? '#ffffff' : '#111827',
                            border: '1px solid #111827',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Deep Dive <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280' }}>
                    No intelligence signals found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Discovery Intelligence Panel */}
          <div style={{
            width: '400px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: '1px solid #e5e7eb'
          }}>
            <NewsPanel companyData={selectedCompany} onStatusUpdate={handleStatusUpdate} />
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

