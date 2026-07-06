import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 建立並匯出 Supabase 客戶端，讓整個專案都能共用這個連線
export const supabase = createClient(supabaseUrl, supabaseKey)