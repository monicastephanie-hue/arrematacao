import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Stage, StageStatus } from '@/types'
import { STAGE_STATUS_META } from '@/types'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/field'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/cn'

export function StagesEditor({ propertyId, stages }: { propertyId: string; stages: Stage[] }) {
  const updateStage = useStore((s) => s.updateStage)
  const deleteStage = useStore((s) => s.deleteStage)
  const addStage = useStore((s) => s.addStage)

  const [newStageName, setNewStageName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Stage | null>(null)

  function handleAddStage(e: React.FormEvent) {
    e.preventDefault()
    const name = newStageName.trim()
    if (!name) return
    addStage(propertyId, name)
    setNewStageName('')
  }

  function handleStatusChange(stage: Stage, status: StageStatus) {
    updateStage(propertyId, stage.id, {
      status,
      date: status === 'concluida' && !stage.date ? new Date().toISOString().slice(0, 10) : stage.date,
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      {stages.map((stage) => {
        const meta = STAGE_STATUS_META[stage.status]
        return (
          <div
            key={stage.id}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center dark:border-slate-800"
          >
            <div className="flex items-center gap-2 sm:w-44 sm:shrink-0">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dot)} />
              <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200" title={stage.name}>
                {stage.name}
              </span>
            </div>
            {stage.checklist.length > 0 ? (
              <span
                className={cn('text-sm font-medium sm:w-40', meta.className)}
                title="Definido automaticamente pelo checklist de atividades desta etapa"
              >
                {meta.label} <span className="text-xs font-normal text-slate-400">(via checklist)</span>
              </span>
            ) : (
              <Select
                value={stage.status}
                onChange={(e) => handleStatusChange(stage, e.target.value as StageStatus)}
                className="sm:w-40"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </Select>
            )}
            <Input
              type="date"
              value={stage.date ?? ''}
              onChange={(e) => updateStage(propertyId, stage.id, { date: e.target.value || null })}
              className="sm:w-40"
            />
            <Input
              value={stage.notes}
              onChange={(e) => updateStage(propertyId, stage.id, { notes: e.target.value })}
              placeholder="Conclusão / observação desta etapa"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPendingDelete(stage)}
              className="self-end text-slate-400 hover:text-rose-600 sm:self-auto"
              aria-label={`Remover etapa ${stage.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}

      <form onSubmit={handleAddStage} className="flex gap-2 pt-1">
        <Input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="Nova etapa personalizada"
          className="flex-1"
        />
        <Button type="submit" variant="secondary" size="sm">
          <Plus className="h-4 w-4" />
          Adicionar etapa
        </Button>
      </form>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover etapa"
        description={`Tem certeza que deseja remover a etapa "${pendingDelete?.name}"? Essa ação não pode ser desfeita.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteStage(propertyId, pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
