import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Gavel } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)

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
