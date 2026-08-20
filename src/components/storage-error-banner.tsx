import { AlertTriangle, X } from 'lucide-react'
import { useStorageStatus } from '@/store/useStorageStatus'

/** Avisa quando a última alteração não conseguiu ser salva no navegador (geralmente por
 *  falta de espaço no localStorage) — sem isso, a falha acontece em silêncio e a pessoa
 *  tem a impressão de que a ação simplesmente não funcionou. */
export function StorageErrorBanner() {
  const storageError = useStorageStatus((s) => s.storageError)
  const dismissStorageError = useStorageStatus((s) => s.dismissStorageError)

  if (!storageError) return null

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{storageError}</p>
      <button
        onClick={dismissStorageError}
        className="shrink-0 rounded-lg p-1 text-rose-500 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/15"
        aria-label="Fechar aviso"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
