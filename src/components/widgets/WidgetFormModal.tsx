import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertCircle,
  Gauge,
  Hash,
  LayoutTemplate,
  MousePointerClick,
  Type,
} from 'lucide-react'
import { Modal } from '../Modal'
import { useDevices } from '../../hooks/useDevices'
import { useDeviceMetrics } from '../../hooks/useDeviceMetrics'
import { api, ApiError } from '../../lib/api'
import type {
  CreateWidgetRequest,
  UpdateWidgetRequest,
  Widget,
  WidgetType,
  WidgetWidth,
} from '../../lib/types'

const inputClassName =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]'

const widgetTypes: Array<{
  type: WidgetType
  label: string
  description: string
  icon: typeof Activity
}> = [
  {
    type: 'chart',
    label: 'Chart',
    description: 'Grafik garis telemetri',
    icon: Activity,
  },
  {
    type: 'gauge',
    label: 'Gauge',
    description: 'Indikator rentang nilai',
    icon: Gauge,
  },
  {
    type: 'stat',
    label: 'Stat',
    description: 'Angka besar nilai terbaru',
    icon: Hash,
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Catatan bebas',
    icon: Type,
  },
  {
    type: 'button',
    label: 'Button',
    description: 'Kirim perintah ke device',
    icon: MousePointerClick,
  },
]

interface MetricDefaults {
  unit: string
  min: number
  max: number
}

const METRIC_DEFAULTS: Array<{ keys: string[]; defaults: MetricDefaults }> = [
  { keys: ['suhu', 'temperature'], defaults: { unit: '°C', min: 0, max: 50 } },
  { keys: ['kelembapan', 'humidity'], defaults: { unit: '%', min: 0, max: 100 } },
  { keys: ['ph'], defaults: { unit: 'pH', min: 0, max: 14 } },
  { keys: ['tekanan', 'pressure'], defaults: { unit: 'hPa', min: 900, max: 1100 } },
  { keys: ['level'], defaults: { unit: '%', min: 0, max: 100 } },
  { keys: ['tds'], defaults: { unit: 'ppm', min: 0, max: 1000 } },
  { keys: ['pompa', 'relay', 'status'], defaults: { unit: '', min: 0, max: 1 } },
]

function getMetricDefaults(metricName: string): MetricDefaults {
  const key = metricName.trim().toLowerCase()
  if (!key) return { unit: '', min: 0, max: 100 }

  for (const entry of METRIC_DEFAULTS) {
    if (entry.keys.some((alias) => key === alias || key.includes(alias))) {
      return entry.defaults
    }
  }

  return { unit: '', min: 0, max: 100 }
}

interface WidgetFormModalProps {
  open: boolean
  widget?: Widget | null
  onClose: () => void
}

function sortDevicesOnlineFirst<T extends { status: string; name: string }>(
  devices: T[],
): T[] {
  return [...devices].sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name)
    return a.status === 'online' ? -1 : 1
  })
}

export function WidgetFormModal({ open, widget, onClose }: WidgetFormModalProps) {
  const queryClient = useQueryClient()
  const devicesQuery = useDevices()
  const isEdit = Boolean(widget)

  const [type, setType] = useState<WidgetType>('chart')
  const [title, setTitle] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [metric, setMetric] = useState('')
  const [width, setWidth] = useState<WidgetWidth>('half')
  const [min, setMin] = useState('0')
  const [max, setMax] = useState('100')
  const [unit, setUnit] = useState('')
  const [limit, setLimit] = useState('50')
  const [content, setContent] = useState('')
  const [command, setCommand] = useState('')
  const [unitTouched, setUnitTouched] = useState(false)
  const [rangeTouched, setRangeTouched] = useState(false)

  const needsDevice = type !== 'text'
  const needsMetric = type === 'chart' || type === 'gauge' || type === 'stat'
  const metricsQuery = useDeviceMetrics(needsMetric ? deviceId || undefined : undefined)

  const sortedDevices = useMemo(
    () => sortDevicesOnlineFirst(devicesQuery.data ?? []),
    [devicesQuery.data],
  )

  useEffect(() => {
    if (!open) return

    if (widget) {
      setType(widget.type)
      setTitle(widget.title)
      setDeviceId(widget.deviceId ?? '')
      setMetric(widget.metric ?? '')
      setWidth(widget.width)
      setMin(String(widget.config.min ?? 0))
      setMax(String(widget.config.max ?? 100))
      setUnit(widget.config.unit ?? '')
      setLimit(String(widget.config.limit ?? 50))
      setContent(widget.config.content ?? '')
      setCommand(widget.config.command ?? '')
      // Preserve saved values when editing; don't auto-overwrite from metric map
      setUnitTouched(true)
      setRangeTouched(true)
    } else {
      setType('chart')
      setTitle('')
      setDeviceId('')
      setMetric('')
      setWidth('half')
      setMin('0')
      setMax('100')
      setUnit('')
      setLimit('50')
      setContent('')
      setCommand('')
      setUnitTouched(false)
      setRangeTouched(false)
    }
  }, [open, widget])

  useEffect(() => {
    if (!needsMetric) return
    const metrics = metricsQuery.data
    if (!metrics || metrics.length === 0) {
      if (!isEdit) setMetric('')
      return
    }
    if (!metrics.includes(metric)) {
      setMetric(metrics[0] ?? '')
    }
  }, [metricsQuery.data, needsMetric, metric, isEdit])

  useEffect(() => {
    if (!metric || (type !== 'gauge' && type !== 'stat')) return

    const defaults = getMetricDefaults(metric)
    if (!unitTouched) {
      setUnit(defaults.unit)
    }
    if (type === 'gauge' && !rangeTouched) {
      setMin(String(defaults.min))
      setMax(String(defaults.max))
    }
  }, [metric, type, unitTouched, rangeTouched])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const config =
        type === 'gauge'
          ? {
              min: Number(min),
              max: Number(max),
              unit: unit.trim() || undefined,
            }
          : type === 'chart'
            ? { limit: Number(limit) || 50 }
            : type === 'stat'
              ? { unit: unit.trim() || undefined }
              : type === 'text'
                ? { content }
                : type === 'button'
                  ? { command: command.trim() }
                  : {}

      if (isEdit && widget) {
        const body: UpdateWidgetRequest = {
          title: title.trim(),
          width,
          config,
        }
        if (needsDevice) {
          body.deviceId = deviceId
        }
        if (needsMetric) {
          body.metric = metric
        }
        return api.updateWidget(widget.id, body)
      }

      const body: CreateWidgetRequest = {
        type,
        title: title.trim(),
        width,
        config,
      }
      if (needsDevice) {
        body.deviceId = deviceId
      }
      if (needsMetric) {
        body.metric = metric
      }
      return api.createWidget(body)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['widgets'] })
      onClose()
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveMutation.mutate()
  }

  const errorMessage =
    saveMutation.error instanceof ApiError
      ? saveMutation.error.message
      : saveMutation.error
        ? 'Gagal menyimpan widget.'
        : null

  const metrics = metricsQuery.data ?? []
  const metricsEmpty =
    needsMetric &&
    Boolean(deviceId) &&
    !metricsQuery.isLoading &&
    !metricsQuery.isError &&
    metrics.length === 0

  const submitDisabled =
    saveMutation.isPending ||
    !title.trim() ||
    (needsDevice && !deviceId) ||
    (needsMetric && (!metric || metricsEmpty)) ||
    (type === 'button' && !command.trim()) ||
    (type === 'text' && !content.trim())

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit Widget' : 'Tambah Widget'}
      onClose={onClose}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
        {!isEdit ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text)]">Jenis widget</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {widgetTypes.map(({ type: itemType, label, description, icon: Icon }) => {
                const selected = type === itemType
                return (
                  <button
                    key={itemType}
                    type="button"
                    onClick={() => setType(itemType)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-[var(--brand)] bg-[var(--brand-light)]'
                        : 'border-[var(--border)] hover:bg-[var(--bg)]'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={selected ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}
                    />
                    <p className="mt-2 text-sm font-bold text-[var(--text)]">{label}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-muted)]">
            <LayoutTemplate size={16} className="text-[var(--brand)]" />
            Jenis: <span className="font-semibold capitalize text-[var(--text)]">{type}</span>
          </div>
        )}

        <div>
          <label htmlFor="widget-title" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
            Judul
          </label>
          <input
            id="widget-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClassName}
            placeholder="Contoh: Suhu Greenhouse"
          />
        </div>

        {needsDevice ? (
          <div>
            <label
              htmlFor="widget-device"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Device
            </label>
            <select
              id="widget-device"
              required
              value={deviceId}
              onChange={(e) => {
                setDeviceId(e.target.value)
                if (needsMetric) setMetric('')
              }}
              className={inputClassName}
            >
              <option value="" disabled>
                Pilih device
              </option>
              {sortedDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} - {device.status}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {needsMetric ? (
          <div>
            <label
              htmlFor="widget-metric"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Metric
            </label>
            <select
              id="widget-metric"
              required
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              disabled={!deviceId || metricsQuery.isLoading || metrics.length === 0}
              className={inputClassName}
            >
              <option value="" disabled>
                {metricsQuery.isLoading ? 'Memuat metric…' : 'Pilih metric'}
              </option>
              {metrics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {metricsEmpty ? (
              <p className="mt-1.5 text-xs text-[var(--warning)]">
                Device ini belum pernah mengirim data
              </p>
            ) : null}
          </div>
        ) : null}

        {type === 'gauge' ? (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="widget-min" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                Min
              </label>
              <input
                id="widget-min"
                type="number"
                required
                value={min}
                onChange={(e) => {
                  setRangeTouched(true)
                  setMin(e.target.value)
                }}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="widget-max" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                Max
              </label>
              <input
                id="widget-max"
                type="number"
                required
                value={max}
                onChange={(e) => {
                  setRangeTouched(true)
                  setMax(e.target.value)
                }}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="widget-unit" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
                Satuan
              </label>
              <input
                id="widget-unit"
                list="unit-options"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value)
                  setUnitTouched(true)
                }}
                className={inputClassName}
                placeholder="°C"
              />
            </div>
          </div>
        ) : null}

        {type === 'stat' ? (
          <div>
            <label htmlFor="widget-stat-unit" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
              Satuan (opsional)
            </label>
            <input
              id="widget-stat-unit"
              list="unit-options"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value)
                setUnitTouched(true)
              }}
              className={inputClassName}
              placeholder="°C"
            />
          </div>
        ) : null}

        {type === 'chart' ? (
          <div>
            <label htmlFor="widget-limit" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
              Jumlah data (limit)
            </label>
            <input
              id="widget-limit"
              type="number"
              min={5}
              max={200}
              required
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className={inputClassName}
            />
          </div>
        ) : null}

        {type === 'text' ? (
          <div>
            <label htmlFor="widget-content" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
              Isi teks
            </label>
            <textarea
              id="widget-content"
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputClassName}
              placeholder="Catatan untuk dashboard…"
            />
          </div>
        ) : null}

        {type === 'button' ? (
          <div>
            <label htmlFor="widget-command" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
              Perintah
            </label>
            <input
              id="widget-command"
              required
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className={inputClassName}
              placeholder="Contoh: pompa_on"
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Perintah ini dikirim ke device lewat MQTT. Device harus mendukung perintah tersebut.
            </p>
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 text-sm font-semibold text-[var(--text)]">Lebar</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWidth('half')}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                width === 'half'
                  ? 'border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]'
              }`}
            >
              Setengah
            </button>
            <button
              type="button"
              onClick={() => setWidth('full')}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                width === 'full'
                  ? 'border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]'
              }`}
            >
              Penuh
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <datalist id="unit-options">
          <option value="°C" />
          <option value="%" />
          <option value="pH" />
          <option value="ppm" />
          <option value="hPa" />
          <option value="lux" />
          <option value="V" />
          <option value="A" />
          <option value="cm" />
          <option value="L" />
          <option value="ON/OFF" />
        </datalist>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
