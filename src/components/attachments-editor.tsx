import { useRef, useState } from 'react'
import { AlertTriangle, Download, FileText, Loader2, Trash2, Upload } from 'lucide-react'
import type { Attachment, Stage } from '@/types'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/field'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { getStageIcon } from '@/lib/stage-icons'
import { MAX_ATTACHMENT_SIZE, dataUrlByteSize, formatFileSize, readFileAsDataUrl } from '@/lib/file'
import { readImageAsCompressedDataUrl } from '@/lib/image'
import { formatDate } from '@/lib/format'

function isImageAttachment(attachment: Attachment): boolean {
  return attachment.mimeType.startsWith('image/')
}

function AttachmentRow({
  attachment,
  stages,
  onClassify,
  onDelete,
  onPreview,
}: {
  attachment: Attachment
  stages: Stage[]
  onClassify: (stageId: string | 'geral') => void
  onDelete: () => void
  onPreview: () => void
}) {
  const isImage = isImageAttachment(attachment)
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isImage ? (
          <button
            type="button"
            onClick={onPreview}
            className="shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200 dark:ring-slate-700"
            aria-label={`Ver ${attachment.name} em tamanho maior`}
          >
            <img src={attachment.dataUrl} alt={attachment.name} className="h-9 w-9 object-cover" />
          </button>
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <FileText className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200" title={attachment.name}>
            {attachment.name}
          </p>
          <p className="text-xs text-slate-400">
            {formatFileSize(attachment.size)} · {formatDate(attachment.uploadedAt.slice(0, 10))}
          </p>
        </div>
      </div>
      <Select
        className="sm:w-56"
        value={attachment.stageId ?? ''}
        onChange={(e) => e.target.value && onClassify(e.target.value as string | 'geral')}
      >
        <option value="" disabled>
          A qual etapa se refere?
        </option>
        <option value="geral">Documento geral (sem etapa específica)</option>
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        <a
          href={attachment.dataUrl}
          download={attachment.fileName}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label={`Baixar ${attachment.name}`}
        >
          <Download className="h-3.5 w-3.5" />
        </a>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          aria-label={`Remover ${attachment.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/** Anexos do imóvel. Cada documento novo entra em "Pendência de classificação" até ser
 *  associado a uma etapa (ou marcado como documento geral) — só então aparece nos Anexos. */
export function AttachmentsEditor({
  propertyId,
  attachments,
  stages,
}: {
  propertyId: string
  attachments: Attachment[]
  stages: Stage[]
}) {
  const addAttachment = useStore((s) => s.addAttachment)
  const deleteAttachment = useStore((s) => s.deleteAttachment)
  const classifyAttachment = useStore((s) => s.classifyAttachment)
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Attachment | null>(null)
  const [preview, setPreview] = useState<Attachment | null>(null)

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
        // Imagens são recomprimidas antes de salvar — reduz bastante o espaço ocupado no
        // navegador, o que importa porque hoje os anexos ficam só no localStorage.
        const isImage = file.type.startsWith('image/')
        const dataUrl = isImage ? await readImageAsCompressedDataUrl(file) : await readFileAsDataUrl(file)
        addAttachment(propertyId, {
          name: file.name,
          fileName: file.name,
          mimeType: isImage ? 'image/jpeg' : file.type || 'application/octet-stream',
          size: isImage ? dataUrlByteSize(dataUrl) : file.size,
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

  const pending = attachments.filter((a) => a.stageId === null)
  const geral = attachments.filter((a) => a.stageId === 'geral')
  const byStage = stages
    .map((stage) => ({ stage, items: attachments.filter((a) => a.stageId === stage.id) }))
    .filter((g) => g.items.length > 0)
  const classifiedCount = geral.length + byStage.reduce((sum, g) => sum + g.items.length, 0)

  return (
    <div className="flex flex-col gap-5">
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      <div className="flex justify-end">
        <Button size="sm" onClick={() => inputRef.current?.click()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Anexar documento
        </Button>
      </div>

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/5">
          <div className="flex items-center gap-2 border-b border-amber-200 px-4 py-2.5 dark:border-amber-500/25">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pendência de classificação</h3>
            <span className="ml-auto shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">{pending.length}</span>
          </div>
          <div className="divide-y divide-amber-100 dark:divide-amber-500/15">
            {pending.map((att) => (
              <AttachmentRow
                key={att.id}
                attachment={att}
                stages={stages}
                onClassify={(stageId) => classifyAttachment(propertyId, att.id, stageId)}
                onDelete={() => setPendingDelete(att)}
                onPreview={() => setPreview(att)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        {classifiedCount === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {pending.length > 0 ? 'Classifique os documentos pendentes acima para vê-los aqui.' : 'Nenhum documento anexado ainda.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {geral.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-400">Documentos gerais</p>
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {geral.map((att) => (
                    <AttachmentRow
                      key={att.id}
                      attachment={att}
                      stages={stages}
                      onClassify={(stageId) => classifyAttachment(propertyId, att.id, stageId)}
                      onDelete={() => setPendingDelete(att)}
                      onPreview={() => setPreview(att)}
                    />
                  ))}
                </div>
              </div>
            )}
            {byStage.map(({ stage, items }) => {
              const Icon = getStageIcon(stage.name)
              return (
                <div key={stage.id}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Icon className="h-3.5 w-3.5" />
                    {stage.name}
                  </p>
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {items.map((att) => (
                      <AttachmentRow
                        key={att.id}
                        attachment={att}
                        stages={stages}
                        onClassify={(stageId) => classifyAttachment(propertyId, att.id, stageId)}
                        onDelete={() => setPendingDelete(att)}
                        onPreview={() => setPreview(att)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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

      {preview && (
        <ImageLightbox
          src={preview.dataUrl}
          alt={preview.name}
          downloadName={preview.fileName}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
