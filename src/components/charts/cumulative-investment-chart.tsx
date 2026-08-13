import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useIsDarkMode } from '@/hooks/use-dark-mode'
import { formatCurrency, formatDate } from '@/lib/format'

interface Point {
  date: string
  total: number
}

const LIGHT = { line: '#ea580c', fill: 'rgba(234,88,12,0.12)', grid: '#e1e0d9', axis: '#898781', tooltipBg: '#fcfcfb', tooltipText: '#0b0b0b', tooltipBorder: 'rgba(11,11,11,0.10)' }
const DARK = { line: '#fb923c', fill: 'rgba(251,146,60,0.14)', grid: '#2c2c2a', axis: '#898781', tooltipBg: '#1a1a19', tooltipText: '#ffffff', tooltipBorder: 'rgba(255,255,255,0.10)' }

function CustomTooltip({ active, payload, colors }: { active?: boolean; payload?: { payload: Point }[]; colors: typeof LIGHT }) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-md"
      style={{ background: colors.tooltipBg, color: colors.tooltipText, boxShadow: `0 0 0 1px ${colors.tooltipBorder}` }}
    >
      <p className="font-medium">{formatDate(point.date)}</p>
      <p className="mt-0.5 tabular-nums opacity-80">{formatCurrency(point.total)}</p>
    </div>
  )
}

export function CumulativeInvestmentChart({ data }: { data: Point[] }) {
  const isDark = useIsDarkMode()
  const colors = isDark ? DARK : LIGHT

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke={colors.grid} />
        <XAxis dataKey="date" tickFormatter={(d: string) => formatDate(d)} tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: colors.grid }} minTickGap={24} />
        <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
        <Tooltip content={<CustomTooltip colors={colors} />} />
        <Area type="monotone" dataKey="total" stroke={colors.line} strokeWidth={2} fill={colors.fill} dot={{ r: 3, fill: colors.line, strokeWidth: 0 }} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
