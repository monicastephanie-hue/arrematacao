import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Property, Stage, StageStatus, ValueEntry } from '@/types'
import { DEFAULT_STAGE_NAMES } from '@/types'

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
  'id' | 'createdAt' | 'updatedAt' | 'stages' | 'values'
>

interface StoreState {
  properties: Property[]
  addProperty: (input: NewPropertyInput) => string
  updateProperty: (id: string, patch: Partial<NewPropertyInput>) => void
  deleteProperty: (id: string) => void

  addStage: (propertyId: string, name: string) => void
  updateStage: (propertyId: string, stageId: string, patch: Partial<Omit<Stage, 'id'>>) => void
  deleteStage: (propertyId: string, stageId: string) => void
  reorderStages: (propertyId: string, orderedIds: string[]) => void

  addValueEntry: (propertyId: string, entry: Omit<ValueEntry, 'id'>) => void
  updateValueEntry: (propertyId: string, entryId: string, patch: Partial<Omit<ValueEntry, 'id'>>) => void
  deleteValueEntry: (propertyId: string, entryId: string) => void
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
    }),
    { name: 'arrematacao-store' },
  ),
)
