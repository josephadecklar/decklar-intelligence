import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

const LOGODEV_SECRET = process.env.NEXT_PUBLIC_LOGODEV_SECRET || ''  // sk_ → search API auth
const LOGODEV_TOKEN = process.env.NEXT_PUBLIC_LOGODEV_TOKEN || ''  // pk_ → image CDN token

async function getLogoForCompany(companyName: string): Promise<string | null> {
    try {
        const res = await fetch(
            `https://api.logo.dev/search?q=${encodeURIComponent(companyName)}`,
            {
                headers: { Authorization: `Bearer ${LOGODEV_SECRET}` },
            }
        )
        if (!res.ok) return null
        const results = await res.json()
        if (!results || results.length === 0) return null
        const domain = results[0]?.domain
        if (!domain) return null
        // Use the PUBLISHABLE key (pk_) for the image CDN URL — NOT the secret key
        return `https://img.logo.dev/${domain}?token=${LOGODEV_TOKEN}&size=64&format=png`
    } catch {
        return null
    }
}

export async function POST() {
    try {
        // Fetch companies without a logo (or all if reset=true query param used)
        const { data: companies, error } = await supabaseAdmin
            .from('existing_customers')
            .select('id, company_name, logo_url')
            .is('logo_url', null)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        const results: { table: string; company: string; logo: string | null; status: string }[] = []

        // ── Seed existing_customers ───────────────────────────────────────────
        for (const company of companies || []) {
            await new Promise(r => setTimeout(r, 200))
            const logoUrl = await getLogoForCompany(company.company_name)
            if (logoUrl) {
                const { error: updateErr } = await supabaseAdmin
                    .from('existing_customers')
                    .update({ logo_url: logoUrl })
                    .eq('id', company.id)
                results.push({ table: 'existing_customers', company: company.company_name, logo: logoUrl, status: updateErr ? 'error' : 'ok' })
            } else {
                results.push({ table: 'existing_customers', company: company.company_name, logo: null, status: 'not_found' })
            }
        }

        // ── Seed company_deep_research ────────────────────────────────────────
        const { data: researched, error: resErr } = await supabaseAdmin
            .from('company_deep_research')
            .select('id, company_name, logo_url')
            .is('logo_url', null)

        for (const company of researched || []) {
            await new Promise(r => setTimeout(r, 200))
            const logoUrl = await getLogoForCompany(company.company_name)
            if (logoUrl) {
                const { error: updateErr } = await supabaseAdmin
                    .from('company_deep_research')
                    .update({ logo_url: logoUrl })
                    .eq('id', company.id)
                results.push({ table: 'company_deep_research', company: company.company_name, logo: logoUrl, status: updateErr ? 'error' : 'ok' })
            } else {
                results.push({ table: 'company_deep_research', company: company.company_name, logo: null, status: 'not_found' })
            }
        }

        const updated = results.filter(r => r.status === 'ok').length
        return NextResponse.json({ message: `Done. ${updated} logos seeded.`, updated, results })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// DELETE: Clear all logo_url values so the seed can re-run fresh
export async function DELETE() {
    const { error } = await supabaseAdmin
        .from('existing_customers')
        .update({ logo_url: null })
        .not('id', 'is', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'All logo_url values cleared. Call POST to re-seed.' })
}

// GET: Status check
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('existing_customers')
        .select('id, company_name, logo_url')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const withLogo = (data || []).filter(c => c.logo_url).length
    const withoutLogo = (data || []).filter(c => !c.logo_url).length

    return NextResponse.json({
        total: data?.length,
        withLogo,
        withoutLogo,
        message: withoutLogo === 0 ? 'All logos populated!' : `${withoutLogo} companies still need logos.`
    })
}
