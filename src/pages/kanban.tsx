import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { KanbanSquare, Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { KanbanCard } from '@/components/kanban-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { collectStageColumns, currentStage } from '@/lib/calculations'
import { cn } from '@/lib/cn'

export default function Kanban() {
  const properties = useStore((s) => s.properties)
  const setPropertyCurrentStage = useStore((s) => s.setPropertyCurrentStage)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const activeProperties = useMemo(() => properties.filter((p) => p.status === 'em_andamento'), [properties])
  const columns = useMemo(() => collectStageColumns(activeProperties), [activeProperties])

  const byColumn = useMemo(() => {
    const map = new Map<string, typeof activeProperties>()
    for (const name of columns) map.set(name, [])
    for (const property of activeProperties) {
      const stage = currentStage(property)
      if (stage && map.has(stage.name)) map.get(stage.name)!.push(property)
    }
    return map
  }, [columns, activeProperties])

  function handleDrop(columnName: string) {
    if (draggingId) setPropertyCurrentStage(draggingId, columnName)
    setDraggingId(null)
    setDragOverColumn(null)
  }

  if (properties.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <KanbanSquare className="h-6 w-6 text-slate-400" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nenhum imóvel cadastrado</h1>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Cadastre um imóvel para acompanhar seu andamento aqui, arrastando entre as etapas.
        </p>
        <Link to="/imoveis/novo">
          <Button className="mt-2">
            <Plus className="h-4 w-4" />
            Novo imóvel
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Gerenciamento</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Arraste os cards para mover um imóvel entre as etapas · imóveis vendidos, perdidos ou com desistência não aparecem aqui
          </p>
        </div>
        <Link to="/imoveis/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo imóvel
          </Button>
        </Link>
      </div>

      {activeProperties.length === 0 ? (
        <Card className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          Nenhum imóvel em andamento no momento.
        </Card>
      ) : (
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
          {columns.map((name) => {
            const items = byColumn.get(name) ?? []
            const isOver = dragOverColumn === name
            return (
              <div
                key={name}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverColumn(name)
                }}
                onDragLeave={() => setDragOverColumn((prev) => (prev === name ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(name)
                }}
                className={cn(
                  'flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-transparent p-2 transition-colors',
                  isOver && 'border-orange-300 bg-orange-50/60 dark:border-orange-500/40 dark:bg-orange-500/5',
                )}
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300">{name}</h2>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {items.length}
                  </span>
                </div>

                <div className="flex min-h-16 flex-col gap-2.5">
                  {items.map((property) => (
                    <KanbanCard
                      key={property.id}
                      property={property}
                      dragging={draggingId === property.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', property.id)
                        e.dataTransfer.effectAllowed = 'move'
                        setDraggingId(property.id)
                      }}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDragOverColumn(null)
                      }}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-300 dark:border-slate-800 dark:text-slate-600">
                      Solte aqui
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
