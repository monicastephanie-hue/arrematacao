import type { Property } from '@/types'
import { VALUE_TYPE_META } from '@/types'

export function totalInvested(property: Property): number {
  return property.values
    .filter((v) => VALUE_TYPE_META[v.type].kind === 'despesa')
    .reduce((sum, v) => sum + v.amount, 0)
}

export function totalReceived(property: Property): number {
  return property.values
    .filter((v) => VALUE_TYPE_META[v.type].kind === 'receita')
    .reduce((sum, v) => sum + v.amount, 0)
}

export function netResult(property: Property): number {
  return totalReceived(property) - totalInvested(property)
}

/** Resultado potencial: valor de mercado estimado menos o que já foi investido. */
export function potentialResult(property: Property): number | null {
  if (property.marketValue === null) return null
  return property.marketValue - totalInvested(property)
}

export function stageProgress(property: Property): number {
  if (property.stages.length === 0) return 0
  const done = property.stages.filter((s) => s.status === 'concluida').length
  return Math.round((done / property.stages.length) * 100)
}

export function currentStage(property: Property) {
  return (
    property.stages.find((s) => s.status === 'em_andamento') ??
    property.stages.find((s) => s.status === 'pendente') ??
    property.stages[property.stages.length - 1] ??
    null
  )
}

export function isActive(property: Property): boolean {
  return property.status === 'em_andamento'
}

/** Valor investido dividido entre os cotistas, quando aplicável. */
export function valuePerCoOwner(property: Property): number | null {
  if (property.cotistaIds.length === 0) return null
  return totalInvested(property) / property.cotistaIds.length
}

/** Imóveis dos quais um cotista participa. */
export function propertiesForCotista(properties: Property[], cotistaId: string): Property[] {
  return properties.filter((p) => p.cotistaIds.includes(cotistaId))
}

/** Soma da parte investida por um cotista, considerando a divisão em cada imóvel do qual participa. */
export function investedByCotista(properties: Property[], cotistaId: string): number {
  return propertiesForCotista(properties, cotistaId).reduce((sum, p) => sum + (valuePerCoOwner(p) ?? 0), 0)
}

/** Lista ordenada dos nomes de etapa distintos usados em todos os imóveis (para a visão em tabela). */
export function collectStageColumns(properties: Property[]): string[] {
  const seen: string[] = []
  for (const property of properties) {
    for (const stage of property.stages) {
      if (!seen.includes(stage.name)) seen.push(stage.name)
    }
  }
  return seen
}

/** Histórico acumulado de valores investidos, ordenado por data, para gráficos. */
export function cumulativeInvestmentSeries(property: Property): { date: string; total: number }[] {
  const expenseEntries = property.values
    .filter((v) => VALUE_TYPE_META[v.type].kind === 'despesa')
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  let running = 0
  return expenseEntries.map((v) => {
    running += v.amount
    return { date: v.date, total: running }
  })
}
