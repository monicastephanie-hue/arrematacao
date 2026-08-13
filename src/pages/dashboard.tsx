import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, LayoutGrid, ListChecks, Plus, Search, Table as TableIcon, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { PropertyStatus } from '@/types'
import { STATUS_META, STATUS_ORDER } from '@/types'
import { StatCard } from '@/components/stat-card'
import { PropertyCard } from '@/components/property-card'
import { PropertyTable } from '@/components/property-table'
import { InvestmentByPropertyChart } from '@/components/charts/investment-by-property-chart'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/field'
import { Card } from '@/components/ui/card'
import { currentStage, isActive, netResult, totalInvested } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
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

  const totalInvestedAll = useMemo(() => properties.reduce((sum, p) => sum + totalInvested(p), 0), [properties])

  const activeCount = properties.filter(isActive).length
  const soldCount = properties.filter((p) => p.status === 'vendido').length

  const avgPurchasePrice = useMemo(() => {
    const withLance = properties.filter((p) => p.values.some((v) => v.type === 'lance'))
    if (withLance.length === 0) return null
    const total = withLance.reduce(
      (sum, p) => sum + p.values.filter((v) => v.type === 'lance').reduce((s, v) => s + v.amount, 0),
      0,
    )
    return total / withLance.length
  }, [properties])

  const soldNetResult = useMemo(
    () => properties.filter((p) => p.status === 'vendido').reduce((sum, p) => sum + netResult(p), 0),
    [properties],
  )

  const stageBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of properties.filter(isActive)) {
      const stage = currentStage(p)
      if (!stage) continue
      counts.set(stage.name, (counts.get(stage.name) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [properties])

  const chartData = useMemo(
    () =>
      properties
        .map((p) => ({ name: p.title, value: totalInvested(p) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .reverse(),
    [properties],
  )

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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Andamento de todas as arrematações</p>
        </div>
        <Link to="/imoveis/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo imóvel
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total investido" value={formatCurrency(totalInvestedAll)} icon={<Banknote className="h-4 w-4" />} hint={`${properties.length} imóveis`} />
        <StatCard label="Em andamento" value={activeCount} icon={<ListChecks className="h-4 w-4" />} />
        <StatCard label="Vendidos" value={soldCount} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard
          label="Resultado (vendidos)"
          value={formatCurrency(soldNetResult)}
          tone={soldNetResult > 0 ? 'positive' : soldNetResult < 0 ? 'negative' : 'default'}
          hint={avgPurchasePrice ? `Preço médio de compra: ${formatCurrency(avgPurchasePrice)}` : undefined}
        />
      </div>

      {(chartData.length > 0 || stageBreakdown.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-5">
          {chartData.length > 0 && (
            <Card className="p-4 lg:col-span-3">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Investido por imóvel</h2>
              <InvestmentByPropertyChart data={chartData} />
            </Card>
          )}
          {stageBreakdown.length > 0 && (
            <Card className="p-4 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Imóveis por etapa atual</h2>
              <ul className="flex flex-col gap-2.5">
                {stageBreakdown.map(({ name, count }) => (
                  <li key={name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-600 dark:text-slate-400">{name}</span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
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
                ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950'
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
                ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950'
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
