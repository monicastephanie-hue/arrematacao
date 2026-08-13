import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Property } from '@/types'
import { StatusBadge } from '@/components/status-badge'
import { stageProgress, totalInvested } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

export function KanbanCard({
  property,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  property: Property
  dragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
}) {
  const invested = totalInvested(property)
  const done = property.stages.filter((s) => s.status === 'concluida').length

  return (
    <Link
      to={`/imoveis/${property.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'block cursor-grab overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900',
        dragging && 'opacity-40',
      )}
    >
      {property.photoUrl ? (
        <img src={property.photoUrl} alt="" className="h-24 w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-24 w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
          <Home className="h-5 w-5 text-slate-300 dark:text-slate-600" />
        </div>
      )}
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{property.title}</p>
        </div>
        {property.address && <p className="truncate text-xs text-slate-400">{property.address}</p>}
        <div className="mt-1 flex items-center justify-between">
          <StatusBadge status={property.status} />
          <span className="text-[11px] font-medium text-slate-400 tabular-nums">
            {done}/{property.stages.length}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-600 tabular-nums dark:text-slate-300">{formatCurrency(invested)}</p>
        <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${stageProgress(property)}%` }} />
        </div>
      </div>
    </Link>
  )
}
