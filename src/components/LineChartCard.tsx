import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TelemetryPoint, TelemetryRange } from '../lib/types'
import { formatChartTime, formatChartTimeForRange } from '../lib/format'

interface LineChartCardProps {
  data: TelemetryPoint[]
  title?: string
  subtitle?: string
  emptyMessage?: string
  range?: TelemetryRange
}

export function LineChartCard({
  data,
  title = 'Telemetri suhu & kelembapan',
  subtitle,
  emptyMessage = 'Belum ada data telemetri.',
  range,
}: LineChartCardProps) {
  const chartData = data.map((point) => ({
    time: range
      ? formatChartTimeForRange(point.ts, range)
      : formatChartTime(point.ts),
    suhu: point.data.suhu,
    kelembapan: point.data.kelembapan,
    ts: point.ts,
  }))

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[var(--text)]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-[var(--text-muted)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow)',
                  color: 'var(--text)',
                }}
                labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 12, fontSize: 13, color: 'var(--text-muted)' }}
              />
              <Line
                type="monotone"
                dataKey="suhu"
                name="Suhu (°C)"
                stroke="var(--brand)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="kelembapan"
                name="Kelembapan (%)"
                stroke="var(--warning)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
