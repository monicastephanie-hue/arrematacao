import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import type { NewPropertyInput } from '@/store/useStore'
import type { PropertyStatus } from '@/types'
import { STATUS_META, STATUS_ORDER } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup, Input, Label, Select, Textarea } from '@/components/ui/field'
import { PhotoUpload } from '@/components/photo-upload'
import { CotistaPicker } from '@/components/cotista-picker'

const emptyForm: NewPropertyInput = {
  title: '',
  address: '',
  auctionHouse: '',
  bankCode: '',
  auctionUrl: '',
  processNumber: '',
  auctionDate: null,
  evaluationValue: null,
  marketValue: null,
  financed: false,
  cotistaIds: [],
  photoUrl: null,
  status: 'em_andamento',
  notes: '',
}

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const properties = useStore((s) => s.properties)
  const addProperty = useStore((s) => s.addProperty)
  const updateProperty = useStore((s) => s.updateProperty)

  const existing = id ? properties.find((p) => p.id === id) : undefined
  const isEditing = Boolean(existing)

  const [form, setForm] = useState<NewPropertyInput>(() =>
    existing
      ? {
          title: existing.title,
          address: existing.address,
          auctionHouse: existing.auctionHouse,
          bankCode: existing.bankCode,
          auctionUrl: existing.auctionUrl,
          processNumber: existing.processNumber,
          auctionDate: existing.auctionDate,
          evaluationValue: existing.evaluationValue,
          marketValue: existing.marketValue,
          financed: existing.financed,
          cotistaIds: existing.cotistaIds,
          photoUrl: existing.photoUrl,
          status: existing.status,
          notes: existing.notes,
        }
      : emptyForm,
  )

  function set<K extends keyof NewPropertyInput>(key: K, value: NewPropertyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    if (isEditing && existing) {
      updateProperty(existing.id, form)
      navigate(`/imoveis/${existing.id}`)
    } else {
      const newId = addProperty(form)
      navigate(`/imoveis/${newId}`)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link
        to={isEditing && existing ? `/imoveis/${existing.id}` : '/imoveis'}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {isEditing ? 'Editar imóvel' : 'Novo imóvel'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card className="flex flex-col gap-4 p-5">
          <FieldGroup>
            <Label htmlFor="title">Identificação do imóvel</Label>
            <Input
              id="title"
              required
              autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ex.: Bela Vista - André"
            />
          </FieldGroup>

          <PhotoUpload value={form.photoUrl} onChange={(photoUrl) => set('photoUrl', photoUrl)} />

          <FieldGroup>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rua, número, bairro, cidade"
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="bankCode" hint="opcional">
                Código (banco/leiloeiro/matrícula)
              </Label>
              <Input id="bankCode" value={form.bankCode} onChange={(e) => set('bankCode', e.target.value)} placeholder="Ex.: 8444409803066" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="auctionHouse" hint="opcional">
                Leiloeiro / instituição
              </Label>
              <Input id="auctionHouse" value={form.auctionHouse} onChange={(e) => set('auctionHouse', e.target.value)} placeholder="Ex.: Caixa" />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="processNumber" hint="opcional">
                Nº do processo/edital
              </Label>
              <Input id="processNumber" value={form.processNumber} onChange={(e) => set('processNumber', e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="auctionDate" hint="opcional">
                Data do leilão/arremate
              </Label>
              <Input
                id="auctionDate"
                type="date"
                value={form.auctionDate ?? ''}
                onChange={(e) => set('auctionDate', e.target.value || null)}
              />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="auctionUrl" hint="opcional">
              Link do edital/anúncio
            </Label>
            <Input id="auctionUrl" type="url" value={form.auctionUrl} onChange={(e) => set('auctionUrl', e.target.value)} placeholder="https://" />
          </FieldGroup>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="evaluationValue" hint="opcional">
                Valor de avaliação (edital)
              </Label>
              <Input
                id="evaluationValue"
                type="number"
                min={0}
                step="0.01"
                value={form.evaluationValue ?? ''}
                onChange={(e) => set('evaluationValue', e.target.value === '' ? null : Number(e.target.value))}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="marketValue" hint="opcional">
                Valor de mercado estimado
              </Label>
              <Input
                id="marketValue"
                type="number"
                min={0}
                step="0.01"
                value={form.marketValue ?? ''}
                onChange={(e) => set('marketValue', e.target.value === '' ? null : Number(e.target.value))}
              />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="status">Situação</Label>
            <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value as PropertyStatus)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
          </FieldGroup>

          <CotistaPicker value={form.cotistaIds} onChange={(cotistaIds) => set('cotistaIds', cotistaIds)} />

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.financed}
              onChange={(e) => set('financed', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-orange-400 dark:focus:ring-orange-400"
            />
            Imóvel financiado
          </label>

          <FieldGroup>
            <Label htmlFor="notes" hint="opcional">
              Observações gerais
            </Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anotações livres sobre o imóvel" />
          </FieldGroup>
        </Card>

        {!isEditing && (
          <p className="text-xs text-slate-400">
            Ao salvar, um fluxo padrão de etapas (pagamento, IPTU/ITBI, escritura, registro, desocupação, reforma,
            vistoria, comprador aprovado, venda e GCAP) será criado — você pode ajustar depois na página do imóvel.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Link to={isEditing && existing ? `/imoveis/${existing.id}` : '/imoveis'}>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </Link>
          <Button type="submit">{isEditing ? 'Salvar alterações' : 'Criar imóvel'}</Button>
        </div>
      </form>
    </div>
  )
}
