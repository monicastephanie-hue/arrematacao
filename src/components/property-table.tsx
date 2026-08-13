import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import type { Property } from '@/types'
import { STAGE_STATUS_META } from '@/types'
import { StatusBadge } from '@/components/status-badge'
import { collectStageColumns, totalInvested } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const STAGE_CELL_CLASSES: Record<string, string> = {
  pendente: 'bg-slate-50 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500',
  em_andamento: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  concluida: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
}

export function PropertyTable({ properties }: { properties: Property[] }) {
  const stageColumns = collectStageColumns(properties)

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[900px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Imóvel</th>
            <th className="px-3 py-2 font-medium">Código</th>
            <th className="px-3 py-2 text-right font-medium">Cotistas</th>
            <th className="px-3 py-2 text-right font-medium">Investido</th>
            {stageColumns.map((name) => (
              <th key={name} className="px-3 py-2 font-medium whitespace-nowrap">
                {name}
              </th>
            ))}
            <th className="px-3 py-2 font-medium">Situação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {properties.map((property, index) => (
            <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
              <td className="px-3 py-2 text-slate-400">{index + 1}</td>
              <td className="max-w-[240px] px-3 py-2">
                <div className="flex items-center gap-2">
                  {property.photoUrl ? (
                    <img src={property.photoUrl} alt="" className="h-8 w-11 shrink-0 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                      <Home className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      to={`/imoveis/${property.id}`}
                      className="block truncate font-medium text-slate-800 hover:underline dark:text-slate-200"
                      title={property.title}
                    >
                      {property.title}
                    </Link>
                    {property.address && (
                      <span className="block truncate text-[11px] text-slate-400" title={property.address}>
                        {property.address}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-500 dark:text-slate-400">
                {property.bankCode || '—'}
                {property.financed && (
                  <span className="ml-1 rounded bg-sky-50 px-1 py-0.5 text-[10px] text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                    financiado
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-500 dark:text-slate-400">
                {property.coOwners ?? '—'}
              </td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
                {formatCurrency(totalInvested(property))}
              </td>
              {stageColumns.map((name) => {
                const stage = property.stages.find((s) => s.name === name)
                if (!stage) {
                  return <td key={name} className="px-3 py-2 text-center text-slate-300 dark:text-slate-700">—</td>
                }
                const meta = STAGE_STATUS_META[stage.status]
                const title = [meta.label, stage.date ? formatDate(stage.date) : null, stage.notes || null]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <td key={name} className="px-1.5 py-1.5">
                    <div
                      className={cn(
                        'truncate rounded-md px-2 py-1 text-center text-[11px] font-medium whitespace-nowrap',
                        STAGE_CELL_CLASSES[stage.status],
                      )}
                      title={title}
                    >
                      {stage.notes ? (stage.notes.length > 16 ? `${stage.notes.slice(0, 15)}…` : stage.notes) : meta.label}
                    </div>
                  </td>
                )
              })}
              <td className="px-3 py-2">
                <StatusBadge status={property.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
