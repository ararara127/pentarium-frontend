import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { PasswordInput } from '../components/PasswordInput'
import { api, ApiError } from '../lib/api'
import { isAuthenticated, setToken } from '../lib/auth'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setToken(data.token)
      navigate('/', { replace: true })
    },
    onError: () => {
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
    setResendMessage(null)
    loginMutation.mutate({ email, password })
  }

  const needsVerification =
    loginMutation.error instanceof ApiError &&
    loginMutation.error.status === 403 &&
    Boolean(loginMutation.error.needVerification)

  const errorMessage = (() => {
    if (!loginMutation.error) return null
    if (needsVerification) return null
    if (loginMutation.error instanceof ApiError) {
      if (loginMutation.error.status === 401) {
        return 'Email atau password salah.'
      }
      return loginMutation.error.message
    }
    return 'Login gagal. Periksa email dan password.'
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
            Masuk ke dashboard IoT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {needsVerification ? (
            <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] px-3 py-3 text-sm text-[var(--warning)]">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="font-semibold text-[var(--text)]">
                  Email kamu belum diverifikasi.
                </span>
              </div>
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending || !email.trim()}
                className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-light)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendMutation.isPending
                  ? 'Mengirim…'
                  : 'Kirim ulang email verifikasi'}
              </button>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          {resendMessage ? (
            <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--online)_30%,transparent)] bg-[color-mix(in_srgb,var(--online)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--online)]">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          ) : null}

          {resendError ? (
            <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{resendError}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Masuk…' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-semibold text-[var(--brand)] hover:text-[var(--brand-dark)]"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
