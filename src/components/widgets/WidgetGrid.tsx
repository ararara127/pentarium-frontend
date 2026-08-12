import {
  ArrowDown,
  ArrowUp,
  Columns2,
  Pencil,
  Square,
  Trash2,
} from 'lucide-react'
import type { Widget } from '../../lib/types'
import { ButtonWidget } from './ButtonWidget'
import { ChartWidget } from './ChartWidget'
import { GaugeWidget } from './GaugeWidget'
import { StatWidget } from './StatWidget'
import { TextWidget } from './TextWidget'

interface WidgetGridProps {
  widgets: Widget[]
  editMode: boolean
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onToggleWidth: (widget: Widget) => void
  onEdit: (widget: Widget) => void
  onDelete: (widget: Widget) => void
}

function renderWidget(widget: Widget) {
  switch (widget.type) {
    case 'chart':
      return <ChartWidget widget={widget} />
    case 'gauge':
      return <GaugeWidget widget={widget} />
    case 'stat':
      return <StatWidget widget={widget} />
    case 'text':
      return <TextWidget widget={widget} />
    case 'button':
      return <ButtonWidget widget={widget} />
    default:
      return null
  }
}

export function WidgetGrid({
  widgets,
  editMode,
  onMoveUp,
  onMoveDown,
  onToggleWidth,
  onEdit,
  onDelete,
}: WidgetGridProps) {
  if (widgets.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--text-muted)] shadow-[var(--shadow)]">
        Belum ada widget. Klik Tambah Widget untuk mulai menyusun dashboard.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
      {widgets.map((widget, index) => (
        <div
          key={widget.id}
          className={`relative min-w-0 ${widget.width === 'full' ? 'md:col-span-2' : 'md:col-span-1'}`}
        >
          {editMode ? (
            <div className="absolute right-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)] md:right-3 md:top-3">
              <button
                type="button"
                title="Pindah atas"
                disabled={index === 0}
                onClick={() => onMoveUp(widget.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-40"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                title="Pindah bawah"
                disabled={index === widgets.length - 1}
                onClick={() => onMoveDown(widget.id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-40"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                title={widget.width === 'full' ? 'Jadikan setengah' : 'Jadikan penuh'}
                onClick={() => onToggleWidth(widget)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]"
              >
                {widget.width === 'full' ? <Columns2 size={15} /> : <Square size={15} />}
              </button>
              <button
                type="button"
                title="Edit"
                onClick={() => onEdit(widget)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brand)] transition hover:bg-[var(--brand-light)]"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                title="Hapus"
                onClick={() => onDelete(widget)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--offline)] transition hover:bg-[color-mix(in_srgb,var(--offline)_8%,transparent)]"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ) : null}
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  )
}
