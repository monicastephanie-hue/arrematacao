import { useState } from 'react'
import { ClipboardPaste, Pencil, Plus, Trash2 } from 'lucide-react'
import type { ValueEntry } from '@/types'
import { VALUE_TYPE_META } from '@/types'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ValueEntryModal } from '@/components/value-entry-modal'
import { BulkValueImportModal } from '@/components/bulk-value-import-modal'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

export function ValuesEditor({ propertyId, values }: { propertyId: string; values: ValueEntry[] }) {
  const addValueEntry = useStore((s) => s.addValueEntry)
  const updateValueEntry = useStore((s) => s.updateValueEntry)
  const deleteValueEntry = useStore((s) => s.deleteValueEntry)

  const [modalOpen, setModalOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editing, setEditing] = useState<ValueEntry | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<ValueEntry | null>(null)

  const sorted = [...values].sort((a, b) => b.date.localeCompare(a.date))

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(entry: ValueEntry) {
    setEditing(entry)
    setModalOpen(true)
  }

  function handleSave(entry: Omit<ValueEntry, 'id'>) {
    if (editing) {
      updateValueEntry(propertyId, editing.id, entry)
    } else {
      addValueEntry(propertyId, entry)
    }
    setModalOpen(false)
  }

  function handleBulkImport(entries: Omit<ValueEntry, 'id'>[]) {
    for (const entry of entries) addValueEntry(propertyId, entry)
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum valor lançado ainda.</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Adicionar valor
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setBulkOpen(true)}>
            <ClipboardPaste className="h-4 w-4" />
            Colar mensagens
          </Button>
        </div>
        <ValueEntryModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
        <BulkValueImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} onImport={handleBulkImport} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary" onClick={() => setBulkOpen(true)}>
          <ClipboardPaste className="h-4 w-4" />
          Colar mensagens
        </Button>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Adicionar valor
        </Button>
      </div>

      <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
        {sorted.map((entry) => {
          const meta = VALUE_TYPE_META[entry.type]
          return (
            <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-24 shrink-0 text-xs text-slate-400">{formatDate(entry.date)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{meta.label}</p>
                {entry.description && (
                  <p className="truncate text-xs text-slate-400" title={entry.description}>
                    {entry.description}
                  </p>
                )}
              </div>
              <div
                className={cn(
                  'w-32 shrink-0 text-right text-sm font-semibold tabular-nums',
                  meta.kind === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300',
                )}
              >
                {meta.kind === 'receita' ? '+' : '-'}
                {formatCurrency(entry.amount)}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => openEdit(entry)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  aria-label="Editar valor"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setPendingDelete(entry)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  aria-label="Remover valor"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </Card>

      <ValueEntryModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
      <BulkValueImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} onImport={handleBulkImport} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover valor"
        description="Tem certeza que deseja remover esse lançamento? Essa ação não pode ser desfeita."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteValueEntry(propertyId, pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
