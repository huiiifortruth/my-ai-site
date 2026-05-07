import { createClient } from '@supabase/supabase-js'

// 读取环境变量里的 URL 和 Key
const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建并导出一个供全局使用的 supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)