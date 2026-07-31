import type { Widget } from '../../lib/types'
import { WidgetShell } from './WidgetShell'

interface TextWidgetProps {
  widget: Widget
}

export function TextWidget({ widget }: TextWidgetProps) {
  const content = widget.config.content?.trim()

  return (
    <WidgetShell
      title={widget.title}
      empty={!content ? 'Belum ada teks' : null}
    >
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">
        {content}
      </p>
    </WidgetShell>
  )
}
