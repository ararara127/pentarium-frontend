import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { api, ApiError } from '../lib/api'

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const verifyQuery = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => api.verifyEmail(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const status: 'missing' | 'loading' | 'success' | 'error' = !token
    ? 'missing'
    : verifyQuery.isPending
      ? 'loading'
      : verifyQuery.isSuccess
        ? 'success'
        : 'error'

  const errorMessage =
    verifyQuery.error instanceof ApiError
      ? verifyQuery.error.message
      : verifyQuery.error
        ? 'Verifikasi gagal. Token mungkin tidak valid atau sudah kedaluwarsa.'
        : 'Token verifikasi tidak ditemukan.'

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand)]">
            Pentarium
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Verifikasi email
          </p>
        </div>

        <div className="space-y-4 text-center">
          {status === 'loading' ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand)]">
                <LoaderCircle size={24} className="animate-spin" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Memverifikasi...
              </p>
            </>
          ) : null}

          {status === 'success' ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--online)_12%,transparent)] text-[var(--online)]">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-base font-bold text-[var(--text)]">
                Email berhasil diverifikasi!
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Akun kamu sudah siap digunakan.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]"
              >
                Lanjut ke Login
              </Link>
            </>
          ) : null}

          {status === 'error' || status === 'missing' ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--offline)_12%,transparent)] text-[var(--offline)]">
                <AlertCircle size={28} />
              </div>
              <p className="text-base font-bold text-[var(--text)]">
                Verifikasi gagal
              </p>
              <p className="text-sm text-[var(--text-muted)]">{errorMessage}</p>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg)]"
              >
                Kembali ke Login
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
