import type { PropertyStatus } from '@/types'
import { STATUS_META } from '@/types'
import { cn } from '@/lib/cn'

export function StatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}
