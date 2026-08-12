import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'

interface TopbarProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 backdrop-blur md:h-16 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)] md:hidden"
          aria-label="Buka menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-[var(--text)] md:text-lg">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--offline)] hover:text-[var(--offline)] md:px-3"
        aria-label="Logout"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  )
}
