import { useMemo } from 'react'
import { Banknote, ListChecks, TrendingUp, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { InvestmentByPropertyChart } from '@/components/charts/investment-by-property-chart'
import { currentStage, investedByCotista, isActive, netResult, totalInvested } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'

export default function Reports() {
  const properties = useStore((s) => s.properties)
  const cotistas = useStore((s) => s.cotistas)

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

  const investedByPropertyData = useMemo(
    () =>
      properties
        .map((p) => ({ name: p.title, value: totalInvested(p) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .reverse(),
    [properties],
  )

  const investedByCotistaData = useMemo(
    () =>
      cotistas
        .map((c) => ({ name: c.name, value: investedByCotista(properties, c.id) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
        .reverse(),
    [cotistas, properties],
  )

  if (properties.length === 0) {
    return (
      <Card className="px-6 py-16 text-center text-sm text-slate-500 dark:text-slate-400">
        Cadastre imóveis para começar a ver relatórios de investimento aqui.
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Relatórios</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Visão consolidada de todas as arrematações</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total investido"
          value={formatCurrency(totalInvestedAll)}
          icon={<Banknote className="h-4 w-4" />}
          hint={`${properties.length} imóveis`}
        />
        <StatCard label="Em andamento" value={activeCount} icon={<ListChecks className="h-4 w-4" />} />
        <StatCard label="Vendidos" value={soldCount} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard
          label="Resultado (vendidos)"
          value={formatCurrency(soldNetResult)}
          tone={soldNetResult > 0 ? 'positive' : soldNetResult < 0 ? 'negative' : 'default'}
          hint={avgPurchasePrice ? `Preço médio de compra: ${formatCurrency(avgPurchasePrice)}` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {investedByPropertyData.length > 0 && (
          <Card className="p-4 lg:col-span-3">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Investido por imóvel</h2>
            <InvestmentByPropertyChart data={investedByPropertyData} />
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

      {investedByCotistaData.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Users className="h-4 w-4" />
            Investido por cotista
          </h2>
          <InvestmentByPropertyChart data={investedByCotistaData} />
        </Card>
      )}
    </div>
  )
}
