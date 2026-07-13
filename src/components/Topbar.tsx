import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-bold text-[var(--text)]">{title}</h1>
        {subtitle ? (
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--offline)] hover:text-[var(--offline)]"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  )
}
