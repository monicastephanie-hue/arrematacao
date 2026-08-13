import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Mail, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Cotista } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CotistaFormModal } from '@/components/cotista-form-modal'
import { investedByCotista, propertiesForCotista, valuePerCoOwner } from '@/lib/calculations'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function Cotistas() {
  const cotistas = useStore((s) => s.cotistas)
  const properties = useStore((s) => s.properties)
  const addCotista = useStore((s) => s.addCotista)
  const updateCotista = useStore((s) => s.updateCotista)
  const deleteCotista = useStore((s) => s.deleteCotista)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cotista | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<Cotista | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(cotista: Cotista) {
    setEditing(cotista)
    setModalOpen(true)
  }

  function handleSave(value: Omit<Cotista, 'id' | 'createdAt'>) {
    if (editing) {
      updateCotista(editing.id, value)
    } else {
      addCotista(value)
    }
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Cotistas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cotistas.length} {cotistas.length === 1 ? 'pessoa' : 'pessoas'} participando das compras
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Novo cotista
        </Button>
      </div>

      {cotistas.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nenhum cotista cadastrado</h2>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Cadastre as pessoas que participam das compras — você também pode adicionar um cotista direto pelo
            formulário do imóvel.
          </p>
          <Button className="mt-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Novo cotista
          </Button>
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
          {cotistas.map((cotista) => {
            const linkedProperties = propertiesForCotista(properties, cotista.id)
            const invested = investedByCotista(properties, cotista.id)
            const expanded = expandedId === cotista.id

            return (
              <div key={cotista.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : cotista.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {cotista.name
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{cotista.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                      {cotista.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {cotista.phone}
                        </span>
                      )}
                      {cotista.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {cotista.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                      {formatCurrency(invested)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {linkedProperties.length} {linkedProperties.length === 1 ? 'imóvel' : 'imóveis'}
                    </p>
                  </div>

                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', expanded && 'rotate-180')} />

                  <div className="flex shrink-0 gap-1">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(cotista)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && openEdit(cotista)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                      aria-label="Editar cotista"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingDelete(cotista)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && setPendingDelete(cotista)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                      aria-label="Remover cotista"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="bg-slate-50 px-4 py-3 dark:bg-slate-950/40">
                    {linkedProperties.length === 0 ? (
                      <p className="text-xs text-slate-400">Ainda não participa de nenhum imóvel.</p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {linkedProperties.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                            <Link to={`/imoveis/${p.id}`} className="truncate text-slate-700 hover:underline dark:text-slate-300">
                              {p.title}
                            </Link>
                            <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
                              {formatCurrency(valuePerCoOwner(p))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </Card>
      )}

      <CotistaFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover cotista"
        description={`Tem certeza que deseja remover "${pendingDelete?.name}"? Os imóveis não serão excluídos, apenas o vínculo com esse cotista.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteCotista(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
