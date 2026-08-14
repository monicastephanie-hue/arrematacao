import type { Stage } from '@/types'
import { getStageIcon } from '@/lib/stage-icons'
import { cn } from '@/lib/cn'

const PIN_CLASSES = {
  concluida: 'border-emerald-500 bg-emerald-500 text-white',
  em_andamento: 'border-amber-500 bg-amber-400 text-white',
  pendente: 'border-slate-300 bg-white text-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-600',
}

/** Linha entre a etapa `i` e `i+1`: sólida se `i` já foi concluída, "fluindo" se
 *  `i` está concluída e `i+1` é a etapa em andamento (a transição acontecendo
 *  agora), e neutra caso ainda não tenha chegado lá. */
function lineAfter(stages: Stage[], i: number): { className: string; flowing: boolean } {
  const current = stages[i]
  const next = stages[i + 1]
  if (current.status === 'concluida' && next?.status === 'em_andamento') {
    return { className: '', flowing: true }
  }
  if (current.status === 'concluida') {
    return { className: 'bg-emerald-500', flowing: false }
  }
  return { className: 'bg-slate-200 dark:bg-slate-700', flowing: false }
}

export function StagePinTimeline({ stages }: { stages: Stage[] }) {
  if (stages.length === 0) return null

  return (
    <div className="scrollbar-thin overflow-x-auto pb-1">
      <div className="flex min-w-max px-2 pt-1">
        {stages.map((stage, i) => {
          const isCurrent = stage.status === 'em_andamento'
          const lineToPrev = i > 0 ? lineAfter(stages, i - 1) : null
          const lineToNext = i < stages.length - 1 ? lineAfter(stages, i) : null
          const StageIcon = getStageIcon(stage.name)

          return (
            <div key={stage.id} className="relative flex w-24 shrink-0 flex-col items-center">
              {lineToPrev && (
                <div className={cn('absolute top-4 right-1/2 h-0.5 w-1/2', lineToPrev.className)}>
                  {lineToPrev.flowing && (
                    <div
                      className="stage-flow-line h-full w-full"
                      style={{ '--flow-color': 'var(--color-amber-400)' } as React.CSSProperties}
                    />
                  )}
                </div>
              )}

              {lineToNext && (
                <div className={cn('absolute top-4 left-1/2 h-0.5 w-1/2', lineToNext.className)}>
                  {lineToNext.flowing && (
                    <div
                      className="stage-flow-line h-full w-full"
                      style={{ '--flow-color': 'var(--color-amber-400)' } as React.CSSProperties}
                    />
                  )}
                </div>
              )}

              <div className="relative z-10 flex h-8 w-8 items-center justify-center">
                {isCurrent && (
                  <span className="motion-safe:animate-ping absolute h-6 w-6 rounded-full bg-amber-400 opacity-60" />
                )}
                <span
                  className={cn(
                    'relative flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm',
                    PIN_CLASSES[stage.status],
                    isCurrent && 'motion-safe:animate-bounce',
                  )}
                >
                  <StageIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
              </div>

              <span
                className={cn(
                  'mt-1.5 line-clamp-2 px-1 text-center text-[11px] leading-tight',
                  stage.status === 'pendente'
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'font-medium text-slate-700 dark:text-slate-300',
                )}
                title={stage.name}
              >
                {stage.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
