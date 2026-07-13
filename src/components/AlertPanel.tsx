import { Bell, TriangleAlert } from 'lucide-react'
import type { Alert } from '../lib/types'
import { formatRelativeTime } from '../lib/format'

interface AlertPanelProps {
  alerts: Alert[]
  limit?: number
}

export function AlertPanel({ alerts, limit = 5 }: AlertPanelProps) {
  const items = alerts.slice(0, limit)

  return (
    <div className="flex h-full flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-4 flex items-center gap-2">
        <Bell size={16} className="text-[var(--warning)]" />
        <h2 className="text-base font-bold text-[var(--text)]">Alert Terbaru</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-10 text-sm text-[var(--text-muted)]">
          Tidak ada alert
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-3">
          {items.map((alert, index) => {
            const tone = index % 2 === 0 ? 'warning' : 'offline'
            const accent =
              tone === 'warning' ? 'var(--warning)' : 'var(--offline)'

            return (
              <li
                key={alert.id}
                className="rounded-xl border border-[var(--border)] px-3.5 py-3"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: accent,
                  background:
                    tone === 'warning'
                      ? 'color-mix(in srgb, var(--warning) 6%, transparent)'
                      : 'color-mix(in srgb, var(--offline) 6%, transparent)',
                }}
              >
                <div className="flex items-start gap-2">
                  <TriangleAlert
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: accent }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      {alert.device.name}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                      {alert.message}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {formatRelativeTime(alert.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
