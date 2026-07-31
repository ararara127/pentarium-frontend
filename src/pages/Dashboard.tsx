import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, LayoutGrid, Plus } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { useWidgets } from '../hooks/useWidgets'
import { useAlerts } from '../hooks/useAlerts'
import { KPICard } from '../components/KPICard'
import { DeviceTable } from '../components/DeviceTable'
import { AlertPanel } from '../components/AlertPanel'
import { WidgetGrid } from '../components/widgets/WidgetGrid'
import { WidgetFormModal } from '../components/widgets/WidgetFormModal'
import { PageError, PageLoading } from '../components/PageState'
import { api, ApiError } from '../lib/api'
import type { Widget } from '../lib/types'

export function Dashboard() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, isFetching } = useDashboard()
  const widgetsQuery = useWidgets(10_000)
  const alertsQuery = useAlerts(10_000)

  const [editMode, setEditMode] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)

  const widgets = useMemo(() => {
    const list = [...(widgetsQuery.data ?? [])]
    return list.sort((a, b) => a.position - b.position)
  }, [widgetsQuery.data])

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => api.reorderWidgets({ ids }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, width }: { id: string; width: Widget['width'] }) =>
      api.updateWidget(id, { width }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteWidget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })

  function moveWidget(id: string, direction: -1 | 1) {
    const index = widgets.findIndex((item) => item.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= widgets.length) return

    const next = [...widgets]
    const [item] = next.splice(index, 1)
    if (!item) return
    next.splice(target, 0, item)
    reorderMutation.mutate(next.map((w) => w.id))
  }

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          Auto-refresh setiap 10 detik
          {isFetching && !isLoading ? ' · memperbarui…' : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg)]"
            >
              <Check size={16} className="text-[var(--online)]" />
              Selesai
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--brand-light)] hover:text-[var(--brand)]"
            >
              <LayoutGrid size={16} />
              Kelola Widget
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditingWidget(null)
              setFormOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <Plus size={16} />
            Tambah Widget
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard title="Total Devices" value={data.totalDevices} tone="default" />
        <KPICard title="Online" value={data.online} tone="online" />
        <KPICard title="Offline" value={data.offline} tone="offline" />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Custom Dashboard</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Susun widget chart, gauge, stat, dan catatan sesuai kebutuhan.
          </p>
        </div>

        {widgetsQuery.isLoading ? (
          <PageLoading>Memuat widget…</PageLoading>
        ) : widgetsQuery.isError ? (
          <PageError>
            {widgetsQuery.error instanceof ApiError
              ? widgetsQuery.error.message
              : 'Gagal memuat widget.'}
          </PageError>
        ) : (
          <WidgetGrid
            widgets={widgets}
            editMode={editMode}
            onMoveUp={(id) => moveWidget(id, -1)}
            onMoveDown={(id) => moveWidget(id, 1)}
            onToggleWidth={(widget) =>
              updateMutation.mutate({
                id: widget.id,
                width: widget.width === 'full' ? 'half' : 'full',
              })
            }
            onEdit={(widget) => {
              setEditingWidget(widget)
              setFormOpen(true)
            }}
            onDelete={(widget) => {
              if (window.confirm(`Hapus widget "${widget.title}"?`)) {
                deleteMutation.mutate(widget.id)
              }
            }}
          />
        )}
      </section>

      <section>
        <AlertPanel alerts={alerts} limit={5} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Daftar Device</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Klik baris untuk melihat detail telemetri.
          </p>
        </div>
        <DeviceTable devices={data.devices} />
      </section>

      <WidgetFormModal
        open={formOpen}
        widget={editingWidget}
        onClose={() => {
          setFormOpen(false)
          setEditingWidget(null)
        }}
      />
    </div>
  )
}
