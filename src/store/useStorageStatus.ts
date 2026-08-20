import { create } from 'zustand'

/** Store separada (sem persist) só para avisar quando a última escrita no localStorage
 *  falhou. Precisa ficar fora do useStore principal: se ela vivesse lá, cada notificação
 *  dispararia uma nova gravação no localStorage, que dispararia uma nova notificação,
 *  num loop infinito. */
interface StorageStatusState {
  storageError: string | null
  setStorageError: (message: string | null) => void
  dismissStorageError: () => void
}

export const useStorageStatus = create<StorageStatusState>((set, get) => ({
  storageError: null,
  setStorageError: (message) => {
    if (get().storageError !== message) set({ storageError: message })
  },
  dismissStorageError: () => set({ storageError: null }),
}))
