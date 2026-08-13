import { useMemo, useState } from 'react'
import { AlertTriangle, Check, Copy, Printer, RotateCcw, ScrollText } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field'
import { DEFAULT_NOTIFICATION_TEMPLATE, mergeTemplate } from '@/lib/notification-template'
import { formatDateLong, todayISO } from '@/lib/format'

export default function Notification() {
  const properties = useStore((s) => s.properties)
  const cotistas = useStore((s) => s.cotistas)
  const template = useStore((s) => s.notificationTemplate)
  const setTemplate = useStore((s) => s.setNotificationTemplate)

  const [propertyId, setPropertyId] = useState('')
  const [notificante, setNotificante] = useState('')
  const [notificado, setNotificado] = useState('')
  const [notificadoQualificacao, setNotificadoQualificacao] = useState('')
  const [enderecoImovel, setEnderecoImovel] = useState('')
  const [leiloeiroInfo, setLeiloeiroInfo] = useState('')
  const [prazoDias, setPrazoDias] = useState(15)
  const [cidade, setCidade] = useState('')
  const [data, setData] = useState(todayISO())
  const [motivo, setMotivo] = useState('')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleSelectProperty(id: string) {
    setPropertyId(id)
    const property = properties.find((p) => p.id === id)
    if (!property) return
    setEnderecoImovel(property.address || '')
    const parts = [property.auctionHouse, property.processNumber ? `processo nº ${property.processNumber}` : ''].filter(Boolean)
    setLeiloeiroInfo(parts.join(', '))
  }

  function handleSelectCotista(id: string) {
    const cotista = cotistas.find((c) => c.id === id)
    if (!cotista) return
    setNotificante(cotista.qualification ? `${cotista.name}, ${cotista.qualification}` : cotista.name)
  }

  const merged = useMemo(
    () =>
      mergeTemplate(template, {
        notificante: notificante || '[nome do notificante]',
        notificado: notificado || '[nome do notificado]',
        notificado_qualificacao: notificadoQualificacao,
        imovel_endereco: enderecoImovel || '[endereço do imóvel]',
        leiloeiro_info: leiloeiroInfo || '[dados do leilão]',
        prazo_dias: String(prazoDias || 15),
        cidade: cidade || '[cidade]',
        data_extenso: formatDateLong(data),
        motivo,
      }),
    [template, notificante, notificado, notificadoQualificacao, enderecoImovel, leiloeiroInfo, prazoDias, cidade, data, motivo],
  )

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(merged)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="print:hidden">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
          <ScrollText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Notificação Extrajudicial
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monte um modelo de notificação para desocupação e outras comunicações formais</p>
      </div>

      <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 print:hidden dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5" />
        <p>
          Este é um <strong>modelo de referência</strong>, não constitui aconselhamento jurídico. Revise o texto com um advogado
          antes de enviar — os requisitos formais variam conforme o tipo de leilão, o estado e a situação do imóvel.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 print:block">
        <Card className="flex flex-col gap-4 p-5 print:hidden">
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup className="col-span-2">
              <Label htmlFor="notif-property" hint="opcional">
                Imóvel
              </Label>
              <Select id="notif-property" value={propertyId} onChange={(e) => handleSelectProperty(e.target.value)}>
                <option value="">Selecione para preencher automaticamente</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup className="col-span-2">
              <Label htmlFor="notif-cotista" hint="opcional">
                Preencher notificante com um cotista
              </Label>
              <Select id="notif-cotista" defaultValue="" onChange={(e) => handleSelectCotista(e.target.value)}>
                <option value="">Selecione um cotista</option>
                {cotistas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="notif-notificante">Notificante</Label>
            <Textarea id="notif-notificante" value={notificante} onChange={(e) => setNotificante(e.target.value)} placeholder="Nome e qualificação de quem notifica" />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-notificado">Notificado(a)</Label>
              <Input id="notif-notificado" value={notificado} onChange={(e) => setNotificado(e.target.value)} placeholder="Nome de quem recebe a notificação" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-prazo" hint="dias">
                Prazo
              </Label>
              <Input id="notif-prazo" type="number" min={1} value={prazoDias} onChange={(e) => setPrazoDias(Number(e.target.value) || 0)} />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="notif-notificado-qualif" hint="opcional">
              Qualificação do notificado
            </Label>
            <Textarea
              id="notif-notificado-qualif"
              value={notificadoQualificacao}
              onChange={(e) => setNotificadoQualificacao(e.target.value)}
              placeholder="RG, CPF, endereço..."
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="notif-endereco">Endereço do imóvel</Label>
            <Input id="notif-endereco" value={enderecoImovel} onChange={(e) => setEnderecoImovel(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="notif-leiloeiro" hint="opcional">
              Dados do leilão
            </Label>
            <Input id="notif-leiloeiro" value={leiloeiroInfo} onChange={(e) => setLeiloeiroInfo(e.target.value)} placeholder="Ex.: Caixa, processo nº ..." />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-cidade">Cidade</Label>
              <Input id="notif-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-data">Data</Label>
              <Input id="notif-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="notif-motivo" hint="opcional">
              Observações adicionais
            </Label>
            <Textarea id="notif-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Texto extra a incluir no corpo da notificação" />
          </FieldGroup>

          <button
            type="button"
            onClick={() => setShowTemplateEditor((v) => !v)}
            className="self-start text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
          >
            {showTemplateEditor ? 'Ocultar' : 'Personalizar'} modelo
          </button>

          {showTemplateEditor && (
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Edite o texto-base. Use tags como <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{'{{notificante}}'}</code> para os campos acima.
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={() => setTemplate(DEFAULT_NOTIFICATION_TEMPLATE)}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restaurar
                </Button>
              </div>
              <Textarea value={template} onChange={(e) => setTemplate(e.target.value)} className="min-h-48 font-mono text-xs" />
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex justify-end gap-2 print:hidden">
            <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar texto'}
            </Button>
            <Button type="button" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              Imprimir / Salvar PDF
            </Button>
          </div>
          <Card className="p-8 font-serif text-sm leading-relaxed whitespace-pre-wrap text-slate-800 print:border-0 print:p-0 print:shadow-none dark:text-slate-200">
            {merged}
          </Card>
        </div>
      </div>
    </div>
  )
}
