import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Attachment, Cotista, KanbanStatus, Property, Simulation, Stage, StageStatus, ValueEntry } from '@/types'
import { DEFAULT_STAGE_NAMES } from '@/types'
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
  }))
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
                  stages: [...p.stages, { id: makeId(), name, status: 'pendente', date: null, notes: '' }],
                }
              : p,
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
      version: 4,
      migrate: (persisted) => {
        const state = persisted as {
          properties?: Array<Record<string, unknown>>
          cotistas?: Array<Record<string, unknown>>
          simulations?: Simulation[]
          notificationTemplate?: string
          notificationLetterhead?: string | null
        }
        return {
          properties: (state.properties ?? []).map((p) => ({
            ...p,
            cotistaIds: Array.isArray(p.cotistaIds) ? p.cotistaIds : [],
            attachments: Array.isArray(p.attachments) ? p.attachments : [],
            kanbanStatus: typeof p.kanbanStatus === 'string' ? p.kanbanStatus : 'arrematado',
          })),
          cotistas: (state.cotistas ?? []).map((c) => ({
            ...c,
            qualification: typeof c.qualification === 'string' ? c.qualification : '',
          })),
          simulations: state.simulations ?? [],
          notificationTemplate:
            typeof state.notificationTemplate === 'string' ? state.notificationTemplate : DEFAULT_NOTIFICATION_TEMPLATE,
          notificationLetterhead:
            typeof state.notificationLetterhead === 'string' ? state.notificationLetterhead : null,
        }
      },
    },
  ),
)
