import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTelemetry } from '../../hooks/useTelemetry'
import { ApiError } from '../../lib/api'
import {
  formatChartTime,
  formatChartTimeForRange,
  telemetryRangeLabel,
  telemetryRefetchInterval,
} from '../../lib/format'
import type { Widget } from '../../lib/types'
import { WidgetShell } from './WidgetShell'

interface ChartWidgetProps {
  widget: Widget
}

export function ChartWidget({ widget }: ChartWidgetProps) {
  const range = widget.config.range
  const limit = widget.config.limit ?? 50
  const metric = widget.metric ?? ''
  const deviceId = widget.deviceId ?? undefined

  const { data, isLoading, isError, error } = useTelemetry(deviceId, {
    ...(range ? { range } : { limit }),
    refetchInterval: range ? telemetryRefetchInterval(range) : 10_000,
    enabled: Boolean(deviceId && metric),
  })

  const chartData =
    data?.map((point) => ({
      time: range
        ? formatChartTimeForRange(point.ts, range)
        : formatChartTime(point.ts),
      value: point.data[metric],
    })) ?? []

  const hasValues = chartData.some((d) => typeof d.value === 'number')

  const subtitleParts = [
    widget.device?.name,
    range ? telemetryRangeLabel(range) : null,
  ].filter(Boolean)

  return (
    <WidgetShell
      title={widget.title}
      subtitle={subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined}
      isLoading={isLoading}
      error={
        isError
          ? error instanceof ApiError
            ? error.message
            : 'Gagal memuat chart'
          : !deviceId || !metric
            ? 'Widget belum dikonfigurasi'
            : null
      }
      empty={
        !isLoading && !isError && !hasValues
          ? range
            ? 'Belum ada data pada rentang waktu ini'
            : 'Belum ada data'
          : null
      }
    >
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                boxShadow: 'var(--shadow)',
                color: 'var(--text)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={metric}
              stroke="var(--brand)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  )
}
