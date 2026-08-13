import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, LayoutGrid, Plus, Search, Table as TableIcon } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { PropertyStatus } from '@/types'
import { STATUS_META, STATUS_ORDER } from '@/types'
import { PropertyCard } from '@/components/property-card'
import { PropertyTable } from '@/components/property-table'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/field'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'

type ViewMode = 'cards' | 'tabela'
type StatusFilter = 'todos' | PropertyStatus

export default function Dashboard() {
  const properties = useStore((s) => s.properties)
  const [view, setView] = useState<ViewMode>('cards')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return properties.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.bankCode.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'todos' || p.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [properties, query, statusFilter])

  if (properties.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Banknote className="h-6 w-6 text-slate-400" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nenhum imóvel cadastrado</h1>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Cadastre o primeiro imóvel arrematado (ou em disputa) para começar a acompanhar valores e etapas.
        </p>
        <Link to="/imoveis/novo">
          <Button className="mt-2">
            <Plus className="h-4 w-4" />
            Novo imóvel
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Imóveis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{properties.length} imóveis cadastrados</p>
        </div>
        <Link to="/imoveis/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo imóvel
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, endereço ou código…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="w-auto">
          <option value="todos">Todas as situações</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </Select>
        <div className="flex overflow-hidden rounded-lg ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
          <button
            onClick={() => setView('cards')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium',
              view === 'cards'
                ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950'
                : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </button>
          <button
            onClick={() => setView('tabela')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium',
              view === 'tabela'
                ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950'
                : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
            )}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Tabela
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          Nenhum imóvel encontrado com esse filtro.
        </Card>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <PropertyTable properties={filtered} />
      )}
    </div>
  )
}
