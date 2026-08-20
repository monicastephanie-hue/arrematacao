import { useState } from 'react'
import { AlertTriangle, ClipboardPaste, Sparkles } from 'lucide-react'
import type { ValueEntry, ValueType } from '@/types'
import { VALUE_TYPE_META } from '@/types'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/field'
import { parsePastedExpenses, type ParsedExpense } from '@/lib/parse-expenses'
import { cn } from '@/lib/cn'

export function BulkValueImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean
  onClose: () => void
  onImport: (entries: Omit<ValueEntry, 'id'>[]) => void
}) {
  const [text, setText] = useState('')
  const [candidates, setCandidates] = useState<ParsedExpense[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function reset() {
    setText('')
    setCandidates([])
    setSelected(new Set())
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleAnalyze() {
    const parsed = parsePastedExpenses(text)
    setCandidates(parsed)
    setSelected(new Set(parsed.filter((c) => !c.duplicate).map((c) => c.id)))
  }

  function update(id: string, patch: Partial<ParsedExpense>) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const today = new Date().toISOString().slice(0, 10)
    const entries = candidates
      .filter((c) => selected.has(c.id))
      .map((c) => ({
        date: c.date ?? today,
        type: c.type,
        amount: c.amount,
        description: c.description,
      }))
    if (entries.length === 0) return
    onImport(entries)
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Colar mensagens e lançar valores" widthClassName="max-w-2xl">
      <div className="flex flex-col gap-4">
        {candidates.length === 0 ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cole abaixo o texto das mensagens (ex.: do grupo do WhatsApp) com as despesas dessa arrematação. Eu
              procuro valores, datas e descrições — você revisa e confirma antes de salvar.
            </p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'📅 Em 18.08.26\nPagamento Boletos IPTU/ITBI\n💰Valor Total: R$ 1.610,25\n\n...ou linhas soltas como "Boleto do condomínio - R$340 - pago dia 10/08"'}
              className="min-h-40"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="button" size="sm" onClick={handleAnalyze} disabled={!text.trim()}>
                <Sparkles className="h-3.5 w-3.5" />
                Analisar texto
              </Button>
            </div>
          </>
        ) : (
          <>
            {candidates.length === 0 ? null : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Encontrei {candidates.length} {candidates.length === 1 ? 'lançamento' : 'lançamentos'}. Revise, ajuste
                o que precisar e desmarque o que não quiser importar.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800',
                    !selected.has(c.id) && 'opacity-50',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      className="mt-2.5 h-4 w-4 shrink-0 rounded border-slate-300 text-orange-600 focus:ring-orange-600 dark:border-slate-600 dark:bg-slate-800 dark:text-orange-400 dark:focus:ring-orange-400"
                    />
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[7rem_9rem_1fr_9rem]">
                      <Input
                        type="date"
                        value={c.date ?? ''}
                        onChange={(e) => update(c.id, { date: e.target.value || null })}
                      />
                      <Select value={c.type} onChange={(e) => update(c.id, { type: e.target.value as ValueType })}>
                        {Object.entries(VALUE_TYPE_META).map(([type, meta]) => (
                          <option key={type} value={type}>
                            {meta.label}
                          </option>
                        ))}
                      </Select>
                      <Input
                        value={c.description}
                        onChange={(e) => update(c.id, { description: e.target.value })}
                        placeholder="Descrição"
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={c.amount || ''}
                        onChange={(e) => update(c.id, { amount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  {c.duplicate && (
                    <p className="ml-6 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Parece repetido no texto colado — deixei desmarcado por padrão.
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCandidates([])}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Colar outro texto
              </button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={handleConfirm} disabled={selected.size === 0}>
                  Adicionar {selected.size} {selected.size === 1 ? 'lançamento' : 'lançamentos'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
