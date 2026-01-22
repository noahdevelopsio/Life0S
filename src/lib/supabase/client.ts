import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () =>
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
