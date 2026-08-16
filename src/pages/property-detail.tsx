import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Banknote, ExternalLink, Landmark, MapPin, Pencil, Trash2, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { KanbanStatus, PropertyStatus } from '@/types'
import { KANBAN_STATUS_META, KANBAN_STATUS_ORDER, STATUS_META, STATUS_ORDER } from '@/types'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { ProgressBar } from '@/components/progress-bar'
import { StagesEditor } from '@/components/stages-editor'
import { StagePinTimeline } from '@/components/stage-pin-timeline'
import { StageChecklist } from '@/components/stage-checklist'
import { ValuesEditor } from '@/components/values-editor'
import { AttachmentsEditor } from '@/components/attachments-editor'
import { SingleAttachmentUpload } from '@/components/single-attachment-upload'
import { CumulativeInvestmentChart } from '@/components/charts/cumulative-investment-chart'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/field'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cumulativeInvestmentSeries, potentialResult, stageProgress, totalInvested, valuePerCoOwner } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/format'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const property = useStore((s) => s.properties.find((p) => p.id === id))
  const cotistas = useStore((s) => s.cotistas)
  const updateProperty = useStore((s) => s.updateProperty)
  const setPropertyKanbanStatus = useStore((s) => s.setPropertyKanbanStatus)
  const deleteProperty = useStore((s) => s.deleteProperty)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!property) return <Navigate to="/imoveis" replace />

  const propertyCotistas = cotistas.filter((c) => property.cotistaIds.includes(c.id))

  const invested = totalInvested(property)
  const potential = potentialResult(property)
  const perCoOwner = valuePerCoOwner(property)
  const progress = stageProgress(property)
  const series = cumulativeInvestmentSeries(property)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/imoveis" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos imóveis
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          {property.address && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              {property.address}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={property.status}
            onChange={(e) => updateProperty(property.id, { status: e.target.value as PropertyStatus })}
            className="w-auto"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <Select
            value={property.kanbanStatus}
            onChange={(e) => setPropertyKanbanStatus(property.id, e.target.value as KanbanStatus)}
            className="w-auto"
            title="Coluna no quadro de Gerenciamento"
          >
            {KANBAN_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {KANBAN_STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <Link to={`/imoveis/${property.id}/editar`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {property.photoUrl && (
          <img
            src={property.photoUrl}
            alt={property.title}
            className="aspect-video w-full rounded-2xl object-cover ring-1 ring-slate-200 lg:w-72 lg:shrink-0 dark:ring-slate-800"
          />
        )}
        <Card className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={<Landmark className="h-3.5 w-3.5" />} label="Leiloeiro / instituição" value={property.auctionHouse || '—'} />
          <InfoItem label="Código" value={property.bankCode || '—'} />
          <InfoItem label="Nº do processo/edital" value={property.processNumber || '—'} />
          <InfoItem label="Data do leilão/arremate" value={formatDate(property.auctionDate)} />
          <InfoItem label="Valor de avaliação" value={formatCurrency(property.evaluationValue)} />
          <div>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5" />
              Cotistas
            </p>
            {propertyCotistas.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {propertyCotistas.map((c) => (
                  <Link
                    key={c.id}
                    to="/cotistas"
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">—</p>
            )}
          </div>
          {property.financed && (
            <InfoItem label="Financiamento" value="Imóvel financiado" />
          )}
          {property.auctionUrl && (
            <a
              href={property.auctionUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver edital/anúncio
            </a>
          )}
        </Card>
      </div>

      {property.notes && (
        <Card className="p-4 text-sm text-slate-600 dark:text-slate-400">
          <p className="mb-1 text-xs font-medium text-slate-400">Observações</p>
          {property.notes}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total investido" value={formatCurrency(invested)} icon={<Banknote className="h-4 w-4" />} />
        <StatCard label="Valor de mercado estimado" value={formatCurrency(property.marketValue)} />
        <StatCard
          label="Resultado potencial"
          value={potential === null ? '—' : formatCurrency(potential)}
          tone={potential === null ? 'default' : potential >= 0 ? 'positive' : 'negative'}
          hint="Valor de mercado − investido"
        />
        <StatCard label="Valor por cotista" value={perCoOwner === null ? '—' : formatCurrency(perCoOwner)} />
      </div>

      <Card className="p-4">
        <StagePinTimeline stages={property.stages} />
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Checklist de atividades</h2>
        <p className="mb-3 text-xs text-slate-400">
          Marque as atividades de cada etapa. Ao concluir todas, a etapa correspondente é marcada como concluída
          automaticamente em "Andamento das etapas".
        </p>
        <StageChecklist propertyId={property.id} stages={property.stages} />
      </Card>

      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Andamento das etapas</h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{progress}% concluído</span>
        </div>
        <ProgressBar value={progress} className="mb-5" />
        <StagesEditor propertyId={property.id} stages={property.stages} />
      </Card>

      {series.length >= 2 && (
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Valor acumulado investido</h2>
          <CumulativeInvestmentChart data={series} />
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Valores lançados</h2>
        <ValuesEditor propertyId={property.id} values={property.values} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Documentos do arremate</h2>
        <Card className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <SingleAttachmentUpload
            label="Proposta de Arrematação"
            value={property.proposalAttachment}
            onChange={(proposalAttachment) => updateProperty(property.id, { proposalAttachment })}
          />
          <SingleAttachmentUpload
            label="Boleto"
            value={property.billAttachment}
            onChange={(billAttachment) => updateProperty(property.id, { billAttachment })}
          />
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Anexos</h2>
        <AttachmentsEditor propertyId={property.id} attachments={property.attachments} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir imóvel"
        description={`Tem certeza que deseja excluir "${property.title}"? Todos os valores e etapas registrados serão perdidos.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteProperty(property.id)
          navigate('/imoveis')
        }}
      />
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  )
}
