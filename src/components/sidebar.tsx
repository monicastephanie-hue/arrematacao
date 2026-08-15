import { LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_GROUPS } from '@/components/nav-items'
import { useAuthStore } from '@/store/useAuthStore'
import { cn } from '@/lib/cn'
import logo from '@/assets/logo-embarque-nos-leiloes.jpg'

function Brand() {
  return (
    <NavLink to="/imoveis" className="flex items-center gap-2 px-2">
      <img src={logo} alt="Embarque nos Leilões" className="h-8 w-8 shrink-0 rounded-full" />
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

function AccountFooter({ compact }: { compact?: boolean }) {
  const session = useAuthStore((s) => s.session)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className={cn('flex items-center justify-between gap-2 px-2', compact && 'px-0')}>
      <span className="min-w-0 truncate text-[11px] text-slate-400" title={session?.user.email ?? ''}>
        {session?.user.email}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400"
      >
        <LogOut className="h-3 w-3" />
        Sair
      </button>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white px-3 py-4 lg:flex print:hidden dark:border-slate-800 dark:bg-slate-900">
      <Brand />
      <NavLinks />
      <div className="mt-auto">
        <AccountFooter />
      </div>
    </aside>
  )
}

export function MobileNav() {
  return (
    <div className="scrollbar-thin sticky top-0 z-40 flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden print:hidden dark:border-slate-800 dark:bg-slate-900">
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
      <div className="ml-auto shrink-0">
        <AccountFooter compact />
      </div>
    </div>
  )
}
