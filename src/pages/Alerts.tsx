import { type FormEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Bell, Plus, Trash2 } from 'lucide-react'
import { useAlerts } from '../hooks/useAlerts'
import { useAlertRules } from '../hooks/useAlertRules'
import { useDevices } from '../hooks/useDevices'
import { Modal } from '../components/Modal'
import { PageError, PageLoading } from '../components/PageState'
import { api, ApiError } from '../lib/api'
import { formatRelativeTime } from '../lib/format'
import type { AlertMetric, AlertOperator, Device } from '../lib/types'

const inputClassName =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]'

function shortId(id: string): string {
  return id.slice(0, 8)
}

function sortDevicesOnlineFirst(devices: Device[]): Device[] {
  return [...devices].sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name)
    return a.status === 'online' ? -1 : 1
  })
}

export function Alerts() {
  const queryClient = useQueryClient()
  const rulesQuery = useAlertRules()
  const alertsQuery = useAlerts(false)
  const devicesQuery = useDevices()

  const [modalOpen, setModalOpen] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [metric, setMetric] = useState<AlertMetric>('suhu')
  const [operator, setOperator] = useState<AlertOperator>('>')
  const [threshold, setThreshold] = useState('')

  const createMutation = useMutation({
    mutationFn: () =>
      api.createAlertRule({
        deviceId,
        metric,
        operator,
        threshold: Number(threshold),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAlertRule(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
    },
  })

  function closeModal() {
    setModalOpen(false)
    setDeviceId('')
    setMetric('suhu')
    setOperator('>')
    setThreshold('')
    createMutation.reset()
  }

  function openModal() {
    const sorted = sortDevicesOnlineFirst(devicesQuery.data ?? [])
    setDeviceId(sorted[0]?.id ?? '')
    setModalOpen(true)
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createMutation.mutate()
  }

  if (rulesQuery.isLoading || alertsQuery.isLoading) {
    return <PageLoading>Memuat alerts…</PageLoading>
  }

  if (rulesQuery.isError) {
    const message =
      rulesQuery.error instanceof ApiError
        ? rulesQuery.error.message
        : 'Gagal memuat aturan alert.'
    return <PageError>{message}</PageError>
  }

  if (alertsQuery.isError) {
    const message =
      alertsQuery.error instanceof ApiError
        ? alertsQuery.error.message
        : 'Gagal memuat riwayat alert.'
    return <PageError>{message}</PageError>
  }

  const rules = rulesQuery.data ?? []
  const sortedDevices = sortDevicesOnlineFirst(devicesQuery.data ?? [])
  const selectedDevice = sortedDevices.find((device) => device.id === deviceId)
  const alerts = [...(alertsQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const createError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Gagal menambah aturan.'
        : null

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Aturan Alert</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Kondisi yang memicu notifikasi telemetri.
            </p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <Plus size={16} />
            Tambah Aturan
          </button>
        </div>

        <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <Bell className="mb-3 text-[var(--text-muted)]" size={28} />
              <p className="font-semibold text-[var(--text)]">Belum ada aturan</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Buat aturan untuk memantau suhu atau kelembapan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,white)]">
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Device
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      ID
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Metric
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Operator
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Threshold
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => {
                    const deviceName =
                      rule.device?.name ??
                      devicesQuery.data?.find((d) => d.id === rule.deviceId)?.name ??
                      rule.deviceId

                    return (
                      <tr
                        key={rule.id}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-5 py-4 font-semibold text-[var(--text)]">
                          {deviceName}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-[var(--text-muted)]">
                          {shortId(rule.deviceId)}
                        </td>
                        <td className="px-5 py-4 capitalize text-[var(--text-muted)]">
                          {rule.metric}
                        </td>
                        <td className="px-5 py-4 font-mono text-[var(--text)]">
                          {rule.operator}
                        </td>
                        <td className="px-5 py-4 font-extrabold text-[var(--text)]">
                          {rule.threshold}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  'Hapus aturan alert ini?',
                                )
                              ) {
                                deleteMutation.mutate(rule.id)
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--offline)] transition hover:bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Riwayat Alert</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Notifikasi yang pernah terpicu.
          </p>
        </div>

        <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
          {alerts.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-[var(--text-muted)]">
              Tidak ada alert
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,white)]">
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Device
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Message
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)]">
                      Waktu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-5 py-4 font-semibold text-[var(--text)]">
                        {alert.device.name}
                      </td>
                      <td className="px-5 py-4 text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" />
                          {alert.message}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[var(--text-muted)]">
                        {formatRelativeTime(alert.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Modal open={modalOpen} title="Tambah Aturan" onClose={closeModal}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label
              htmlFor="rule-device"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Device
            </label>
            <select
              id="rule-device"
              required
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className={inputClassName}
            >
              <option value="" disabled>
                Pilih device
              </option>
              {sortedDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} — {device.status} — {shortId(device.id)}
                </option>
              ))}
            </select>
            {selectedDevice?.status === 'offline' ? (
              <p className="mt-1.5 text-xs text-[var(--warning)]">
                Device offline tidak akan memicu alert sampai mengirim data.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="rule-metric"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Metric
            </label>
            <select
              id="rule-metric"
              required
              value={metric}
              onChange={(e) => setMetric(e.target.value as AlertMetric)}
              className={inputClassName}
            >
              <option value="suhu">suhu</option>
              <option value="kelembapan">kelembapan</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rule-operator"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Operator
            </label>
            <select
              id="rule-operator"
              required
              value={operator}
              onChange={(e) => setOperator(e.target.value as AlertOperator)}
              className={inputClassName}
            >
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="rule-threshold"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Threshold
            </label>
            <input
              id="rule-threshold"
              type="number"
              required
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className={inputClassName}
              placeholder="30"
            />
          </div>

          {createError ? (
            <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{createError}</span>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending || !deviceId || threshold === ''
              }
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
