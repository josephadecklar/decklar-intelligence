'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import NewsPanel from '@/components/NewsPanel'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Clock, Filter, Search, ArrowRight, Building2, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [filter, setFilter] = useState('Today')

  const fetchDiscoveries = async () => {
    setLoading(true)
    let query = supabase
      .from('company_research')
      .select('*')
      .order('updated_at', { ascending: false })

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    if (filter === 'Today') {
      // Buckets: Discrete Range for Today
      query = query.gte('updated_at', todayStart.toISOString())
    } else if (filter === 'Last 7 Days') {
      // Buckets: Between 7 days ago and the start of Today (Discrete)
      query = query
        .gte('updated_at', sevenDaysAgo.toISOString())
        .lt('updated_at', todayStart.toISOString())
    } else if (filter === 'All Time') {
      // Buckets: Everything older than 7 days (Discrete)
      query = query.lt('updated_at', sevenDaysAgo.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching discoveries:', error)
    } else {
      setDiscoveries(data || [])
      if (data && data.length > 0) {
        if (!selectedCompany || !data.find(d => d.id === selectedCompany.id)) {
          setSelectedCompany(data[0])
        } else {
          const freshSelected = data.find(d => d.id === selectedCompany.id);
          if (freshSelected) setSelectedCompany(freshSelected);
        }
      } else {
        setSelectedCompany(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDiscoveries()
  }, [filter])

  const handleStatusUpdate = () => {
    fetchDiscoveries()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar activePage="dashboard" />

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

            {/* Table Container - Scrollable */}
            <div style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative'
            }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #111827', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : discoveries.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <tr>
                      <th style={thStyle}>Company</th>
                      <th style={thStyle}>Lead Score</th>
                      <th style={thStyle}>Priority</th>
                      <th style={thStyle}>Location</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {discoveries.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedCompany(lead)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedCompany?.id === lead.id ? '#f9fafb' : 'transparent',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: lead.logo_url ? '#ffffff' : '#f3f4f6',
                              border: lead.logo_url ? '1px solid #e5e7eb' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                              fontSize: '0.8rem',
                              fontWeight: 700
                            }}>
                              {lead.logo_url ? (
                                <img src={lead.logo_url} alt={lead.company_name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                              ) : lead.company_name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{lead.company_name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            fontWeight: 800,
                            color: lead.lead_score >= 80 ? '#16a34a' : '#d97706',
                            fontSize: '0.9rem'
                          }}>
                            {lead.lead_score}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            backgroundColor: lead.lead_recommendation?.toLowerCase().includes('high') ? '#dcfce7' : '#fef3c7',
                            color: lead.lead_recommendation?.toLowerCase().includes('high') ? '#166534' : '#92400e',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            {lead.lead_recommendation}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={12} color="#9ca3af" />
                            {lead.location || "USA"}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {lead.status === 'prospect' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              <CheckCircle2 size={14} />
                              Prospect
                            </div>
                          ) : (
                            <div style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                              New Discovery
                            </div>
                          )}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <ArrowRight size={16} color={selectedCompany?.id === lead.id ? '#111827' : '#d1d5db'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280' }}>
                    No intelligence signals found in the "{filter}" category.
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
      `}</style>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.65rem',
  fontWeight: 800,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '0.875rem 1rem',
  borderTop: '1px solid #f3f4f6',
}
