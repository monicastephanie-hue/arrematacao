import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Stage } from '@/types'
import { STAGE_STATUS_META } from '@/types'
import { useStore } from '@/store/useStore'
import { AccordionItem } from '@/components/ui/accordion-item'
import { getStageIcon } from '@/lib/stage-icons'
import { cn } from '@/lib/cn'

function AddItemForm({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Adicionar atividade..."
        className="w-full rounded-lg border-0 bg-slate-100 px-3 py-1.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:focus:ring-orange-400"
      />
      <button
        type="submit"
        className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar
      </button>
    </form>
  )
}

function StageChecklistItems({ propertyId, stage }: { propertyId: string; stage: Stage }) {
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem)
  const addChecklistItem = useStore((s) => s.addChecklistItem)
  const deleteChecklistItem = useStore((s) => s.deleteChecklistItem)

  return (
    <>
      {stage.checklist.length > 0 ? (
        <div className="flex flex-col gap-1">
          {stage.checklist.map((item) => (
            <label
              key={item.id}
              className={cn(
                'group flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm',
                item.done ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300',
              )}
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleChecklistItem(propertyId, stage.id, item.id)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-orange-600 focus:ring-orange-600 dark:border-slate-600 dark:bg-slate-800 dark:text-orange-400 dark:focus:ring-orange-400"
              />
              <span className={cn('min-w-0 flex-1', item.done && 'line-through')}>{item.text}</span>
              <button
                type="button"
                onClick={() => deleteChecklistItem(propertyId, stage.id, item.id)}
                className="shrink-0 text-slate-300 opacity-0 hover:text-rose-600 group-hover:opacity-100 dark:text-slate-600"
                aria-label={`Remover atividade "${item.text}"`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </label>
          ))}
        </div>
      ) : (
        <p className="px-2 text-xs text-slate-400">Nenhuma atividade cadastrada ainda.</p>
      )}
      <AddItemForm onAdd={(text) => addChecklistItem(propertyId, stage.id, text)} />
    </>
  )
}

/** Checklist de atividades por etapa. Ao marcar/desmarcar itens, o status da etapa exibido
 *  em "Andamento das etapas" é recalculado automaticamente: sem itens marcados = pendente,
 *  alguns = em andamento, todos = concluída. */
export function StageChecklist({ propertyId, stages }: { propertyId: string; stages: Stage[] }) {
  const [openId, setOpenId] = useState<string | null>(() => stages.find((s) => s.status !== 'concluida')?.id ?? null)

  return (
    <div className="flex flex-col gap-2">
      {stages.map((stage) => {
        const Icon = getStageIcon(stage.name)
        const doneCount = stage.checklist.filter((i) => i.done).length
        const total = stage.checklist.length
        const meta = STAGE_STATUS_META[stage.status]
        return (
          <AccordionItem
            key={stage.id}
            icon={<Icon className="h-4 w-4" />}
            title={stage.name}
            subtitle={total > 0 ? `${doneCount}/${total} atividades · ${meta.label}` : meta.label}
            open={openId === stage.id}
            onToggle={() => setOpenId((current) => (current === stage.id ? null : stage.id))}
          >
            <StageChecklistItems propertyId={propertyId} stage={stage} />
          </AccordionItem>
        )
      })}
    </div>
  )
}
