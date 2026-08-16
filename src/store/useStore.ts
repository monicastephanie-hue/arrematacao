import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Attachment, ChecklistItem, Cotista, KanbanStatus, Property, Simulation, Stage, StageStatus, ValueEntry } from '@/types'
import { DEFAULT_STAGE_CHECKLISTS, DEFAULT_STAGE_NAMES } from '@/types'
import { DEFAULT_NOTIFICATION_TEMPLATE } from '@/lib/notification-template'

function makeId(): string {
  return (crypto as { randomUUID?: () => string }).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function nowISO(): string {
  return new Date().toISOString()
}

export function createDefaultStages(): Stage[] {
  return DEFAULT_STAGE_NAMES.map((name) => ({
    id: makeId(),
    name,
    status: 'pendente' as StageStatus,
    date: null,
    notes: '',
    checklist: (DEFAULT_STAGE_CHECKLISTS[name] ?? []).map((text) => ({ id: makeId(), text, done: false })),
  }))
}

/** Deriva o status da etapa a partir do checklist: sem itens = não deriva (mantém manual),
 *  nenhum marcado = pendente, alguns = em andamento, todos = concluída. */
function deriveStatusFromChecklist(checklist: ChecklistItem[]): StageStatus | null {
  if (checklist.length === 0) return null
  const doneCount = checklist.filter((i) => i.done).length
  if (doneCount === 0) return 'pendente'
  if (doneCount === checklist.length) return 'concluida'
  return 'em_andamento'
}

function applyChecklist(stage: Stage, checklist: ChecklistItem[]): Stage {
  const derived = deriveStatusFromChecklist(checklist)
  const status = derived ?? stage.status
  const date = status === 'concluida' && !stage.date ? new Date().toISOString().slice(0, 10) : stage.date
  return { ...stage, checklist, status, date }
}

export type NewPropertyInput = Omit<
  Property,
  'id' | 'createdAt' | 'updatedAt' | 'stages' | 'values' | 'attachments' | 'kanbanStatus'
>

export type NewCotistaInput = Omit<Cotista, 'id' | 'createdAt'>

export type NewSimulationInput = Omit<Simulation, 'id' | 'createdAt'>

interface StoreState {
  properties: Property[]
  addProperty: (input: NewPropertyInput) => string
  updateProperty: (id: string, patch: Partial<NewPropertyInput>) => void
  deleteProperty: (id: string) => void

  addStage: (propertyId: string, name: string) => void
  updateStage: (propertyId: string, stageId: string, patch: Partial<Omit<Stage, 'id'>>) => void
  deleteStage: (propertyId: string, stageId: string) => void
  reorderStages: (propertyId: string, orderedIds: string[]) => void

  /** Checklist de atividades de uma etapa — ao marcar/desmarcar, o status da etapa
   *  (Andamento das etapas) é recalculado automaticamente a partir do checklist. */
  addChecklistItem: (propertyId: string, stageId: string, text: string) => void
  toggleChecklistItem: (propertyId: string, stageId: string, itemId: string) => void
  deleteChecklistItem: (propertyId: string, stageId: string, itemId: string) => void
  /** Move um imóvel para outra coluna do quadro de Gerenciamento (Kanban) — controle
   *  independente das etapas, usado só para o drag-and-drop. */
  setPropertyKanbanStatus: (propertyId: string, kanbanStatus: KanbanStatus) => void

  addValueEntry: (propertyId: string, entry: Omit<ValueEntry, 'id'>) => void
  updateValueEntry: (propertyId: string, entryId: string, patch: Partial<Omit<ValueEntry, 'id'>>) => void
  deleteValueEntry: (propertyId: string, entryId: string) => void

  addAttachment: (propertyId: string, attachment: Omit<Attachment, 'id'>) => void
  deleteAttachment: (propertyId: string, attachmentId: string) => void

  cotistas: Cotista[]
  addCotista: (input: NewCotistaInput) => string
  updateCotista: (id: string, patch: Partial<NewCotistaInput>) => void
  deleteCotista: (id: string) => void

  simulations: Simulation[]
  addSimulation: (input: NewSimulationInput) => void
  deleteSimulation: (id: string) => void

  notificationTemplate: string
  setNotificationTemplate: (template: string) => void

  /** Brasão/logo do cabeçalho da notificação. null = usa a imagem padrão do app. */
  notificationLetterhead: string | null
  setNotificationLetterhead: (dataUrl: string | null) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      properties: [],

      addProperty: (input) => {
        const id = makeId()
        const property: Property = {
          ...input,
          id,
          createdAt: nowISO(),
          updatedAt: nowISO(),
          stages: createDefaultStages(),
          values: [],
          attachments: [],
          kanbanStatus: 'arrematado',
        }
        set((state) => ({ properties: [property, ...state.properties] }))
        return id
      },

      updateProperty: (id, patch) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: nowISO() } : p,
          ),
        }))
      },

      deleteProperty: (id) => {
        set((state) => ({ properties: state.properties.filter((p) => p.id !== id) }))
      },

      addStage: (propertyId, name) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  updatedAt: nowISO(),
                  stages: [...p.stages, { id: makeId(), name, status: 'pendente', date: null, notes: '', checklist: [] }],
                }
              : p,
          ),
        }))
      },

      addChecklistItem: (propertyId, stageId, text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id !== propertyId
              ? p
              : {
                  ...p,
                  updatedAt: nowISO(),
                  stages: p.stages.map((s) =>
                    s.id !== stageId ? s : applyChecklist(s, [...s.checklist, { id: makeId(), text: trimmed, done: false }]),
                  ),
                }
          ),
        }))
      },

      toggleChecklistItem: (propertyId, stageId, itemId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id !== propertyId
              ? p
              : {
                  ...p,
                  updatedAt: nowISO(),
                  stages: p.stages.map((s) =>
                    s.id !== stageId
                      ? s
                      : applyChecklist(s, s.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i))),
                  ),
                }
          ),
        }))
      },

      deleteChecklistItem: (propertyId, stageId, itemId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id !== propertyId
              ? p
              : {
                  ...p,
                  updatedAt: nowISO(),
                  stages: p.stages.map((s) =>
                    s.id !== stageId ? s : applyChecklist(s, s.checklist.filter((i) => i.id !== itemId)),
                  ),
                }
          ),
        }))
      },

      updateStage: (propertyId, stageId, patch) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  updatedAt: nowISO(),
                  stages: p.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s)),
                }
              : p,
          ),
        }))
      },

      deleteStage: (propertyId, stageId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? { ...p, updatedAt: nowISO(), stages: p.stages.filter((s) => s.id !== stageId) }
              : p,
          ),
        }))
      },

      reorderStages: (propertyId, orderedIds) => {
        set((state) => ({
          properties: state.properties.map((p) => {
            if (p.id !== propertyId) return p
            const byId = new Map(p.stages.map((s) => [s.id, s]))
            const stages = orderedIds.map((id) => byId.get(id)).filter((s): s is Stage => Boolean(s))
            return { ...p, updatedAt: nowISO(), stages }
          }),
        }))
      },

      setPropertyKanbanStatus: (propertyId, kanbanStatus) => {
        set((state) => ({
          properties: state.properties.map((p) => (p.id === propertyId ? { ...p, kanbanStatus, updatedAt: nowISO() } : p)),
        }))
      },

      addValueEntry: (propertyId, entry) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? { ...p, updatedAt: nowISO(), values: [...p.values, { ...entry, id: makeId() }] }
              : p,
          ),
        }))
      },

      updateValueEntry: (propertyId, entryId, patch) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  updatedAt: nowISO(),
                  values: p.values.map((v) => (v.id === entryId ? { ...v, ...patch } : v)),
                }
              : p,
          ),
        }))
      },

      deleteValueEntry: (propertyId, entryId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? { ...p, updatedAt: nowISO(), values: p.values.filter((v) => v.id !== entryId) }
              : p,
          ),
        }))
      },

      addAttachment: (propertyId, attachment) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? { ...p, updatedAt: nowISO(), attachments: [...p.attachments, { ...attachment, id: makeId() }] }
              : p,
          ),
        }))
      },

      deleteAttachment: (propertyId, attachmentId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? { ...p, updatedAt: nowISO(), attachments: p.attachments.filter((a) => a.id !== attachmentId) }
              : p,
          ),
        }))
      },

      cotistas: [],

      addCotista: (input) => {
        const id = makeId()
        set((state) => ({ cotistas: [...state.cotistas, { ...input, id, createdAt: nowISO() }] }))
        return id
      },

      updateCotista: (id, patch) => {
        set((state) => ({
          cotistas: state.cotistas.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }))
      },

      deleteCotista: (id) => {
        set((state) => ({
          cotistas: state.cotistas.filter((c) => c.id !== id),
          // Remove o vínculo desse cotista de qualquer imóvel, sem apagar os imóveis.
          properties: state.properties.map((p) =>
            p.cotistaIds.includes(id) ? { ...p, cotistaIds: p.cotistaIds.filter((cid) => cid !== id) } : p,
          ),
        }))
      },

      simulations: [],

      addSimulation: (input) => {
        set((state) => ({
          simulations: [{ ...input, id: makeId(), createdAt: nowISO() }, ...state.simulations],
        }))
      },

      deleteSimulation: (id) => {
        set((state) => ({ simulations: state.simulations.filter((s) => s.id !== id) }))
      },

      notificationTemplate: DEFAULT_NOTIFICATION_TEMPLATE,

      setNotificationTemplate: (template) => {
        set({ notificationTemplate: template })
      },

      notificationLetterhead: null,

      setNotificationLetterhead: (dataUrl) => {
        set({ notificationLetterhead: dataUrl })
      },
    }),
    {
      name: 'arrematacao-store',
      version: 8,
      migrate: (persisted, version) => {
        const state = persisted as {
          properties?: Array<Record<string, unknown>>
          cotistas?: Array<Record<string, unknown>>
          simulations?: Simulation[]
          notificationTemplate?: string
          notificationLetterhead?: string | null
        }
        // O modelo de notificação foi reescrito na versão 5. Quem já tinha o modelo
        // padrão antigo salvo (não uma personalização de verdade, já que o recurso é
        // novo) recebe o texto atualizado automaticamente nesta migração.
        const forceTemplateReset = version < 5
        return {
          properties: (state.properties ?? []).map((p) => ({
            ...p,
            cotistaIds: Array.isArray(p.cotistaIds) ? p.cotistaIds : [],
            attachments: Array.isArray(p.attachments) ? p.attachments : [],
            kanbanStatus: typeof p.kanbanStatus === 'string' ? p.kanbanStatus : 'arrematado',
            proposalAttachment: p.proposalAttachment ?? null,
            billAttachment: p.billAttachment ?? null,
            // Valor de arrematação, introduzido na versão 8.
            auctionValue: typeof p.auctionValue === 'number' ? p.auctionValue : null,
            // Checklist de atividades por etapa, introduzido na versão 7. Etapas padrão que
            // ainda não tinham checklist ganham as atividades sugeridas; etapas
            // personalizadas ganham um checklist vazio (editável pelo usuário). Etapas que
            // já estavam marcadas como concluídas ganham o checklist já todo marcado, para
            // não "desconcluir" nada que a pessoa já tinha dado como feito.
            stages: Array.isArray(p.stages)
              ? (p.stages as Array<Record<string, unknown>>).map((s) => {
                  const alreadyDone = s.status === 'concluida'
                  return {
                    ...s,
                    checklist: Array.isArray(s.checklist)
                      ? s.checklist
                      : (DEFAULT_STAGE_CHECKLISTS[s.name as string] ?? []).map((text) => ({
                          id: makeId(),
                          text,
                          done: alreadyDone,
                        })),
                  }
                })
              : [],
          })),
          cotistas: (state.cotistas ?? []).map((c) => ({
            ...c,
            qualification: typeof c.qualification === 'string' ? c.qualification : '',
          })),
          simulations: state.simulations ?? [],
          notificationTemplate:
            !forceTemplateReset && typeof state.notificationTemplate === 'string'
              ? state.notificationTemplate
              : DEFAULT_NOTIFICATION_TEMPLATE,
          notificationLetterhead:
            typeof state.notificationLetterhead === 'string' ? state.notificationLetterhead : null,
        }
      },
    },
  ),
)
