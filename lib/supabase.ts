import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing! Data will not load.')
} else {
    console.log('Supabase configuration found:', {
        urlLength: supabaseUrl?.length,
        urlStarts: supabaseUrl?.substring(0, 8),
        keyLength: supabaseAnonKey?.length,
        keyStarts: supabaseAnonKey?.substring(0, 10),
        isPlaceholder: supabaseUrl?.includes('placeholder')
    })
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
