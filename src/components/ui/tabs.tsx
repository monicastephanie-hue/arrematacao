import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TabDef {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({ tabs, defaultTab }: { tabs: TabDef[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0]

  return (
    <div>
      <div role="tablist" className="mb-4 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab?.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab.id === activeTab?.id
                ? 'border-orange-600 text-orange-700 dark:border-orange-400 dark:text-orange-300'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  )
}
