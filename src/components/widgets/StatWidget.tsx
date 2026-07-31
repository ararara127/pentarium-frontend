import { useTelemetry } from '../../hooks/useTelemetry'
import { ApiError } from '../../lib/api'
import type { Widget } from '../../lib/types'
import { WidgetShell } from './WidgetShell'

interface StatWidgetProps {
  widget: Widget
}

export function StatWidget({ widget }: StatWidgetProps) {
  const metric = widget.metric ?? ''
  const deviceId = widget.deviceId ?? undefined
  const unit = widget.config.unit ?? ''

  const { data, isLoading, isError, error } = useTelemetry(deviceId, {
    limit: 50,
    refetchInterval: 10_000,
    enabled: Boolean(deviceId && metric),
  })

  const latest = data?.[data.length - 1]
  const value = latest?.data[metric]
  const hasValue = typeof value === 'number'

  return (
    <WidgetShell
      title={widget.title}
      subtitle={widget.device?.name ?? undefined}
      isLoading={isLoading}
      error={
        isError
          ? error instanceof ApiError
            ? error.message
            : 'Gagal memuat data'
          : !deviceId || !metric
            ? 'Widget belum dikonfigurasi'
            : null
      }
      empty={!isLoading && !isError && !hasValue ? 'Belum ada data' : null}
    >
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-4xl font-extrabold tracking-tight text-[var(--text)]">
          {hasValue ? value : '—'}
          {hasValue && unit ? (
            <span className="ml-1 text-lg font-semibold text-[var(--text-muted)]">
              {unit}
            </span>
          ) : null}
        </p>
        <p className="mt-2 text-sm font-medium capitalize text-[var(--text-muted)]">
          {metric}
        </p>
      </div>
    </WidgetShell>
  )
}
