'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TopBar from '@/components/TopBar'
import LeadCard from '@/components/LeadCard'
import NewsPanel from '@/components/NewsPanel'
import CompanyModal from '@/components/CompanyModal'
import { Search, Filter, ArrowRight, BarChart3, TrendingUp, AlertCircle, FileText } from 'lucide-react'

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'today' | '7days'>('today')
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [timeRange])

  const fetchLeads = async () => {
    setLoading(true)
    const now = new Date()
    let startDate = new Date()

    if (timeRange === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else {
      startDate.setDate(now.getDate() - 7)
    }

    const { data, error } = await supabase
      .from('company_research')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('lead_score', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
      if (data && data.length > 0) {
        // Keep the current selection if it still exists in the new list, otherwise select first
        const stillExists = data.find(l => l.id === selectedLead?.id)
        if (!stillExists) {
          setSelectedLead(data[0])
        }
      } else {
        setSelectedLead(null)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Dashboard" />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Middle Section: Lead List */}
        <div style={{
          flex: '1 1 60%',
          padding: '2.5rem',
          borderRight: '1px solid #f3f4f6',
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Intelligence Briefing</h2>
              <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginTop: '0.4rem' }}>Identify and act on high-potential prospects appearing in your territory.</p>
            </div>
            <div style={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              padding: '0.3rem',
              borderRadius: '0.75rem',
              gap: '0.25rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <button
                onClick={() => setTimeRange('today')}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: timeRange === 'today' ? '#ffffff' : 'transparent',
                  color: timeRange === 'today' ? '#111827' : '#6b7280',
                  boxShadow: timeRange === 'today' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange('7days')}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: timeRange === '7days' ? '#ffffff' : 'transparent',
                  color: timeRange === '7days' ? '#111827' : '#6b7280',
                  boxShadow: timeRange === '7days' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Last 7 Days
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                {timeRange === 'today' ? "Today's Top Prospects" : "Top Prospects (Last 7 Days)"}
              </h3>
              {!loading && (
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', backgroundColor: '#f9fafb', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  {leads.length} companies found
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '6rem 0', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '3.5px solid #f3f4f6', borderTop: '3.5px solid #111827', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1.5rem', color: '#6b7280', fontWeight: 500 }}>Scanning intel platform...</p>
              </div>
            ) : leads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    companyName={lead.company_name}
                    industry={lead.lead_recommendation || "Strategic Prospect"}
                    score={lead.lead_score}
                    logoUrl={lead.logo_url}
                    isSelected={selectedLead?.id === lead.id}
                    onClick={() => setSelectedLead(lead)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '1.25rem', border: '1px dashed #e5e7eb' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#ffffff', borderRadius: '50%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <AlertCircle size={32} color="#9ca3af" />
                </div>
                <h4 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: 700 }}>No candidates identified</h4>
                <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginTop: '0.6rem', maxWidth: '300px', margin: '0.6rem auto 0 auto' }}>
                  There are no high-potential prospects appearing for this time window yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: News & Intelligence */}
        <div style={{
          flex: '1 1 40%',
          backgroundColor: '#fcfcfc',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <NewsPanel
            companyName={selectedLead?.company_name || null}
            logoUrl={selectedLead?.logo_url || null}
            newsSummary={selectedLead?.summary_for_sales || null}
          />

          {selectedLead && (
            <div style={{ padding: '0 1.5rem 2.5rem 1.5rem' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '1.125rem',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.875rem',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(17, 24, 39, 0.4)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111827'}
              >
                <FileText size={18} /> Deep-Dive Intelligence <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedLead}
      />

      <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  )
}
