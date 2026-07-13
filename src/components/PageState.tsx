import { AlertCircle, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageStateProps {
  children?: ReactNode
}

export function PageLoading({ children = 'Memuat data…' }: PageStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
      <LoaderCircle className="animate-spin text-[var(--brand)]" size={28} />
      <p className="text-sm font-medium">{children}</p>
    </div>
  )
}

export function PageError({ children }: PageStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-6 text-center shadow-[var(--shadow)]">
      <AlertCircle className="text-[var(--offline)]" size={28} />
      <p className="max-w-md text-sm font-medium text-[var(--text)]">{children}</p>
    </div>
  )
}
