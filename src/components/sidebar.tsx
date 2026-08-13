import { Gavel } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '@/components/nav-items'
import { cn } from '@/lib/cn'

function Brand() {
  return (
    <NavLink to="/imoveis" className="flex items-center gap-2 px-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-orange-400 dark:bg-orange-500 dark:text-slate-950">
        <Gavel className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Arrematação
        <span className="block text-[11px] font-normal text-slate-400">controle de leilões</span>
      </span>
    </NavLink>
  )
}

function NavLinks() {
  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-orange-600 bg-orange-50 text-orange-700 dark:border-orange-400 dark:bg-orange-500/10 dark:text-orange-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white px-3 py-4 lg:flex dark:border-slate-800 dark:bg-slate-900">
      <Brand />
      <NavLinks />
      <p className="mt-auto px-3 text-[11px] text-slate-300 dark:text-slate-600">Dados salvos neste navegador</p>
    </aside>
  )
}

export function MobileNav() {
  return (
    <div className="scrollbar-thin sticky top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden dark:border-slate-800 dark:bg-slate-900">
      {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap',
              isActive
                ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
            )
          }
        >
          <item.icon className="h-3.5 w-3.5" />
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}
