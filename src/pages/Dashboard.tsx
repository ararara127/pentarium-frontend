import { useDashboard } from '../hooks/useDashboard'
import { useTelemetry } from '../hooks/useTelemetry'
import { useAlerts } from '../hooks/useAlerts'
import { KPICard } from '../components/KPICard'
import { DeviceTable } from '../components/DeviceTable'
import { LineChartCard } from '../components/LineChartCard'
import { AlertPanel } from '../components/AlertPanel'
import { PageError, PageLoading } from '../components/PageState'
import { ApiError } from '../lib/api'

export function Dashboard() {
  const { data, isLoading, isError, error, isFetching } = useDashboard()
  const onlineDevice = data?.devices.find((device) => device.status === 'online')

  const telemetryQuery = useTelemetry(onlineDevice?.id, {
    limit: 30,
    refetchInterval: 10_000,
    enabled: Boolean(onlineDevice?.id),
  })

  const alertsQuery = useAlerts(10_000)

  if (isLoading) {
    return <PageLoading>Memuat dashboard…</PageLoading>
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError
        ? error.message
        : 'Gagal memuat data dashboard.'
    return <PageError>{message}</PageError>
  }

  const alerts = [...(alertsQuery.data ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          Auto-refresh setiap 10 detik
          {isFetching && !isLoading ? ' · memperbarui…' : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard title="Total Devices" value={data.totalDevices} tone="default" />
        <KPICard title="Online" value={data.online} tone="online" />
        <KPICard title="Offline" value={data.offline} tone="offline" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {!onlineDevice ? (
            <div className="flex h-full min-h-80 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--text-muted)] shadow-[var(--shadow)]">
              Belum ada device yang mengirim data
            </div>
          ) : telemetryQuery.isError ? (
            <div className="flex h-full min-h-80 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--offline)] shadow-[var(--shadow)]">
              {telemetryQuery.error instanceof ApiError
                ? telemetryQuery.error.message
                : 'Gagal memuat telemetri.'}
            </div>
          ) : (
            <LineChartCard
              data={telemetryQuery.data ?? []}
              title="Telemetri Terbaru"
              subtitle={onlineDevice.name}
              emptyMessage="Belum ada device yang mengirim data"
            />
          )}
        </div>
        <div className="xl:col-span-1">
          <AlertPanel alerts={alerts} limit={5} />
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Daftar Device</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Klik baris untuk melihat detail telemetri.
          </p>
        </div>
        <DeviceTable devices={data.devices} />
      </section>
    </div>
  )
}
