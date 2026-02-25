import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    try {
        const supabase = createClient(supabaseUrl!, supabaseKey!)
        const { data, error } = await supabase.from('existing_customers').select('count', { count: 'exact' })

        return NextResponse.json({
            success: !error,
            data,
            error,
            env: {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey,
                url: supabaseUrl
            }
        })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
