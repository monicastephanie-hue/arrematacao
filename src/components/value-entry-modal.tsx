import { useEffect, useState } from 'react'
import type { ValueEntry, ValueType } from '@/types'
import { VALUE_TYPE_META } from '@/types'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field'
import { todayISO } from '@/lib/format'

type FormValue = Omit<ValueEntry, 'id'>

const emptyValue: FormValue = { date: todayISO(), type: 'lance', amount: 0, description: '' }

export function ValueEntryModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (entry: FormValue) => void
  initial?: ValueEntry
}) {
  const [form, setForm] = useState<FormValue>(initial ?? emptyValue)

  // Reset local state whenever the modal is (re)opened, so stale edits from a
  // previous entry never leak into the next add/edit.
  useEffect(() => {
    if (open) setForm(initial ?? { ...emptyValue, date: todayISO() })
  }, [open, initial])

  function set<K extends keyof FormValue>(key: K, value: FormValue[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
    setForm(emptyValue)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar valor' : 'Adicionar valor'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label htmlFor="value-date">Data</Label>
            <Input id="value-date" type="date" required value={form.date} onChange={(e) => set('date', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="value-amount">Valor (R$)</Label>
            <Input
              id="value-amount"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.amount || ''}
              onChange={(e) => set('amount', Number(e.target.value))}
            />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label htmlFor="value-type">Tipo</Label>
          <Select id="value-type" value={form.type} onChange={(e) => set('type', e.target.value as ValueType)}>
            {Object.entries(VALUE_TYPE_META).map(([type, meta]) => (
              <option key={type} value={type}>
                {meta.label} {meta.kind === 'receita' ? '(receita)' : ''}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="value-description" hint="opcional">
            Descrição
          </Label>
          <Textarea
            id="value-description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Detalhes desse valor"
          />
        </FieldGroup>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
