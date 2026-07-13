import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Droplets, Thermometer } from 'lucide-react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useDevices } from '../hooks/useDevices'
import { LineChartCard } from '../components/LineChartCard'
import { PageError, PageLoading } from '../components/PageState'
import { ApiError } from '../lib/api'
import { formatRelativeTime } from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const telemetryQuery = useTelemetry(id)
  const devicesQuery = useDevices()

  const device = devicesQuery.data?.find((item) => item.id === id)
  const points = telemetryQuery.data ?? []
  const latest = points.length > 0 ? points[points.length - 1] : undefined

  if (telemetryQuery.isLoading) {
    return <PageLoading>Memuat telemetri…</PageLoading>
  }

  if (telemetryQuery.isError) {
    const message =
      telemetryQuery.error instanceof ApiError
        ? telemetryQuery.error.message
        : 'Gagal memuat data telemetri.'
    return <PageError>{message}</PageError>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/devices"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--brand)]"
          >
            <ArrowLeft size={16} />
            Kembali ke devices
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--brand)]">
              {device?.name ?? `Device ${id}`}
            </h2>
            {device ? <StatusBadge status={device.status} /> : null}
          </div>
          <p className="font-mono text-xs text-[var(--text-muted)]">{id}</p>
          {device ? (
            <p className="text-sm text-[var(--text-muted)]">
              Terakhir terlihat {formatRelativeTime(device.lastSeenAt)}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Auto-refresh setiap 5 detik
          {telemetryQuery.isFetching && !telemetryQuery.isLoading
            ? ' · memperbarui…'
            : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
              <Thermometer size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)]">Suhu</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {latest ? `${latest.data.suhu}°C` : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]">
              <Droplets size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)]">Kelembapan</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {latest ? `${latest.data.kelembapan}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <LineChartCard data={points} />
    </div>
  )
}
