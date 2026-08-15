import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  /** true enquanto a sessão inicial ainda não foi verificada. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>((set) => {
  if (isSupabaseConfigured) {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, loading: false })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, loading: false })
    })
  }

  return {
    session: null,
    loading: isSupabaseConfigured,

    signIn: async (email, password) => {
      if (!isSupabaseConfigured) {
        return { error: 'O login ainda não foi configurado neste ambiente (faltam as credenciais do Supabase).' }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message }
      return { error: null }
    },

    signOut: async () => {
      if (!isSupabaseConfigured) return
      await supabase.auth.signOut()
    },

    requestPasswordReset: async (email) => {
      if (!isSupabaseConfigured) {
        return { error: 'O login ainda não foi configurado neste ambiente (faltam as credenciais do Supabase).' }
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}#/redefinir-senha`,
      })
      return { error: error ? error.message : null }
    },

    updatePassword: async (password) => {
      if (!isSupabaseConfigured) {
        return { error: 'O login ainda não foi configurado neste ambiente (faltam as credenciais do Supabase).' }
      }
      const { error } = await supabase.auth.updateUser({ password })
      return { error: error ? error.message : null }
    },
  }
})
