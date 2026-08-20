import { useState } from 'react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import type { Property } from '@/types'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'

function buildInstruction(property: Property): string {
  const groupName = property.whatsappGroup.trim() || property.title
  const since = property.lastCollectionAt ? `desde ${formatDateTime(property.lastCollectionAt)}` : 'desde o início'
  return `Vá até o grupo do WhatsApp "${groupName}" e me traga os anexos e as mensagens de despesa ${since}.`
}

/** Ponte manual com o WhatsApp: guarda a data/hora da última coleta e monta uma instrução
 *  pronta para colar numa conversa com o Claude Desktop (ou a extensão), já com o grupo e
 *  o "desde quando" preenchidos — evita ter que lembrar o que já foi trazido da última vez. */
export function WhatsAppCollectionCard({ property }: { property: Property }) {
  const markCollected = useStore((s) => s.markCollected)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildInstruction(property))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard indisponível neste navegador — o texto já fica visível na tela para copiar manualmente.
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Coleta do WhatsApp</h2>
      <p className="mb-3 text-xs text-slate-400">
        Última coleta:{' '}
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {property.lastCollectionAt ? formatDateTime(property.lastCollectionAt) : 'ainda não coletado'}
        </span>
      </p>
      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
        {buildInstruction(property)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado!' : 'Copiar instrução para o Claude'}
        </Button>
        <Button type="button" size="sm" onClick={() => markCollected(property.id)}>
          <RefreshCw className="h-3.5 w-3.5" />
          Marcar como coletado agora
        </Button>
      </div>
    </Card>
  )
}
