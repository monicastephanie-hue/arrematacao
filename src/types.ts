export type PropertyStatus = 'em_andamento' | 'vendido' | 'perdido' | 'desistencia'

export const STATUS_ORDER: PropertyStatus[] = ['em_andamento', 'vendido', 'perdido', 'desistencia']

export const STATUS_META: Record<
  PropertyStatus,
  { label: string; className: string; group: 'ativo' | 'sucesso' | 'encerrado' }
> = {
  em_andamento: {
    label: 'Em andamento',
    className: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25',
    group: 'ativo',
  },
  vendido: {
    label: 'Vendido',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25',
    group: 'sucesso',
  },
  perdido: {
    label: 'Leilão perdido',
    className: 'bg-rose-100 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/25',
    group: 'encerrado',
  },
  desistencia: {
    label: 'Desistência',
    className: 'bg-zinc-100 text-zinc-600 ring-zinc-600/20 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-400/25',
    group: 'encerrado',
  },
}

export type StageStatus = 'pendente' | 'em_andamento' | 'concluida'

export const STAGE_STATUS_META: Record<StageStatus, { label: string; className: string; dot: string }> = {
  pendente: { label: 'Pendente', className: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-300 dark:bg-slate-600' },
  em_andamento: { label: 'Em andamento', className: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400' },
  concluida: { label: 'Concluída', className: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

export interface Stage {
  id: string
  name: string
  status: StageStatus
  /** Data de conclusão ou vencimento, conforme o caso (ex.: vencimento do GCAP). */
  date: string | null
  /** Anotação livre com a conclusão/observação da etapa (ex.: "OK - 124k - Dia 30 R$300"). */
  notes: string
}

export type ValueType =
  | 'lance'
  | 'sinal'
  | 'comissao_leiloeiro'
  | 'itbi'
  | 'custas_cartorio'
  | 'advogado'
  | 'reforma'
  | 'condominio_iptu'
  | 'gcap'
  | 'venda'
  | 'outro'

export const VALUE_TYPE_META: Record<ValueType, { label: string; kind: 'despesa' | 'receita' }> = {
  lance: { label: 'Lance / arremate (boleto)', kind: 'despesa' },
  sinal: { label: 'Sinal / entrada', kind: 'despesa' },
  comissao_leiloeiro: { label: 'Comissão do leiloeiro', kind: 'despesa' },
  itbi: { label: 'ITBI', kind: 'despesa' },
  custas_cartorio: { label: 'Custas de cartório/registro', kind: 'despesa' },
  advogado: { label: 'Honorários advocatícios', kind: 'despesa' },
  reforma: { label: 'Reforma / manutenção', kind: 'despesa' },
  condominio_iptu: { label: 'Condomínio / IPTU', kind: 'despesa' },
  gcap: { label: 'Imposto de renda (ganho de capital)', kind: 'despesa' },
  venda: { label: 'Venda do imóvel', kind: 'receita' },
  outro: { label: 'Outro', kind: 'despesa' },
}

export interface ValueEntry {
  id: string
  date: string
  type: ValueType
  amount: number
  description: string
}

export interface Property {
  id: string
  title: string
  address: string
  auctionHouse: string
  /** Código do banco/leiloeiro (ex.: Código Caixa) ou nº de matrícula, usado para identificar o imóvel. */
  bankCode: string
  auctionUrl: string
  processNumber: string
  auctionDate: string | null
  /** Valor de avaliação do edital. */
  evaluationValue: number | null
  /** Valor de mercado estimado, usado para projetar o resultado. */
  marketValue: number | null
  /** Imóvel comprado com financiamento (ex.: Caixa) em vez de à vista. */
  financed: boolean
  /** Número de cotistas que dividem a compra deste imóvel. */
  coOwners: number | null
  status: PropertyStatus
  notes: string
  createdAt: string
  updatedAt: string
  stages: Stage[]
  values: ValueEntry[]
}

/** Fluxo padrão observado no controle atual em planilha: do pagamento do arremate até a venda. */
export const DEFAULT_STAGE_NAMES = [
  'Pagamento do arremate',
  'IPTU / ITBI',
  'CHB / Escritura',
  'Registro',
  'Desocupação',
  'Reforma',
  'Vistoria',
  'Comprador aprovado',
  'Venda',
  'GCAP (imposto de renda)',
]
