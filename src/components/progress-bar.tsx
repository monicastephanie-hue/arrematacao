import { cn } from '@/lib/cn'

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all',
          clamped === 100 ? 'bg-emerald-500' : 'bg-orange-500',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
