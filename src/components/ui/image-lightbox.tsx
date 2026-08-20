import { useEffect } from 'react'
import { Download, X } from 'lucide-react'

/** Visualização em tela cheia de uma imagem — fecha ao clicar fora, no X ou com Esc. */
export function ImageLightbox({
  src,
  alt,
  downloadName,
  onClose,
}: {
  src: string
  alt: string
  downloadName?: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
      />
      <div className="absolute top-4 right-4 flex gap-2">
        {downloadName && (
          <a
            href={src}
            download={downloadName}
            onClick={(e) => e.stopPropagation()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Baixar imagem"
          >
            <Download className="h-4 w-4" />
          </a>
        )}
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
