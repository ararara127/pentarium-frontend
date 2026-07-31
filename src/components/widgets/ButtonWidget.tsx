import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { api, ApiError } from '../../lib/api'
import type { Widget } from '../../lib/types'
import { WidgetShell } from './WidgetShell'

interface ButtonWidgetProps {
  widget: Widget
}

export function ButtonWidget({ widget }: ButtonWidgetProps) {
  const deviceId = widget.deviceId ?? ''
  const command = widget.config.command?.trim() ?? ''
  const [feedback, setFeedback] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => api.sendCommand(deviceId, { command }),
    onSuccess: (res) => setFeedback(res.message),
  })

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const notConfigured = !deviceId || !command
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Gagal mengirim perintah'
        : null

  return (
    <WidgetShell
      title={widget.title}
      subtitle={widget.device?.name ?? undefined}
      error={notConfigured ? 'Widget belum dikonfigurasi (device & perintah)' : null}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          {mutation.isPending ? 'Mengirim…' : widget.title || 'Kirim Perintah'}
        </button>

        <p className="text-xs text-[var(--text-muted)]">
          Perintah: <span className="font-mono font-semibold">{command}</span>
        </p>

        {feedback ? (
          <p className="flex items-center gap-1.5 text-center text-xs font-semibold text-[var(--online)]">
            <CheckCircle2 size={14} />
            {feedback}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="flex items-center gap-1.5 text-center text-xs font-semibold text-[var(--offline)]">
            <AlertCircle size={14} />
            {errorMessage}
          </p>
        ) : null}
      </div>
    </WidgetShell>
  )
}
