import type { TelemetryRange } from './types'

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Belum pernah'

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Tidak valid'

  const diffMs = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
  const absMs = Math.abs(diffMs)

  if (absMs < 60_000) {
    return rtf.format(Math.round(diffMs / 1000), 'second')
  }

  if (absMs < 3_600_000) {
    return rtf.format(Math.round(diffMs / 60_000), 'minute')
  }

  if (absMs < 86_400_000) {
    return rtf.format(Math.round(diffMs / 3_600_000), 'hour')
  }

  if (absMs < 604_800_000) {
    return rtf.format(Math.round(diffMs / 86_400_000), 'day')
  }

  if (absMs < 2_592_000_000) {
    return rtf.format(Math.round(diffMs / 604_800_000), 'week')
  }

  if (absMs < 31_536_000_000) {
    return rtf.format(Math.round(diffMs / 2_592_000_000), 'month')
  }

  return rtf.format(Math.round(diffMs / 31_536_000_000), 'year')
}

export function formatChartTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const TELEMETRY_RANGE_OPTIONS: Array<{
  value: TelemetryRange
  label: string
  shortLabel: string
}> = [
  { value: '15m', label: '15 menit', shortLabel: '15 menit terakhir' },
  { value: '1h', label: '1 jam', shortLabel: '1 jam terakhir' },
  { value: '24h', label: '24 jam', shortLabel: '24 jam terakhir' },
  { value: '7d', label: '7 hari', shortLabel: '7 hari terakhir' },
]

export function formatChartTimeForRange(iso: string, range: TelemetryRange): string {
  const date = new Date(iso)

  if (range === '7d') {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const time = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${day}/${month} ${time}`
  }

  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function telemetryRefetchInterval(range: TelemetryRange): number {
  switch (range) {
    case '15m':
    case '1h':
      return 10_000
    case '24h':
      return 60_000
    case '7d':
      return 5 * 60_000
  }
}

export function telemetryRangeLabel(range: TelemetryRange): string {
  return (
    TELEMETRY_RANGE_OPTIONS.find((option) => option.value === range)?.shortLabel ??
    range
  )
}
