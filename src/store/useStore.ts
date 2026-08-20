import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { Attachment, ChecklistItem, Cotista, KanbanStatus, Property, Simulation, Stage, StageStatus, ValueEntry } from '@/types'
import { DEFAULT_STAGE_CHECKLISTS, DEFAULT_STAGE_NAMES } from '@/types'
import { DEFAULT_NOTIFICATION_TEMPLATE } from '@/lib/notification-template'
import { useStorageStatus } from '@/store/useStorageStatus'

function makeId(): string {
  return (crypto as { randomUUID?: () => string }).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// O navegador tem um limite de espaço para localStorage (geralmente uns 5-10MB). Como o
// app ainda guarda tudo (inclusive imagens de anexos) só localmente, é possível estourar
// esse limite — e por padrão isso falha em silêncio, dando a impressão de que ações como
// excluir/salvar simplesmente "não funcionam". Este storage substituto captura esse erro
// e avisa a pessoa em vez de deixar a escrita sumir sem explicação. A notificação vai para
// uma store separada (useStorageStatus, sem persist) — se fosse para esta própria store,
// cada notificação disparava uma nova gravação, que disparava uma nova notificação, num
// loop infinito.
const resilientLocalStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
      useStorageStatus.getState().setStorageError(null)
    } catch (err) {
      console.error('Falha ao salvar no localStorage:', err)
      useStorageStatus
        .getState()
        .setStorageError(
          'Não foi possível salvar a última alteração — o armazenamento do navegador está cheio. Apague alguns anexos (principalmente imagens) para liberar espaço e tente de novo.',
        )
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
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

/** Novas etapas padrão introduzidas na versão 10 (Contrato de Habitação, Leilões
 *  Negativos, Troca de Titularidade e Condomínio — "Contrato" foi renomeado na versão
 *  11). Quem já tinha um imóvel cadastrado ganha essas etapas automaticamente, inseridas
 *  na posição do fluxo padrão. */
const NEW_DEFAULT_STAGE_NAMES_V10 = ['Contrato de Habitação', 'Leilões Negativos', 'Troca de Titularidade', 'Condomínio']

function insertMissingDefaultStages(stages: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const missing = NEW_DEFAULT_STAGE_NAMES_V10.filter((name) => !stages.some((s) => s.name === name))
  if (missing.length === 0) return stages

  const freshStage = (name: string): Record<string, unknown> => ({
    id: makeId(),
    name,
    status: 'pendente' as StageStatus,
    date: null,
    notes: '',
    checklist: (DEFAULT_STAGE_CHECKLISTS[name] ?? []).map((text) => ({ id: makeId(), text, done: false })),
  })

  const stageByName = new Map(stages.map((s) => [s.name as string, s]))
  const consumed = new Set<string>()
  const result: Array<Record<string, unknown>> = []
  for (const name of DEFAULT_STAGE_NAMES) {
    if (stageByName.has(name)) {
      result.push(stageByName.get(name)!)
      consumed.add(name)
    } else if (missing.includes(name)) {
      result.push(freshStage(name))
    }
  }
  // Etapas que a pessoa já tinha e não fazem parte do fluxo padrão (renomeadas ou
  // personalizadas) são preservadas ao final, na ordem original.
  for (const s of stages) {
    if (!consumed.has(s.name as string)) result.push(s)
  }
  return result
}

export type NewPropertyInput = Omit<
  Property,
  'id' | 'createdAt' | 'updatedAt' | 'stages' | 'values' | 'attachments' | 'kanbanStatus' | 'lastCollectionAt'
>

export type NewCotistaInput = Omit<Cotista, 'id' | 'createdAt'>

export type NewSimulationInput = Omit<Simulation, 'id' | 'createdAt'>

interface StoreState {
  properties: Property[]
  addProperty: (input: NewPropertyInput) => string
  updateProperty: (id: string, patch: Partial<NewPropertyInput>) => void
  deleteProperty: (id: string) => void
  /** Marca "agora" como a última vez que anexos/despesas do grupo do WhatsApp deste
   *  imóvel foram trazidos para o app. */
  markCollected: (propertyId: string) => void

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

  addAttachment: (propertyId: string, attachment: Omit<Attachment, 'id' | 'stageId'>) => void
  deleteAttachment: (propertyId: string, attachmentId: string) => void
  /** Classifica um anexo pendente: associa a uma etapa (stageId), a 'geral' (documento do
   *  imóvel sem etapa específica) ou de volta para null (pendência de classificação). */
  classifyAttachment: (propertyId: string, attachmentId: string, stageId: string | 'geral' | null) => void

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
          lastCollectionAt: null,
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

      markCollected: (propertyId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId ? { ...p, lastCollectionAt: nowISO(), updatedAt: nowISO() } : p,
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
              ? { ...p, updatedAt: nowISO(), attachments: [...p.attachments, { ...attachment, id: makeId(), stageId: null }] }
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

      classifyAttachment: (propertyId, attachmentId, stageId) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  updatedAt: nowISO(),
                  attachments: p.attachments.map((a) => (a.id === attachmentId ? { ...a, stageId } : a)),
                }
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
      version: 13,
      storage: createJSONStorage(() => resilientLocalStorage),
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
            // Classificação de anexos por etapa, introduzida na versão 12. Anexos que já
            // existiam antes da classificação existir são considerados documentos gerais
            // (não entram na Pendência de classificação).
            attachments: Array.isArray(p.attachments)
              ? (p.attachments as Array<Record<string, unknown>>).map((a) => ({
                  ...a,
                  stageId: a.stageId === undefined ? 'geral' : (a.stageId as string | 'geral' | null),
                }))
              : [],
            kanbanStatus: typeof p.kanbanStatus === 'string' ? p.kanbanStatus : 'arrematado',
            proposalAttachment: p.proposalAttachment ?? null,
            billAttachment: p.billAttachment ?? null,
            // Valor de arrematação, introduzido na versão 8.
            auctionValue: typeof p.auctionValue === 'number' ? p.auctionValue : null,
            // Grupo do WhatsApp e última coleta, introduzidos na versão 13.
            whatsappGroup: typeof p.whatsappGroup === 'string' ? p.whatsappGroup : '',
            lastCollectionAt: typeof p.lastCollectionAt === 'string' ? p.lastCollectionAt : null,
            // Checklist de atividades por etapa, introduzido na versão 7. Etapas padrão que
            // ainda não tinham checklist ganham as atividades sugeridas; etapas
            // personalizadas ganham um checklist vazio (editável pelo usuário). Etapas que
            // já estavam marcadas como concluídas ganham o checklist já todo marcado, para
            // não "desconcluir" nada que a pessoa já tinha dado como feito.
            // Na versão 9, a etapa "Pagamento do arremate" foi renomeada para "Arrematação"
            // e ganhou novas atividades — quem já tinha essa etapa recebe o novo nome e o
            // checklist atualizado. Na versão 10, quatro novas etapas padrão (Contrato,
            // Leilões Negativos, Troca de Titularidade e Condomínio) são inseridas em quem
            // ainda não as tinha. Na versão 11, "Contrato" vira "Contrato de Habitação" (com
            // "Atualização de matrícula" como primeira atividade) e a etapa "CHB / Escritura"
            // é removida, absorvida pela etapa de contrato.
            stages: insertMissingDefaultStages(
              Array.isArray(p.stages)
                ? (p.stages as Array<Record<string, unknown>>)
                    .filter((s) => s.name !== 'CHB / Escritura')
                    .map((s) => {
                      const renameMap: Record<string, string> = {
                        'Pagamento do arremate': 'Arrematação',
                        Contrato: 'Contrato de Habitação',
                      }
                      const renamed = Object.hasOwn(renameMap, s.name as string)
                      const name = renamed ? renameMap[s.name as string] : (s.name as string)
                      const alreadyDone = s.status === 'concluida'
                      const needsFreshChecklist = renamed || !Array.isArray(s.checklist)
                      return {
                        ...s,
                        name,
                        checklist: needsFreshChecklist
                          ? (DEFAULT_STAGE_CHECKLISTS[name] ?? []).map((text) => ({
                              id: makeId(),
                              text,
                              done: alreadyDone,
                            }))
                          : s.checklist,
                      }
                    })
                : [],
            ),
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
