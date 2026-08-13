import { useRef, useState } from 'react'
import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react'
import type { Attachment } from '@/types'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MAX_ATTACHMENT_SIZE, formatFileSize, readFileAsDataUrl } from '@/lib/file'
import { formatDate } from '@/lib/format'

export function AttachmentsEditor({ propertyId, attachments }: { propertyId: string; attachments: Attachment[] }) {
  const addAttachment = useStore((s) => s.addAttachment)
  const deleteAttachment = useStore((s) => s.deleteAttachment)
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Attachment | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setError(`"${file.name}" tem ${formatFileSize(file.size)} — o limite por arquivo é ${formatFileSize(MAX_ATTACHMENT_SIZE)}.`)
        continue
      }
      setLoading(true)
      try {
        const dataUrl = await readFileAsDataUrl(file)
        addAttachment(propertyId, {
          name: file.name,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        })
      } catch {
        setError(`Não foi possível anexar "${file.name}".`)
      } finally {
        setLoading(false)
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      {attachments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum documento anexado ainda.</p>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Anexar documento
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Anexar documento
            </Button>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200" title={att.name}>
                    {att.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(att.size)} · {formatDate(att.uploadedAt.slice(0, 10))}
                  </p>
                </div>
                <a
                  href={att.dataUrl}
                  download={att.fileName}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  aria-label={`Baixar ${att.name}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => setPendingDelete(att)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  aria-label={`Remover ${att.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remover anexo"
        description={`Tem certeza que deseja remover "${pendingDelete?.name}"?`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteAttachment(propertyId, pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
