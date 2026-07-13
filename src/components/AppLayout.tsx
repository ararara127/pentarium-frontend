import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

function resolveTitle(pathname: string): { title: string; subtitle?: string } {
  if (pathname.startsWith('/devices/') && pathname !== '/devices') {
    return {
      title: 'Device Detail',
      subtitle: 'Telemetri real-time',
    }
  }
  if (pathname.startsWith('/devices')) {
    return {
      title: 'Devices',
      subtitle: 'Daftar seluruh device',
    }
  }
  if (pathname.startsWith('/alerts')) {
    return {
      title: 'Alerts',
      subtitle: 'Aturan dan riwayat notifikasi',
    }
  }
  return {
    title: 'Dashboard',
    subtitle: 'Ringkasan perangkat IoT',
  }
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { title, subtitle } = resolveTitle(location.pathname)

  return (
    <div className="flex min-h-svh bg-[var(--bg)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
