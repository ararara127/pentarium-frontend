import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { isAuthenticated, setToken } from '../lib/auth'

export function Register() {
  const navigate = useNavigate()
  const [tenantName, setTenantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const registerMutation = useMutation({
    mutationFn: async () => {
      await api.register({ email, password, tenantName })
      return api.login({ email, password })
    },
    onSuccess: (data) => {
      setToken(data.token)
      navigate('/', { replace: true })
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

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand)]">
            Pentarium
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Buat akun tenant baru
          </p>
        </div>

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
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]"
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
      </div>
    </div>
  )
}
