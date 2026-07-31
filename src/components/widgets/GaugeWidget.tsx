import { useTelemetry } from '../../hooks/useTelemetry'
import { ApiError } from '../../lib/api'
import type { Widget } from '../../lib/types'
import { WidgetShell } from './WidgetShell'

interface GaugeWidgetProps {
  widget: Widget
}

function gaugeColor(ratio: number): string {
  if (ratio >= 0.9) return 'var(--offline)'
  if (ratio >= 0.7) return 'var(--warning)'
  return 'var(--online)'
}

export function GaugeWidget({ widget }: GaugeWidgetProps) {
  const metric = widget.metric ?? ''
  const deviceId = widget.deviceId ?? undefined
  const min = widget.config.min ?? 0
  const max = widget.config.max ?? 100
  const unit = widget.config.unit ?? ''

  const { data, isLoading, isError, error } = useTelemetry(deviceId, {
    limit: 50,
    refetchInterval: 10_000,
    enabled: Boolean(deviceId && metric),
  })

  const latest = data?.[data.length - 1]
  const value = latest?.data[metric]
  const hasValue = typeof value === 'number'

  const range = max - min || 1
  const clamped = hasValue ? Math.min(max, Math.max(min, value)) : min
  const ratio = (clamped - min) / range
  const color = gaugeColor(ratio)

  // Semi-circle: 180deg arc via SVG
  const radius = 70
  const stroke = 12
  const cx = 90
  const cy = 90
  const circumference = Math.PI * radius
  const dash = circumference * ratio

  return (
    <WidgetShell
      title={widget.title}
      subtitle={widget.device?.name ?? undefined}
      isLoading={isLoading}
      error={
        isError
          ? error instanceof ApiError
            ? error.message
            : 'Gagal memuat gauge'
          : !deviceId || !metric
            ? 'Widget belum dikonfigurasi'
            : null
      }
      empty={!isLoading && !isError && !hasValue ? 'Belum ada data' : null}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <svg viewBox="0 0 180 110" className="h-36 w-full max-w-[220px]">
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-[var(--text)]"
            style={{ fontSize: 28, fontWeight: 800 }}
          >
            {hasValue ? value.toFixed(1) : '—'}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            className="fill-[var(--text-muted)]"
            style={{ fontSize: 12 }}
          >
            {metric}
            {unit ? ` (${unit})` : ''}
          </text>
        </svg>
        <p className="text-xs text-[var(--text-muted)]">
          Rentang {min} – {max}
          {unit ? ` ${unit}` : ''}
        </p>
      </div>
    </WidgetShell>
  )
}
