import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LayoutDashboard,
  X,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/devices', label: 'Devices', icon: Cpu, end: false },
  { to: '/alerts', label: 'Alerts', icon: Bell, end: false },
]

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onMobileClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileOpen, onMobileClose])

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={collapsed ? label : undefined}
          onClick={() => onMobileClose?.()}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              collapsed ? 'justify-center' : ''
            } ${
              isActive
                ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
            }`
          }
        >
          <Icon size={18} strokeWidth={2} />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside
        className={`sticky top-0 z-20 hidden h-svh shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 md:flex ${
          collapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-[var(--border)] ${
            collapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {!collapsed && (
            <span className="text-xl font-extrabold tracking-tight text-[var(--brand)]">
              Pentarium
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        {nav}
      </aside>

      {/* Mobile overlay + drawer */}
      <button
        type="button"
        aria-label="Tutup menu"
        className={`fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--text)_40%,transparent)] transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(16.5rem,85vw)] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <span className="text-xl font-extrabold tracking-tight text-[var(--brand)]">
            Pentarium
          </span>
          <button
            type="button"
            onClick={onMobileClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--text)]"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => onMobileClose?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
