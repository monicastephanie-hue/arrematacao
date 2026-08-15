import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Verdadeiro quando as variáveis de ambiente do Supabase foram configuradas. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Em desenvolvimento/preview sem as variáveis configuradas, cria um client "vazio"
// apontando para valores fictícios — as chamadas falham de forma controlada
// (tratadas na tela de login) em vez de quebrar o app inteiro ao carregar.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key')
