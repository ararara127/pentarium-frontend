import { type FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { PasswordInput } from '../components/PasswordInput'
import { api, ApiError } from '../lib/api'
import { isAuthenticated } from '../lib/auth'

export function Register() {
  const [tenantName, setTenantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registered, setRegistered] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: () => api.register({ email, password, tenantName }),
    onSuccess: () => {
      setRegistered(true)
      setResendMessage(null)
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => api.resendVerification(email),
    onSuccess: (data) => {
      setResendMessage(data.message || 'Email verifikasi telah dikirim ulang.')
    },
  })

  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    registerMutation.mutate()
  }

  const errorMessage = (() => {
    if (!registerMutation.error) return null
    if (registerMutation.error instanceof ApiError) {
      if (registerMutation.error.status === 409) {
        return registerMutation.error.message || 'Email sudah terdaftar.'
      }
      return registerMutation.error.message
    }
    return 'Registrasi gagal. Coba lagi.'
  })()

  const resendError =
    resendMutation.error instanceof ApiError
      ? resendMutation.error.message
      : resendMutation.error
        ? 'Gagal mengirim ulang email verifikasi.'
        : null

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand)]">
            Pentarium
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {registered ? 'Cek email kamu' : 'Buat akun tenant baru'}
          </p>
        </div>

        {registered ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand)]">
              <Mail size={24} />
            </div>
            <p className="text-sm leading-relaxed text-[var(--text)]">
              Registrasi berhasil. Kami sudah mengirim tautan verifikasi ke email
              kamu. Silakan cek inbox (dan folder spam).
            </p>
            <p className="text-xs text-[var(--text-muted)]">{email}</p>

            {resendMessage ? (
              <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--online)_30%,transparent)] bg-[color-mix(in_srgb,var(--online)_8%,transparent)] px-3 py-2.5 text-left text-sm text-[var(--online)]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>{resendMessage}</span>
              </div>
            ) : null}

            {resendError ? (
              <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-left text-sm text-[var(--offline)]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{resendError}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-light)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendMutation.isPending
                ? 'Mengirim…'
                : 'Kirim ulang email verifikasi'}
            </button>

            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Ke halaman Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="tenantName"
                  className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
                >
                  Nama Perusahaan
                </label>
                <input
                  id="tenantName"
                  type="text"
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]"
                  placeholder="PT Contoh Nusantara"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]"
                  placeholder="anda@perusahaan.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
                >
                  Password
                </label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {errorMessage ? (
                <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerMutation.isPending ? 'Mendaftar…' : 'Daftar'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
              >
                Masuk
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
