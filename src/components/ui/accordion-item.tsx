import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

export function AccordionItem({
  icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-200">{title}</span>
          <span className="block truncate text-xs text-slate-400">{subtitle}</span>
        </span>
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400',
            open && 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
          )}
        >
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open && <div className="flex flex-col gap-3 border-t border-slate-100 px-3 py-3 dark:border-slate-800">{children}</div>}
    </div>
  )
}
