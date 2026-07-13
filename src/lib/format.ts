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
