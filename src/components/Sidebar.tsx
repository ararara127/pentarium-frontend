import { NavLink } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Cpu,
  LayoutDashboard,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/devices', label: 'Devices', icon: Cpu, end: false },
  { to: '/alerts', label: 'Alerts', icon: Bell, end: false },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`sticky top-0 flex h-svh shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 ${
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

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
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
    </aside>
  )
}
