import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useIsDarkMode } from '@/hooks/use-dark-mode'
import { formatCurrency } from '@/lib/format'

interface DatumPoint {
  name: string
  value: number
}

const LIGHT = {
  bar: '#d97706',
  grid: '#e1e0d9',
  axis: '#898781',
  tooltipBg: '#fcfcfb',
  tooltipText: '#0b0b0b',
  tooltipBorder: 'rgba(11,11,11,0.10)',
}
const DARK = {
  bar: '#f0b429',
  grid: '#2c2c2a',
  axis: '#898781',
  tooltipBg: '#1a1a19',
  tooltipText: '#ffffff',
  tooltipBorder: 'rgba(255,255,255,0.10)',
}

function CustomTooltip({
  active,
  payload,
  colors,
}: {
  active?: boolean
  payload?: { payload: DatumPoint }[]
  colors: typeof LIGHT
}) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-md ring-1"
      style={{ background: colors.tooltipBg, color: colors.tooltipText, boxShadow: `0 0 0 1px ${colors.tooltipBorder}` }}
    >
      <p className="font-medium">{point.name}</p>
      <p className="mt-0.5 tabular-nums opacity-80">{formatCurrency(point.value)}</p>
    </div>
  )
}

export function InvestmentByPropertyChart({ data }: { data: DatumPoint[] }) {
  const isDark = useIsDarkMode()
  const colors = isDark ? DARK : LIGHT
  const height = Math.max(160, data.length * 34 + 24)

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barCategoryGap={10}>
        <CartesianGrid horizontal={false} stroke={colors.grid} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tickLine={false}
          axisLine={false}
          tick={{ fill: colors.axis, fontSize: 12 }}
          tickFormatter={(name: string) => (name.length > 20 ? `${name.slice(0, 19)}…` : name)}
        />
        <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(11,11,11,0.03)' }} content={<CustomTooltip colors={colors} />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18} fill={colors.bar}>
          {data.map((d) => (
            <Cell key={d.name} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: unknown) => formatCurrency(typeof v === 'number' ? v : Number(v))}
            style={{ fill: colors.axis, fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
