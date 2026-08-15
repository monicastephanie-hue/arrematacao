import { useRef, useState } from 'react'
import { FileText, Loader2, Trash2, Upload } from 'lucide-react'
import type { Attachment } from '@/types'
import { Label } from '@/components/ui/field'
import { MAX_ATTACHMENT_SIZE, formatFileSize, readFileAsDataUrl } from '@/lib/file'
import { formatDate } from '@/lib/format'

export function SingleAttachmentUpload({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: Attachment | null
  onChange: (attachment: Attachment | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setError(`Arquivo de ${formatFileSize(file.size)} — o limite é ${formatFileSize(MAX_ATTACHMENT_SIZE)}.`)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      onChange({
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        name: file.name,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      })
    } catch {
      setError('Não foi possível anexar esse arquivo.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <Label hint={hint ?? 'opcional'}>{label}</Label>
      <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      {value ? (
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <FileText className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300" title={value.name}>
              {value.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(value.size)} · {formatDate(value.uploadedAt.slice(0, 10))}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-700"
            aria-label={`Remover ${label}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-xs font-medium text-slate-400 hover:border-slate-400 hover:text-slate-500 dark:border-slate-700 dark:hover:border-slate-600"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {loading ? 'Carregando…' : 'Enviar arquivo'}
        </button>
      )}

      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}
