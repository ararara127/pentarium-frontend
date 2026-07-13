import type { DeviceStatus } from '../lib/types'

interface StatusBadgeProps {
  status: DeviceStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isOnline = status === 'online'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isOnline
          ? 'bg-[color-mix(in_srgb,var(--online)_12%,transparent)] text-[var(--online)]'
          : 'bg-[color-mix(in_srgb,var(--offline)_12%,transparent)] text-[var(--offline)]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOnline ? 'bg-[var(--online)]' : 'bg-[var(--offline)]'
        }`}
      />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  )
}
