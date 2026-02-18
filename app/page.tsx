'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import NewsPanel from '@/components/NewsPanel'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Clock, Filter, Search, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [filter, setFilter] = useState('Today')

  const fetchDiscoveries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('company_research')
      .select('*')
      .eq('status', 'discovery')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching discoveries:', error)
    } else {
      setDiscoveries(data || [])
      if (data && data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDiscoveries()
  }, [])

  const handleStatusUpdate = () => {
    // Refresh discoveries list
    fetchDiscoveries()
    // Reset selection if the currently selected one was added to prospects
    setSelectedCompany(null)
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
            overflowY: 'auto',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>Today's Intelligence Discovery</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>New intelligence signals detected in your territory today.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['Today', 'Last 7 Days'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      backgroundColor: filter === f ? '#111827' : '#ffffff',
                      color: filter === f ? '#ffffff' : '#4b5563',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTop: '3px solid #111827', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : discoveries.length > 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th style={thStyle}>Company</th>
                      <th style={thStyle}>Lead Score</th>
                      <th style={thStyle}>Priority</th>
                      <th style={thStyle}>Detected</th>
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
                            fontSize: '1rem'
                          }}>
                            {lead.lead_score}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            backgroundColor: lead.lead_recommendation?.toLowerCase().includes('high') ? '#dcfce7' : '#fef3c7',
                            color: lead.lead_recommendation?.toLowerCase().includes('high') ? '#166534' : '#92400e',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            {lead.lead_recommendation}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.8rem' }}>
                          {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <ArrowRight size={16} color={selectedCompany?.id === lead.id ? '#111827' : '#d1d5db'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed #d1d5db' }}>
                <p style={{ color: '#6b7280' }}>No new intelligence discoveries detected for this period.</p>
              </div>
            )}
          </div>

          {/* Right Section: Discovery Intelligence Panel */}
          <div style={{
            width: '400px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
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
  padding: '0.75rem 1.25rem',
  textAlign: 'left',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  borderTop: '1px solid #f3f4f6',
}
