import { useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, Copy, Loader2, Printer, RotateCcw, ScrollText, Upload } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field'
import { DEFAULT_NOTIFICATION_TEMPLATE, mergeTemplate } from '@/lib/notification-template'
import { readImageAsCompressedDataUrl } from '@/lib/image'
import { formatCurrency, formatDateLong, todayISO } from '@/lib/format'
import defaultLetterhead from '@/assets/notification-letterhead.png'

export default function Notification() {
  const properties = useStore((s) => s.properties)
  const cotistas = useStore((s) => s.cotistas)
  const template = useStore((s) => s.notificationTemplate)
  const setTemplate = useStore((s) => s.setNotificationTemplate)
  const letterhead = useStore((s) => s.notificationLetterhead)
  const setLetterhead = useStore((s) => s.setNotificationLetterhead)

  const [propertyId, setPropertyId] = useState('')
  const [notificante, setNotificante] = useState('')
  const [notificado, setNotificado] = useState('')
  const [notificadoCpf, setNotificadoCpf] = useState('')
  const [notificadoQualificacao, setNotificadoQualificacao] = useState('')
  const [enderecoImovel, setEnderecoImovel] = useState('')
  const [imovelMatricula, setImovelMatricula] = useState('')
  const [comarca, setComarca] = useState('')
  const [leiloeiroInfo, setLeiloeiroInfo] = useState('')
  const [prazoDias, setPrazoDias] = useState(15)
  const [cidade, setCidade] = useState('')
  const [foro, setForo] = useState('')
  const [foroTouched, setForoTouched] = useState(false)
  const [data, setData] = useState(todayISO())
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [honorariosValor, setHonorariosValor] = useState(0)
  const [taxaOcupacaoValor, setTaxaOcupacaoValor] = useState(0)
  const [motivo, setMotivo] = useState('')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [copied, setCopied] = useState(false)
  const [letterheadLoading, setLetterheadLoading] = useState(false)
  const letterheadInputRef = useRef<HTMLInputElement>(null)

  function handleCidadeChange(value: string) {
    setCidade(value)
    if (!foroTouched) setForo(value)
  }

  function handleSelectProperty(id: string) {
    setPropertyId(id)
    const property = properties.find((p) => p.id === id)
    if (!property) return
    setEnderecoImovel(property.address || '')
    setImovelMatricula(property.bankCode ? `matrícula/código nº ${property.bankCode}` : '')
    const parts = [
      property.auctionHouse,
      property.processNumber ? `processo nº ${property.processNumber}` : '',
      property.auctionDate ? `em ${formatDateLong(property.auctionDate)}` : '',
    ].filter(Boolean)
    setLeiloeiroInfo(parts.join(', '))
    const baseValue = property.evaluationValue ?? property.marketValue
    if (baseValue) setTaxaOcupacaoValor(Math.round(baseValue * 0.01 * 100) / 100)
  }

  function handleSelectCotista(id: string) {
    const cotista = cotistas.find((c) => c.id === id)
    if (!cotista) return
    setNotificante(cotista.qualification ? `${cotista.name}, ${cotista.qualification}` : cotista.name)
  }

  async function handleLetterheadUpload(file: File | undefined) {
    if (!file) return
    setLetterheadLoading(true)
    try {
      const dataUrl = await readImageAsCompressedDataUrl(file)
      setLetterhead(dataUrl)
    } finally {
      setLetterheadLoading(false)
      if (letterheadInputRef.current) letterheadInputRef.current.value = ''
    }
  }

  const merged = useMemo(
    () =>
      mergeTemplate(template, {
        notificante: notificante || '[nome do notificante]',
        notificado: notificado || '[nome do notificado]',
        notificado_cpf: notificadoCpf || '[CPF do notificado]',
        notificado_qualificacao: notificadoQualificacao,
        imovel_endereco: enderecoImovel || '[endereço do imóvel]',
        imovel_matricula: imovelMatricula || '[matrícula do imóvel]',
        comarca: comarca || '[comarca]',
        leiloeiro_info: leiloeiroInfo || '[dados do leilão]',
        prazo_dias: String(prazoDias || 15),
        cidade: cidade || '[cidade]',
        foro: foro || cidade || '[foro]',
        data_extenso: formatDateLong(data),
        telefone: telefone || '[telefone]',
        email_clausula: email ? `, ou pelo e-mail ${email}` : '',
        honorarios_clausula: honorariosValor > 0 ? `, no valor estimado de ${formatCurrency(honorariosValor)}` : '',
        taxa_ocupacao_clausula: taxaOcupacaoValor > 0 ? `, no valor de ${formatCurrency(taxaOcupacaoValor)} mensais` : '',
        motivo,
      }),
    [
      template,
      notificante,
      notificado,
      notificadoCpf,
      notificadoQualificacao,
      enderecoImovel,
      imovelMatricula,
      comarca,
      leiloeiroInfo,
      prazoDias,
      cidade,
      foro,
      data,
      telefone,
      email,
      honorariosValor,
      taxaOcupacaoValor,
      motivo,
    ],
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
          antes de enviar — os requisitos formais (inclusive a cláusula do art. 37-A da Lei 9.514/97, que só se aplica a imóveis
          adquiridos por alienação fiduciária) variam conforme o tipo de leilão, o estado e a situação do imóvel.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 print:block">
        <Card className="flex flex-col gap-4 p-5 print:hidden">
          <FieldGroup>
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

          <FieldGroup>
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
              <Label htmlFor="notif-cpf" hint="opcional">
                CPF do notificado
              </Label>
              <Input id="notif-cpf" value={notificadoCpf} onChange={(e) => setNotificadoCpf(e.target.value)} placeholder="000.000.000-00" />
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
              placeholder="RG, endereço..."
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-endereco">Endereço do imóvel</Label>
              <Input id="notif-endereco" value={enderecoImovel} onChange={(e) => setEnderecoImovel(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-matricula" hint="opcional">
                Matrícula / registro
              </Label>
              <Input id="notif-matricula" value={imovelMatricula} onChange={(e) => setImovelMatricula(e.target.value)} placeholder="matrícula nº..., livro..., fls..." />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-comarca" hint="opcional">
                Comarca
              </Label>
              <Input id="notif-comarca" value={comarca} onChange={(e) => setComarca(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-leiloeiro" hint="opcional">
                Dados do leilão
              </Label>
              <Input id="notif-leiloeiro" value={leiloeiroInfo} onChange={(e) => setLeiloeiroInfo(e.target.value)} placeholder="Ex.: Caixa, processo nº ..." />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-prazo" hint="dias">
                Prazo para desocupação
              </Label>
              <Input id="notif-prazo" type="number" min={1} value={prazoDias} onChange={(e) => setPrazoDias(Number(e.target.value) || 0)} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-honorarios" hint="opcional">
                Honorários advocatícios
              </Label>
              <Input
                id="notif-honorarios"
                type="number"
                min={0}
                step="0.01"
                value={honorariosValor || ''}
                onChange={(e) => setHonorariosValor(Number(e.target.value) || 0)}
              />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="notif-taxa" hint="R$/mês, opcional — sugerido: 1% do imóvel (Lei 9.514/97, art. 37-A)">
              Taxa de ocupação mensal
            </Label>
            <Input
              id="notif-taxa"
              type="number"
              min={0}
              step="0.01"
              value={taxaOcupacaoValor || ''}
              onChange={(e) => setTaxaOcupacaoValor(Number(e.target.value) || 0)}
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-cidade">Cidade</Label>
              <Input id="notif-cidade" value={cidade} onChange={(e) => handleCidadeChange(e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-data">Data</Label>
              <Input id="notif-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label htmlFor="notif-foro" hint="opcional">
                Foro competente
              </Label>
              <Input
                id="notif-foro"
                value={foro}
                onChange={(e) => {
                  setForo(e.target.value)
                  setForoTouched(true)
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="notif-telefone" hint="opcional">
                Telefone de contato
              </Label>
              <Input id="notif-telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="notif-email" hint="opcional">
              E-mail de contato
            </Label>
            <Input id="notif-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="notif-motivo" hint="opcional">
              Observações adicionais
            </Label>
            <Textarea id="notif-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Texto extra a incluir no corpo da notificação" />
          </FieldGroup>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <input
              ref={letterheadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLetterheadUpload(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => letterheadInputRef.current?.click()}
              disabled={letterheadLoading}
              className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              {letterheadLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Trocar brasão/logo
            </button>
            {letterhead && (
              <button type="button" onClick={() => setLetterhead(null)} className="text-xs font-medium text-slate-400 hover:underline">
                Usar imagem padrão
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowTemplateEditor((v) => !v)}
              className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
            >
              {showTemplateEditor ? 'Ocultar' : 'Personalizar'} modelo
            </button>
          </div>

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
          <Card className="flex flex-col items-center gap-4 p-8 print:border-0 print:p-0 print:shadow-none">
            <img src={letterhead ?? defaultLetterhead} alt="" className="h-20 w-auto object-contain" />
            <p className="w-full font-serif text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">{merged}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
