import { type InputHTMLAttributes, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const inputClassName =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-3.5 pr-10 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]'

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
>

export function PasswordInput({ id, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={className ? `${inputClassName} ${className}` : inputClassName}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--brand)]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
