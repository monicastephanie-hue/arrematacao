import { Link } from 'react-router-dom'
import { Banknote, Landmark, MapPin, Users } from 'lucide-react'
import type { Property } from '@/types'
import { StatusBadge } from '@/components/status-badge'
import { ProgressBar } from '@/components/progress-bar'
import { Card } from '@/components/ui/card'
import { currentStage, stageProgress, totalInvested } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'

export function PropertyCard({ property }: { property: Property }) {
  const progress = stageProgress(property)
  const stage = currentStage(property)
  const invested = totalInvested(property)

  return (
    <Link to={`/imoveis/${property.id}`} className="block">
      <Card className="h-full p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{property.title}</h3>
          <StatusBadge status={property.status} className="shrink-0" />
        </div>

        {property.address && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            {property.address}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Banknote className="h-3 w-3" />
            {formatCurrency(invested)} investidos
          </span>
          {property.coOwners ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {property.coOwners} cotistas
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Etapas concluídas</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>

        {stage && (
          <p className="mt-3 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
            <Landmark className="h-3 w-3 shrink-0" />
            Etapa atual: <span className="font-medium text-slate-700 dark:text-slate-300">{stage.name}</span>
          </p>
        )}
      </Card>
    </Link>
  )
}
