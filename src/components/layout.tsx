import { Link, Outlet, useLocation } from 'react-router-dom'
import { Gavel, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Layout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950">
              <Gavel className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Arrematação
              <span className="ml-1 font-normal text-slate-400">· controle de leilões</span>
            </span>
          </Link>
          {!isDashboard && (
            <Link to="/imoveis/novo">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo imóvel
              </Button>
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
