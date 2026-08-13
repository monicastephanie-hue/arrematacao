import { useState } from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Label, Input } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

export function CotistaPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const cotistas = useStore((s) => s.cotistas)
  const addCotista = useStore((s) => s.addCotista)
  const [newName, setNewName] = useState('')

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  function handleAddCotista(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const id = addCotista({ name, phone: '', email: '', notes: '' })
    onChange([...value, id])
    setNewName('')
  }

  return (
    <div>
      <Label hint="opcional">Cotistas</Label>

      {cotistas.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {cotistas.map((c) => {
            const checked = value.includes(c.id)
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(c.id)}
                className={
                  checked
                    ? 'rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-orange-500 dark:text-slate-950'
                    : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }
              >
                {c.name}
              </button>
            )
          })}
        </div>
      )}

      <form onSubmit={handleAddCotista} className="flex gap-2">
        <div className="relative flex-1">
          <UserPlus className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome de um novo cotista"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </form>
    </div>
  )
}
