import { Cpu, Wifi, WifiOff, type LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number | string
  tone?: 'default' | 'online' | 'offline'
  icon?: LucideIcon
}

const toneStyles = {
  default: {
    iconBg: 'bg-[var(--brand-light)]',
    iconColor: 'text-[var(--brand)]',
    valueColor: 'text-[var(--text)]',
  },
  online: {
    iconBg: 'bg-[color-mix(in_srgb,var(--online)_12%,transparent)]',
    iconColor: 'text-[var(--online)]',
    valueColor: 'text-[var(--online)]',
  },
  offline: {
    iconBg: 'bg-[color-mix(in_srgb,var(--offline)_12%,transparent)]',
    iconColor: 'text-[var(--offline)]',
    valueColor: 'text-[var(--offline)]',
  },
} as const

const defaultIcons: Record<NonNullable<KPICardProps['tone']>, LucideIcon> = {
  default: Cpu,
  online: Wifi,
  offline: WifiOff,
}

export function KPICard({ title, value, tone = 'default', icon }: KPICardProps) {
  const styles = toneStyles[tone]
  const Icon = icon ?? defaultIcons[tone]

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight ${styles.valueColor}`}>
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}
