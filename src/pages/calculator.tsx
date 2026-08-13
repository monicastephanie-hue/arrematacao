import { useMemo, useState } from 'react'
import { Calculator as CalculatorIcon, Save, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Simulation } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label } from '@/components/ui/field'
import { StatCard } from '@/components/stat-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

type Inputs = Omit<Simulation, 'id' | 'createdAt' | 'label'>

const emptyInputs: Inputs = {
  evaluationValue: 0,
  bidValue: 0,
  auctioneerCommissionPct: 5,
  itbiPct: 3,
  registryCosts: 0,
  renovationCost: 0,
  otherCosts: 0,
  saleValue: 0,
  coOwnersCount: 1,
}

function computeResult(inputs: Inputs) {
  const commissionAmount = (inputs.bidValue * inputs.auctioneerCommissionPct) / 100
  const itbiAmount = (inputs.bidValue * inputs.itbiPct) / 100
  const totalCost = inputs.bidValue + commissionAmount + itbiAmount + inputs.registryCosts + inputs.renovationCost + inputs.otherCosts
  const profit = inputs.saleValue - totalCost
  const roiPct = totalCost > 0 ? (profit / totalCost) * 100 : null
  const perCoOwner = inputs.coOwnersCount > 0 ? totalCost / inputs.coOwnersCount : null
  return { commissionAmount, itbiAmount, totalCost, profit, roiPct, perCoOwner }
}

export default function Calculator() {
  const simulations = useStore((s) => s.simulations)
  const addSimulation = useStore((s) => s.addSimulation)
  const deleteSimulation = useStore((s) => s.deleteSimulation)

  const [inputs, setInputs] = useState<Inputs>(emptyInputs)
  const [label, setLabel] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Simulation | null>(null)

  function set<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs((f) => ({ ...f, [key]: value }))
  }

  const result = useMemo(() => computeResult(inputs), [inputs])

  function handleSave() {
    addSimulation({ ...inputs, label: label.trim() || 'Simulação sem nome' })
    setLabel('')
  }

  function loadSimulation(sim: Simulation) {
    setInputs({
      evaluationValue: sim.evaluationValue,
      bidValue: sim.bidValue,
      auctioneerCommissionPct: sim.auctioneerCommissionPct,
      itbiPct: sim.itbiPct,
      registryCosts: sim.registryCosts,
      renovationCost: sim.renovationCost,
      otherCosts: sim.otherCosts,
      saleValue: sim.saleValue,
      coOwnersCount: sim.coOwnersCount,
    })
    setLabel(sim.label)
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="calc-evaluation" hint="opcional">
                Valor de avaliação
              </Label>
              <Input
                id="calc-evaluation"
                type="number"
                min={0}
                step="0.01"
                value={inputs.evaluationValue || ''}
                onChange={(e) => set('evaluationValue', Number(e.target.value) || 0)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="calc-bid">Valor do lance</Label>
              <Input
                id="calc-bid"
                type="number"
                min={0}
                step="0.01"
                value={inputs.bidValue || ''}
                onChange={(e) => set('bidValue', Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="calc-commission" hint="%">
                Comissão do leiloeiro
              </Label>
              <Input
                id="calc-commission"
                type="number"
                min={0}
                step="0.1"
                value={inputs.auctioneerCommissionPct || ''}
                onChange={(e) => set('auctioneerCommissionPct', Number(e.target.value) || 0)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="calc-itbi" hint="%">
                ITBI
              </Label>
              <Input
                id="calc-itbi"
                type="number"
                min={0}
                step="0.1"
                value={inputs.itbiPct || ''}
                onChange={(e) => set('itbiPct', Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FieldGroup>
              <Label htmlFor="calc-registry" hint="opcional">
                Cartório/registro
              </Label>
              <Input
                id="calc-registry"
                type="number"
                min={0}
                step="0.01"
                value={inputs.registryCosts || ''}
                onChange={(e) => set('registryCosts', Number(e.target.value) || 0)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="calc-renovation" hint="opcional">
                Reforma
              </Label>
              <Input
                id="calc-renovation"
                type="number"
                min={0}
                step="0.01"
                value={inputs.renovationCost || ''}
                onChange={(e) => set('renovationCost', Number(e.target.value) || 0)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="calc-other" hint="opcional">
                Outros custos
              </Label>
              <Input
                id="calc-other"
                type="number"
                min={0}
                step="0.01"
                value={inputs.otherCosts || ''}
                onChange={(e) => set('otherCosts', Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="calc-sale" hint="opcional">
                Valor de venda estimado
              </Label>
              <Input
                id="calc-sale"
                type="number"
                min={0}
                step="0.01"
                value={inputs.saleValue || ''}
                onChange={(e) => set('saleValue', Number(e.target.value) || 0)}
              />
            </FieldGroup>
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
          </div>

          <div className="flex items-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
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

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Custo total" value={formatCurrency(result.totalCost)} />
            <StatCard
              label="Lucro estimado"
              value={formatCurrency(result.profit)}
              tone={result.profit > 0 ? 'positive' : result.profit < 0 ? 'negative' : 'default'}
            />
            <StatCard
              label="ROI"
              value={result.roiPct === null ? '—' : `${result.roiPct.toFixed(1)}%`}
              tone={result.roiPct === null ? 'default' : result.roiPct > 0 ? 'positive' : 'negative'}
            />
            <StatCard label="Valor por cotista" value={result.perCoOwner === null ? '—' : formatCurrency(result.perCoOwner)} />
          </div>

          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Composição do custo</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <CostRow label="Lance" value={inputs.bidValue} />
              <CostRow label={`Comissão do leiloeiro (${inputs.auctioneerCommissionPct}%)`} value={result.commissionAmount} />
              <CostRow label={`ITBI (${inputs.itbiPct}%)`} value={result.itbiAmount} />
              <CostRow label="Cartório/registro" value={inputs.registryCosts} />
              <CostRow label="Reforma" value={inputs.renovationCost} />
              <CostRow label="Outros custos" value={inputs.otherCosts} />
              <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-200">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(result.totalCost)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      {simulations.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Simulações salvas</h2>
          <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
            {simulations.map((sim) => {
              const simResult = computeResult(sim)
              return (
                <div key={sim.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{sim.label}</p>
                    <p className="text-xs text-slate-400">{formatDate(sim.createdAt.slice(0, 10))} · custo {formatCurrency(simResult.totalCost)}</p>
                  </div>
                  <div
                    className={cn(
                      'w-28 shrink-0 text-right text-sm font-semibold tabular-nums',
                      simResult.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : simResult.profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500',
                    )}
                  >
                    {formatCurrency(simResult.profit)}
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

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatCurrency(value)}</dd>
    </div>
  )
}
