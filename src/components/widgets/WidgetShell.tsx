import { LoaderCircle, AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

interface WidgetShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  isLoading?: boolean
  error?: string | null
  empty?: string | null
}

export function WidgetShell({
  title,
  subtitle,
  children,
  isLoading,
  error,
  empty,
}: WidgetShellProps) {
  return (
    <div className="flex h-full min-h-56 flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-3">
        <h3 className="text-base font-bold text-[var(--text)]">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
          <LoaderCircle className="animate-spin text-[var(--brand)]" size={18} />
          Memuat…
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[var(--offline)]">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : empty ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
          {empty}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      )}
    </div>
  )
}
