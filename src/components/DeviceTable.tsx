import { useNavigate } from 'react-router-dom'
import { HardDrive } from 'lucide-react'
import type { Device } from '../lib/types'
import { formatRelativeTime } from '../lib/format'
import { StatusBadge } from './StatusBadge'

interface DeviceTableProps {
  devices: Device[]
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const navigate = useNavigate()

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 shadow-[var(--shadow)]">
        <HardDrive className="mb-3 text-[var(--text-muted)]" size={28} />
        <p className="font-semibold text-[var(--text)]">Belum ada device</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Device yang terdaftar akan muncul di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,white)]">
              <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">Nama</th>
              <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">Status</th>
              <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">Claimed</th>
              <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr
                key={device.id}
                onClick={() => navigate(`/devices/${device.id}`)}
                className="cursor-pointer border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--brand)_4%,transparent)]"
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-[var(--text)]">{device.name}</div>
                  <div className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                    {device.id}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={device.status} />
                </td>
                <td className="px-5 py-4 text-[var(--text-muted)]">
                  {device.claimed ? 'Ya' : 'Belum'}
                </td>
                <td className="px-5 py-4 text-[var(--text-muted)]">
                  {formatRelativeTime(device.lastSeenAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
