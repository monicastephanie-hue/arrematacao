import { useMemo, useState } from 'react'
import {
  Banknote,
  Building2,
  Calculator as CalculatorIcon,
  Clock,
  Coins,
  FileStack,
  Gavel,
  Landmark,
  ListPlus,
  MapPin,
  Percent,
  Save,
  Trash2,
  Wrench,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { AuctionKind, CartorioBase, PaymentKind, Simulation } from '@/types'
import { AUCTION_KIND_LABELS, BRAZILIAN_STATES, CARTORIO_BASE_LABELS, PAYMENT_KIND_LABELS } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label, Select } from '@/components/ui/field'
import { AccordionItem } from '@/components/ui/accordion-item'
import { StatCard } from '@/components/stat-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ProgressBar } from '@/components/progress-bar'
import { type SimulationInputs, computeSimulationResult, defaultSimulationInputs } from '@/lib/simulation'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function Calculator() {
  const simulations = useStore((s) => s.simulations)
  const addSimulation = useStore((s) => s.addSimulation)
  const deleteSimulation = useStore((s) => s.deleteSimulation)

  const [inputs, setInputs] = useState<SimulationInputs>(defaultSimulationInputs)
  const [label, setLabel] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Simulation | null>(null)
  const [openExpense, setOpenExpense] = useState<string | null>('cartorio')

  function set<K extends keyof SimulationInputs>(key: K, value: SimulationInputs[K]) {
    setInputs((f) => ({ ...f, [key]: value }))
  }

  const result = useMemo(() => computeSimulationResult(inputs), [inputs])

  const requiredChecks = useMemo(
    () => [
      { label: 'Tipo de leilão', filled: true },
      { label: 'Valor do lance', filled: inputs.bidValue > 0 },
      inputs.paymentKind === 'avista'
        ? { label: 'CEP', filled: inputs.cep.trim() !== '' }
        : { label: 'Índice de correção', filled: inputs.correctionIndexPct > 0 },
      { label: 'Estado', filled: inputs.state !== '' },
      { label: 'Preço de venda', filled: inputs.saleValue > 0 },
      { label: 'Porcentagem corretor', filled: inputs.brokerPct > 0 },
      { label: 'Porcentagem leiloeiro', filled: inputs.auctioneerPct > 0 },
      inputs.registryAuto
        ? { label: 'Avaliação fiscal', filled: inputs.registryBase !== 'avaliacao' || inputs.fiscalEvaluation > 0 }
        : { label: 'Valor de cartório', filled: inputs.registryManualCost > 0 },
      { label: 'Tipo de pagamento', filled: true },
      { label: 'Giro de venda', filled: inputs.holdingMonths > 0 },
      { label: 'Lucro mínimo', filled: inputs.minProfitPct > 0 },
      { label: 'Meses até título aquisitivo', filled: inputs.monthsToTitle >= 0 },
    ],
    [inputs],
  )
  const filledCount = requiredChecks.filter((c) => c.filled).length

  function handleSave() {
    addSimulation({ ...inputs, label: label.trim() || 'Simulação sem nome' })
    setLabel('')
  }

  function loadSimulation(sim: Simulation) {
    const { id: _id, createdAt: _createdAt, label: simLabel, ...rest } = sim
    setInputs(rest)
    setLabel(simLabel)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          <CalculatorIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Calculadora
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Simule o custo total e o resultado de um arremate antes de dar o lance
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Coluna 1 */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 p-5">
            <SectionTitle icon={<Gavel className="h-4 w-4" />} title="Informações Básicas do Leilão" />

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-auction-kind">Tipo leilão *</Label>
                <Select id="calc-auction-kind" value={inputs.auctionKind} onChange={(e) => set('auctionKind', e.target.value as AuctionKind)}>
                  {(Object.entries(AUCTION_KIND_LABELS) as [AuctionKind, string][]).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-bid">Valor do lance *</Label>
                <Input id="calc-bid" type="number" min={0} step="0.01" value={inputs.bidValue || ''} onChange={(e) => set('bidValue', Number(e.target.value) || 0)} />
              </FieldGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {inputs.paymentKind === 'avista' ? (
                <FieldGroup>
                  <Label htmlFor="calc-cep">CEP *</Label>
                  <Input id="calc-cep" value={inputs.cep} onChange={(e) => set('cep', e.target.value)} placeholder="00000-000" />
                </FieldGroup>
              ) : (
                <FieldGroup>
                  <Label htmlFor="calc-correction" hint="% a.m.">
                    Índice de correção *
                  </Label>
                  <Input
                    id="calc-correction"
                    type="number"
                    min={0}
                    step="0.01"
                    value={inputs.correctionIndexPct || ''}
                    onChange={(e) => set('correctionIndexPct', Number(e.target.value) || 0)}
                  />
                </FieldGroup>
              )}
              <FieldGroup>
                <Label htmlFor="calc-state">Estado *</Label>
                <Select id="calc-state" value={inputs.state} onChange={(e) => set('state', e.target.value)}>
                  <option value="">Selecione</option>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-city" hint="opcional">
                  Cidade
                </Label>
                <Input id="calc-city" value={inputs.city} onChange={(e) => set('city', e.target.value)} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-url" hint="opcional">
                  Link do leilão
                </Label>
                <Input id="calc-url" type="url" value={inputs.auctionUrl} onChange={(e) => set('auctionUrl', e.target.value)} placeholder="https://" />
              </FieldGroup>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <SectionTitle icon={<Banknote className="h-4 w-4" />} title="Pagamento" />
            <FieldGroup>
              <Label htmlFor="calc-payment-kind">Tipo de pagamento *</Label>
              <Select id="calc-payment-kind" value={inputs.paymentKind} onChange={(e) => set('paymentKind', e.target.value as PaymentKind)}>
                {(Object.entries(PAYMENT_KIND_LABELS) as [PaymentKind, string][]).map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            {inputs.paymentKind === 'avista' && (
              <FieldGroup>
                <Label htmlFor="calc-cash-discount" hint="opcional">
                  Desconto à vista
                </Label>
                <Input
                  id="calc-cash-discount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.cashDiscount || ''}
                  onChange={(e) => set('cashDiscount', Number(e.target.value) || 0)}
                />
              </FieldGroup>
            )}
            <p className="text-xs text-slate-400">
              À vista mostra o desconto à vista. Parcelado troca o CEP pelo índice de correção mensal.
            </p>
          </Card>
        </div>

        {/* Coluna 2 */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 p-5">
            <SectionTitle icon={<Coins className="h-4 w-4" />} title="Receitas" />

            <FieldGroup>
              <Label htmlFor="calc-sale">Preço de venda *</Label>
              <Input id="calc-sale" type="number" min={0} step="0.01" value={inputs.saleValue || ''} onChange={(e) => set('saleValue', Number(e.target.value) || 0)} />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-sale-markup" hint="opcional">
                  Taxa de acréscimo venda
                </Label>
                <Input
                  id="calc-sale-markup"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.saleMarkup || ''}
                  onChange={(e) => set('saleMarkup', Number(e.target.value) || 0)}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-sale-discount" hint="opcional">
                  Desconto venda
                </Label>
                <Input
                  id="calc-sale-discount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.saleDiscount || ''}
                  onChange={(e) => set('saleDiscount', Number(e.target.value) || 0)}
                />
              </FieldGroup>
            </div>

            <FieldGroup>
              <Label htmlFor="calc-rental" hint="R$/mês, opcional">
                Receita aluguel
              </Label>
              <Input
                id="calc-rental"
                type="number"
                min={0}
                step="0.01"
                value={inputs.monthlyRentalIncome || ''}
                onChange={(e) => set('monthlyRentalIncome', Number(e.target.value) || 0)}
              />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-broker" hint="%">
                  Porcentagem corretor *
                </Label>
                <Input
                  id="calc-broker"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.brokerPct || ''}
                  onChange={(e) => set('brokerPct', Number(e.target.value) || 0)}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-auctioneer-sale" hint="%">
                  Porcentagem leiloeiro *
                </Label>
                <Input
                  id="calc-auctioneer-sale"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.auctioneerPct || ''}
                  onChange={(e) => set('auctioneerPct', Number(e.target.value) || 0)}
                />
              </FieldGroup>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <SectionTitle icon={<Clock className="h-4 w-4" />} title="Detalhes da Simulação" />
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-holding">Giro venda *</Label>
                <Select id="calc-holding" value={inputs.holdingMonths} onChange={(e) => set('holdingMonths', Number(e.target.value))}>
                  {[3, 6, 9, 12, 18, 24, 36].map((m) => (
                    <option key={m} value={m}>
                      {m} meses
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-min-profit" hint="%">
                  Lucro mínimo *
                </Label>
                <Input
                  id="calc-min-profit"
                  type="number"
                  min={0}
                  step="0.1"
                  value={inputs.minProfitPct || ''}
                  onChange={(e) => set('minProfitPct', Number(e.target.value) || 0)}
                />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-increment" hint="opcional">
                  Incremento lance
                </Label>
                <Input
                  id="calc-increment"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.bidIncrement || ''}
                  onChange={(e) => set('bidIncrement', Number(e.target.value) || 0)}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-title-months">
                  Meses até título aquisitivo *
                </Label>
                <Input
                  id="calc-title-months"
                  type="number"
                  min={0}
                  step="1"
                  value={inputs.monthsToTitle}
                  onChange={(e) => set('monthsToTitle', Number(e.target.value) || 0)}
                />
              </FieldGroup>
            </div>
            <FieldGroup>
              <Label htmlFor="calc-coowners" hint="opcional">
                Nº de cotistas
              </Label>
              <Input
                id="calc-coowners"
                type="number"
                min={1}
                step="1"
                value={inputs.coOwnersCount || ''}
                onChange={(e) => set('coOwnersCount', Number(e.target.value) || 1)}
              />
            </FieldGroup>
          </Card>
        </div>

        {/* Coluna 3 — Despesas */}
        <Card className="flex flex-col gap-2.5 p-5">
          <SectionTitle icon={<Wrench className="h-4 w-4" />} title="Despesas" />

          <AccordionItem
            icon={<Landmark className="h-4 w-4" />}
            title="Custos Cartoriais"
            subtitle={inputs.registryAuto ? 'Automático · estimativa' : 'Manual'}
            open={openExpense === 'cartorio'}
            onToggle={() => setOpenExpense(openExpense === 'cartorio' ? null : 'cartorio')}
          >
            <div className="flex overflow-hidden rounded-lg ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
              <button
                type="button"
                onClick={() => set('registryAuto', true)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium',
                  inputs.registryAuto ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400',
                )}
              >
                Automático
              </button>
              <button
                type="button"
                onClick={() => set('registryAuto', false)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium',
                  !inputs.registryAuto ? 'bg-orange-600 text-white dark:bg-orange-500 dark:text-slate-950' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400',
                )}
              >
                Manual
              </button>
            </div>

            {inputs.registryAuto ? (
              <>
                <FieldGroup>
                  <Label htmlFor="calc-cartorio-base">Base cálculo cartório *</Label>
                  <Select id="calc-cartorio-base" value={inputs.registryBase} onChange={(e) => set('registryBase', e.target.value as CartorioBase)}>
                    {(Object.entries(CARTORIO_BASE_LABELS) as [CartorioBase, string][]).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>
                {inputs.registryBase === 'avaliacao' && (
                  <FieldGroup>
                    <Label htmlFor="calc-fiscal-evaluation">Avaliação fiscal *</Label>
                    <Input
                      id="calc-fiscal-evaluation"
                      type="number"
                      min={0}
                      step="0.01"
                      value={inputs.fiscalEvaluation || ''}
                      onChange={(e) => set('fiscalEvaluation', Number(e.target.value) || 0)}
                    />
                  </FieldGroup>
                )}
                <FieldGroup>
                  <Label htmlFor="calc-registry-pct" hint="%">
                    Alíquota estimada
                  </Label>
                  <Input
                    id="calc-registry-pct"
                    type="number"
                    min={0}
                    step="0.01"
                    value={inputs.registryEstimatedPct || ''}
                    onChange={(e) => set('registryEstimatedPct', Number(e.target.value) || 0)}
                  />
                </FieldGroup>
                <p className="text-xs text-slate-400">
                  Estimativa — os valores reais variam por estado e cartório. Consulte a tabela oficial antes de decidir.
                </p>
              </>
            ) : (
              <FieldGroup>
                <Label htmlFor="calc-registry-manual">Valor de cartório/registro *</Label>
                <Input
                  id="calc-registry-manual"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.registryManualCost || ''}
                  onChange={(e) => set('registryManualCost', Number(e.target.value) || 0)}
                />
              </FieldGroup>
            )}
          </AccordionItem>

          <AccordionItem
            icon={<Percent className="h-4 w-4" />}
            title="ITBI"
            subtitle="Arrematação"
            open={openExpense === 'itbi'}
            onToggle={() => setOpenExpense(openExpense === 'itbi' ? null : 'itbi')}
          >
            <FieldGroup>
              <Label htmlFor="calc-itbi" hint="%">
                Alíquota ITBI
              </Label>
              <Input id="calc-itbi" type="number" min={0} step="0.01" value={inputs.itbiPct || ''} onChange={(e) => set('itbiPct', Number(e.target.value) || 0)} />
            </FieldGroup>
          </AccordionItem>

          <AccordionItem
            icon={<Clock className="h-4 w-4" />}
            title="Gastos Recorrentes"
            subtitle={`IPTU R$${inputs.monthlyIptu || 0}/mês · cond. R$${inputs.monthlyCondo || 0}`}
            open={openExpense === 'recorrentes'}
            onToggle={() => setOpenExpense(openExpense === 'recorrentes' ? null : 'recorrentes')}
          >
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup>
                <Label htmlFor="calc-iptu" hint="R$/mês">
                  IPTU
                </Label>
                <Input id="calc-iptu" type="number" min={0} step="0.01" value={inputs.monthlyIptu || ''} onChange={(e) => set('monthlyIptu', Number(e.target.value) || 0)} />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="calc-condo" hint="R$/mês">
                  Condomínio
                </Label>
                <Input id="calc-condo" type="number" min={0} step="0.01" value={inputs.monthlyCondo || ''} onChange={(e) => set('monthlyCondo', Number(e.target.value) || 0)} />
              </FieldGroup>
            </div>
          </AccordionItem>

          <AccordionItem
            icon={<Building2 className="h-4 w-4" />}
            title="Desocupação & Reforma"
            subtitle={inputs.vacancyRenovationCost > 0 ? formatCurrency(inputs.vacancyRenovationCost) : 'Nenhum custo informado'}
            open={openExpense === 'reforma'}
            onToggle={() => setOpenExpense(openExpense === 'reforma' ? null : 'reforma')}
          >
            <FieldGroup>
              <Label htmlFor="calc-vacancy">Custo estimado</Label>
              <Input
                id="calc-vacancy"
                type="number"
                min={0}
                step="0.01"
                value={inputs.vacancyRenovationCost || ''}
                onChange={(e) => set('vacancyRenovationCost', Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </AccordionItem>

          <AccordionItem
            icon={<CalculatorIcon className="h-4 w-4" />}
            title="Custo Oportunidade"
            subtitle={`${inputs.opportunityCostPctYear || 0}% ao ano`}
            open={openExpense === 'oportunidade'}
            onToggle={() => setOpenExpense(openExpense === 'oportunidade' ? null : 'oportunidade')}
          >
            <FieldGroup>
              <Label htmlFor="calc-opportunity" hint="% ao ano">
                Rentabilidade alternativa
              </Label>
              <Input
                id="calc-opportunity"
                type="number"
                min={0}
                step="0.1"
                value={inputs.opportunityCostPctYear || ''}
                onChange={(e) => set('opportunityCostPctYear', Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </AccordionItem>

          <AccordionItem
            icon={<FileStack className="h-4 w-4" />}
            title="Imposto de Renda"
            subtitle="Pessoa física"
            open={openExpense === 'ir'}
            onToggle={() => setOpenExpense(openExpense === 'ir' ? null : 'ir')}
          >
            <FieldGroup>
              <Label htmlFor="calc-ir" hint="% sobre o ganho de capital">
                Alíquota
              </Label>
              <Input id="calc-ir" type="number" min={0} step="0.1" value={inputs.incomeTaxPct || ''} onChange={(e) => set('incomeTaxPct', Number(e.target.value) || 0)} />
            </FieldGroup>
          </AccordionItem>

          <AccordionItem
            icon={<ListPlus className="h-4 w-4" />}
            title="Despesas Adicionais"
            subtitle={inputs.additionalCosts > 0 ? formatCurrency(inputs.additionalCosts) : 'Nenhuma informada'}
            open={openExpense === 'adicionais'}
            onToggle={() => setOpenExpense(openExpense === 'adicionais' ? null : 'adicionais')}
          >
            <FieldGroup>
              <Label htmlFor="calc-additional">Valor</Label>
              <Input
                id="calc-additional"
                type="number"
                min={0}
                step="0.01"
                value={inputs.additionalCosts || ''}
                onChange={(e) => set('additionalCosts', Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </AccordionItem>

          <AccordionItem
            icon={<MapPin className="h-4 w-4" />}
            title="Assessoria"
            subtitle={inputs.advisoryCost > 0 ? formatCurrency(inputs.advisoryCost) : 'Sem assessoria'}
            open={openExpense === 'assessoria'}
            onToggle={() => setOpenExpense(openExpense === 'assessoria' ? null : 'assessoria')}
          >
            <FieldGroup>
              <Label htmlFor="calc-advisory">Valor</Label>
              <Input id="calc-advisory" type="number" min={0} step="0.01" value={inputs.advisoryCost || ''} onChange={(e) => set('advisoryCost', Number(e.target.value) || 0)} />
            </FieldGroup>
          </AccordionItem>
        </Card>
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {filledCount} de {requiredChecks.length} campos obrigatórios preenchidos
          </span>
        </div>
        <ProgressBar value={(filledCount / requiredChecks.length) * 100} />
        <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <FieldGroup className="flex-1">
            <Label htmlFor="calc-label" hint="opcional">
              Nome da simulação
            </Label>
            <Input id="calc-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex.: Casa em Esmeraldas" />
          </FieldGroup>
          <Button onClick={handleSave} disabled={inputs.bidValue <= 0}>
            <Save className="h-4 w-4" />
            Salvar simulação
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-4">
          <StatCard label="Custo total" value={formatCurrency(result.totalCost)} />
          <StatCard label="Lucro líquido estimado" value={formatCurrency(result.netProfit)} tone={result.netProfit > 0 ? 'positive' : result.netProfit < 0 ? 'negative' : 'default'} />
          <StatCard
            label="ROI"
            value={result.roiPct === null ? '—' : `${result.roiPct.toFixed(1)}%`}
            tone={result.roiPct === null ? 'default' : result.roiPct >= inputs.minProfitPct ? 'positive' : 'negative'}
            hint={`Meta: ${inputs.minProfitPct}%`}
          />
          <StatCard label="Valor por cotista" value={result.perCoOwner === null ? '—' : formatCurrency(result.perCoOwner)} />
        </div>

        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Composição do custo</h2>
          <dl className="flex flex-col gap-1.5 text-sm">
            <CostRow label="Lance (líquido de desconto)" value={result.effectiveBidOutlay} />
            <CostRow label="Custos cartoriais" value={result.registryCost} />
            <CostRow label={`ITBI (${inputs.itbiPct}%)`} value={result.itbiAmount} />
            <CostRow label="IPTU + condomínio" value={result.recurringCosts} />
            <CostRow label="Desocupação & reforma" value={result.vacancyRenovationCost} />
            <CostRow label="Custo de oportunidade" value={result.opportunityCost} />
            <CostRow label={`Corretor (${inputs.brokerPct}%)`} value={result.brokerCost} />
            <CostRow label={`Leiloeiro (${inputs.auctioneerPct}%)`} value={result.auctioneerCost} />
            <CostRow label="Assessoria" value={result.advisoryCost} />
            <CostRow label="Despesas adicionais" value={result.additionalCosts} />
            <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(result.totalCost)}</dd>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <dt>Imposto de renda sobre o ganho</dt>
              <dd className="tabular-nums">{formatCurrency(result.incomeTaxAmount)}</dd>
            </div>
            {result.nextBidSuggestion !== null && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <dt>Próximo lance sugerido</dt>
                <dd className="tabular-nums">{formatCurrency(result.nextBidSuggestion)}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {simulations.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Simulações salvas</h2>
          <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
            {simulations.map((sim) => {
              const simResult = computeSimulationResult(sim)
              return (
                <div key={sim.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{sim.label}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(sim.createdAt.slice(0, 10))} · custo {formatCurrency(simResult.totalCost)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-28 shrink-0 text-right text-sm font-semibold tabular-nums',
                      simResult.netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : simResult.netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500',
                    )}
                  >
                    {formatCurrency(simResult.netProfit)}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => loadSimulation(sim)}>
                    Usar
                  </Button>
                  <button
                    onClick={() => setPendingDelete(sim)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    aria-label="Remover simulação"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover simulação"
        description={`Tem certeza que deseja remover a simulação "${pendingDelete?.label}"?`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteSimulation(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
    </div>
  )
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatCurrency(value)}</dd>
    </div>
  )
}
