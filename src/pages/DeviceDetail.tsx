import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Download, Droplets, Thermometer } from 'lucide-react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useDevices } from '../hooks/useDevices'
import { LineChartCard } from '../components/LineChartCard'
import { PageError, PageLoading } from '../components/PageState'
import { api, ApiError } from '../lib/api'
import {
  formatRelativeTime,
  TELEMETRY_RANGE_OPTIONS,
  telemetryRefetchInterval,
} from '../lib/format'
import { StatusBadge } from '../components/StatusBadge'
import type { TelemetryRange } from '../lib/types'

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const [range, setRange] = useState<TelemetryRange>('1h')
  const [exportError, setExportError] = useState<string | null>(null)

  const telemetryQuery = useTelemetry(id, {
    range,
    refetchInterval: telemetryRefetchInterval(range),
  })
  const devicesQuery = useDevices()

  const exportMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new ApiError('Device tidak ditemukan', 400)
      return api.exportTelemetry(id, range)
    },
    onSuccess: () => {
      setExportError(null)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Gagal mengunduh data telemetri.'
      setExportError(
        error instanceof ApiError && error.status === 404
          ? 'Tidak ada data pada rentang waktu ini'
          : message,
      )
    },
  })

  useEffect(() => {
    if (!exportError) return
    const timer = window.setTimeout(() => setExportError(null), 4000)
    return () => window.clearTimeout(timer)
  }, [exportError])

  const device = devicesQuery.data?.find((item) => item.id === id)
  const points = telemetryQuery.data ?? []
  const latest = points.length > 0 ? points[points.length - 1] : undefined

  if (telemetryQuery.isLoading && !telemetryQuery.data) {
    return <PageLoading>Memuat telemetri…</PageLoading>
  }

  if (telemetryQuery.isError && !telemetryQuery.data) {
    const message =
      telemetryQuery.error instanceof ApiError
        ? telemetryQuery.error.message
        : 'Gagal memuat data telemetri.'
    return <PageError>{message}</PageError>
  }

  const refreshLabel =
    range === '15m' || range === '1h'
      ? '10 detik'
      : range === '24h'
        ? '60 detik'
        : '5 menit'

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
          Auto-refresh setiap {refreshLabel}
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
                {latest?.data.suhu != null ? `${latest.data.suhu}°C` : '—'}
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
                {latest?.data.kelembapan != null ? `${latest.data.kelembapan}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TELEMETRY_RANGE_OPTIONS.map((option) => {
              const active = range === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                      : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending || !id}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={16} />
              {exportMutation.isPending ? 'Mengunduh...' : 'Export Excel'}
            </button>
            <p className="text-xs text-[var(--text-muted)]">
              Mengunduh data mentah sesuai rentang yang dipilih.
            </p>
            {exportError ? (
              <p className="text-xs font-semibold text-[var(--offline)]">{exportError}</p>
            ) : null}
          </div>
        </div>

        <LineChartCard
          data={points}
          range={range}
          emptyMessage="Belum ada data pada rentang waktu ini"
        />
      </div>
    </div>
  )
}
