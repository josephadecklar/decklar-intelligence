const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseAnonKey?.length)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log('Fetching...')
    const { data, error } = await supabase.from('existing_customers').select('count', { count: 'exact' })
    if (error) console.error('Error:', error)
    else console.log('Data:', data)
}

test()
