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

/** Status do quadro de Gerenciamento (Kanban) — controle à parte, não associado às etapas do imóvel. */
export type KanbanStatus = 'arrematado' | 'em_reforma' | 'pronto_venda' | 'vendido'

export const KANBAN_STATUS_ORDER: KanbanStatus[] = ['arrematado', 'em_reforma', 'pronto_venda', 'vendido']

export const KANBAN_STATUS_META: Record<KanbanStatus, { label: string; dot: string }> = {
  arrematado: { label: 'Imóvel Arrematado', dot: 'bg-sky-400' },
  em_reforma: { label: 'Imóvel em Reforma', dot: 'bg-amber-400' },
  pronto_venda: { label: 'Imóvel Pronto para venda', dot: 'bg-violet-400' },
  vendido: { label: 'Imóvel Vendido', dot: 'bg-emerald-400' },
}

export type StageStatus = 'pendente' | 'em_andamento' | 'concluida'

export const STAGE_STATUS_META: Record<StageStatus, { label: string; className: string; dot: string }> = {
  pendente: { label: 'Pendente', className: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-300 dark:bg-slate-600' },
  em_andamento: { label: 'Em andamento', className: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400' },
  concluida: { label: 'Concluída', className: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

/** Item individual do checklist de atividades de uma etapa. */
export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Stage {
  id: string
  name: string
  status: StageStatus
  /** Data de conclusão ou vencimento, conforme o caso (ex.: vencimento do GCAP). */
  date: string | null
  /** Anotação livre com a conclusão/observação da etapa (ex.: "OK - 124k - Dia 30 R$300"). */
  notes: string
  /** Atividades da etapa. Quando não vazio, o status da etapa é derivado automaticamente
   *  do checklist: nenhuma marcada = pendente, algumas = em andamento, todas = concluída. */
  checklist: ChecklistItem[]
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

/** Documento anexado ao imóvel (edital, matrícula, laudo, etc.), salvo como data URL. */
export interface Attachment {
  id: string
  name: string
  fileName: string
  mimeType: string
  size: number
  dataUrl: string
  uploadedAt: string
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
  /** Valor pelo qual o imóvel foi efetivamente arrematado no leilão. */
  auctionValue: number | null
  /** Valor de mercado estimado, usado para projetar o resultado. */
  marketValue: number | null
  /** Imóvel comprado com financiamento (ex.: Caixa) em vez de à vista. */
  financed: boolean
  /** Cotistas que dividem a compra deste imóvel (ids de Cotista). */
  cotistaIds: string[]
  /** Foto de capa do imóvel, como data URL (já redimensionada/comprimida no upload). */
  photoUrl: string | null
  /** Proposta de arrematação enviada/aceita no leilão. */
  proposalAttachment: Attachment | null
  /** Boleto de pagamento do arremate. */
  billAttachment: Attachment | null
  status: PropertyStatus
  /** Posição no quadro de Gerenciamento (Kanban) — controle independente das etapas. */
  kanbanStatus: KanbanStatus
  notes: string
  createdAt: string
  updatedAt: string
  stages: Stage[]
  values: ValueEntry[]
  attachments: Attachment[]
}

/** Fluxo padrão observado no controle atual em planilha: do pagamento do arremate até a venda. */
export const DEFAULT_STAGE_NAMES = [
  'Arrematação',
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

/** Atividades sugeridas para cada etapa padrão, usadas como checklist inicial de cada imóvel. */
export const DEFAULT_STAGE_CHECKLISTS: Record<string, string[]> = {
  Arrematação: ['Efetuar lance para arrematação', 'Efetuar o pagamento do boleto', 'Alterar proposta para inclusão de todos os cotistas pagantes'],
  'IPTU / ITBI': ['Levantar débitos de IPTU anteriores', 'Calcular e pagar o ITBI', 'Guardar guias e comprovantes'],
  'CHB / Escritura': ['Solicitar a Carta de Habilitação (CHB)', 'Agendar e assinar a escritura', 'Reconhecer firma quando exigido'],
  Registro: ['Protocolar a escritura no cartório de registro de imóveis', 'Pagar emolumentos e taxas de registro', 'Retirar a matrícula atualizada'],
  Desocupação: ['Verificar se o imóvel está ocupado', 'Notificar o ocupante/ex-proprietário', 'Acompanhar ação de imissão na posse (se necessário)', 'Confirmar a desocupação'],
  Reforma: ['Orçar a reforma', 'Contratar equipe e materiais', 'Executar a reforma', 'Vistoria final da obra'],
  Vistoria: ['Agendar a vistoria', 'Realizar a vistoria', 'Registrar fotos e laudo'],
  'Comprador aprovado': ['Anunciar o imóvel para venda', 'Receber e avaliar propostas', 'Aprovar comprador (cadastro/financiamento)'],
  Venda: ['Assinar contrato/escritura de venda', 'Registrar a transferência', 'Receber o pagamento e repassar aos cotistas'],
  'GCAP (imposto de renda)': ['Calcular o ganho de capital', 'Emitir e pagar o DARF do GCAP', 'Guardar comprovante para a declaração de IR'],
}

/** Pessoa que participa da compra de um ou mais imóveis. */
export interface Cotista {
  id: string
  name: string
  phone: string
  email: string
  /** Qualificação civil completa (nacionalidade, estado civil, profissão, CPF, RG, endereço...), pronta para colar em contratos. */
  qualification: string
  notes: string
  createdAt: string
}

export type AuctionKind = 'judicial' | 'extrajudicial'
export type PaymentKind = 'avista' | 'parcelado'
export type CartorioBase = 'avaliacao' | 'lance' | 'venda'

export const AUCTION_KIND_LABELS: Record<AuctionKind, string> = {
  judicial: 'Judicial',
  extrajudicial: 'Extrajudicial',
}

export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  avista: 'À vista',
  parcelado: 'Parcelado',
}

export const CARTORIO_BASE_LABELS: Record<CartorioBase, string> = {
  avaliacao: 'Valor de avaliação',
  lance: 'Valor do lance',
  venda: 'Valor de venda',
}

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

/** Simulação salva na calculadora de investimento. */
export interface Simulation {
  id: string
  label: string
  createdAt: string

  // Informações básicas do leilão
  auctionKind: AuctionKind
  bidValue: number
  cep: string
  state: string
  city: string
  auctionUrl: string
  correctionIndexPct: number // usado no lugar do CEP quando o pagamento é parcelado

  // Receitas
  saleValue: number
  saleMarkup: number
  saleDiscount: number
  monthlyRentalIncome: number
  brokerPct: number
  auctioneerPct: number

  // Despesas — custos cartoriais
  registryAuto: boolean
  registryBase: CartorioBase
  fiscalEvaluation: number
  registryEstimatedPct: number
  registryManualCost: number

  // Despesas — demais
  itbiPct: number
  monthlyIptu: number
  monthlyCondo: number
  vacancyRenovationCost: number
  opportunityCostPctYear: number
  incomeTaxPct: number
  additionalCosts: number
  advisoryCost: number

  // Pagamento
  paymentKind: PaymentKind
  cashDiscount: number

  // Detalhes da simulação
  holdingMonths: number
  minProfitPct: number
  bidIncrement: number
  monthsToTitle: number
  coOwnersCount: number
}
