import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Gavel } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

// TEMPORÁRIO: destrava o acesso às telas internas sem exigir login, apenas
// para visualização enquanto o Supabase ainda não está configurado com
// credenciais reais neste ambiente. Assim que houver um projeto Supabase
// configurado (.env preenchido) e o login for testado de ponta a ponta,
// troque a linha abaixo para `false` para restaurar a trava de autenticação.
export const BYPASS_AUTH_TEMPORARIAMENTE = true

export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)

  if (BYPASS_AUTH_TEMPORARIAMENTE) return <>{children}</>

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Gavel className="h-6 w-6 animate-pulse text-orange-500" />
      </div>
    )
  }

  if (!session) return <Navigate to="/" replace />

  return <>{children}</>
}
