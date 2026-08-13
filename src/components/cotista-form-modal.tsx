import { useEffect, useState } from 'react'
import type { Cotista } from '@/types'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label, Textarea } from '@/components/ui/field'

type FormValue = Omit<Cotista, 'id' | 'createdAt'>

const emptyValue: FormValue = { name: '', phone: '', email: '', notes: '' }

export function CotistaFormModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (value: FormValue) => void
  initial?: Cotista
}) {
  const [form, setForm] = useState<FormValue>(initial ?? emptyValue)

  useEffect(() => {
    if (open) setForm(initial ?? emptyValue)
  }, [open, initial])

  function set<K extends keyof FormValue>(key: K, value: FormValue[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar cotista' : 'Novo cotista'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGroup>
          <Label htmlFor="cotista-name">Nome</Label>
          <Input id="cotista-name" required autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label htmlFor="cotista-phone" hint="opcional">
              Telefone
            </Label>
            <Input id="cotista-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(00) 00000-0000" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cotista-email" hint="opcional">
              E-mail
            </Label>
            <Input id="cotista-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label htmlFor="cotista-notes" hint="opcional">
            Observações
          </Label>
          <Textarea id="cotista-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
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
