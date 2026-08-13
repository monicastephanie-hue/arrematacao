import { useRef, useState } from 'react'
import { ImageOff, Loader2, Upload, X } from 'lucide-react'
import { readImageAsCompressedDataUrl } from '@/lib/image'
import { Label } from '@/components/ui/field'
import { cn } from '@/lib/cn'

export function PhotoUpload({
  value,
  onChange,
}: {
  value: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const dataUrl = await readImageAsCompressedDataUrl(file)
      onChange(dataUrl)
    } catch {
      setError('Não foi possível carregar essa imagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Label hint="opcional">Foto do imóvel</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
          <img src={value} alt="Foto do imóvel" className="aspect-video w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
            aria-label="Remover foto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 left-2 rounded-lg bg-slate-900/70 px-2 py-1 text-xs font-medium text-white hover:bg-slate-900"
          >
            Trocar foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={cn(
            'flex w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-8 text-slate-400 hover:border-slate-400 hover:text-slate-500 dark:border-slate-700 dark:hover:border-slate-600',
          )}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs font-medium">{loading ? 'Carregando…' : 'Enviar foto'}</span>
        </button>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
          <ImageOff className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}
