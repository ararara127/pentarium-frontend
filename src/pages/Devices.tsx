import { type FormEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Check, Copy, Plus, QrCode } from 'lucide-react'
import { useDevices } from '../hooks/useDevices'
import { DeviceTable } from '../components/DeviceTable'
import { Modal } from '../components/Modal'
import { PageError, PageLoading } from '../components/PageState'
import { api, ApiError } from '../lib/api'
import { copyTextToClipboard } from '../lib/clipboard'
import type { Device } from '../lib/types'

type ModalMode = 'create' | 'claim' | null

export function Devices() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, isFetching } = useDevices()
  const [modal, setModal] = useState<ModalMode>(null)
  const [name, setName] = useState('')
  const [claimCode, setClaimCode] = useState('')
  const [createdDevice, setCreatedDevice] = useState<Device | null>(null)
  const [copiedField, setCopiedField] = useState<'claimCode' | 'token' | null>(null)

  const createMutation = useMutation({
    mutationFn: () => api.createDevice({ name: name.trim() }),
    onSuccess: (device) => {
      setCreatedDevice(device)
      void queryClient.invalidateQueries({ queryKey: ['devices'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const claimMutation = useMutation({
    mutationFn: () => api.claimDevice({ claimCode: claimCode.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['devices'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      closeModal()
    },
  })

  function closeModal() {
    setModal(null)
    setName('')
    setClaimCode('')
    setCreatedDevice(null)
    setCopiedField(null)
    createMutation.reset()
    claimMutation.reset()
  }

  function openCreate() {
    closeModal()
    setModal('create')
  }

  function openClaim() {
    closeModal()
    setModal('claim')
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createMutation.mutate()
  }

  function handleClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    claimMutation.mutate()
  }

  async function copyValue(value: string, field: 'claimCode' | 'token') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = value
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
  
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
  
        document.execCommand("copy")
  
        document.body.removeChild(textarea)
      }
  
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 1500)
    } catch (err) {
      console.error(err)
      alert("Copy gagal")
    }
  }

  if (isLoading) {
    return <PageLoading>Memuat devices…</PageLoading>
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError ? error.message : 'Gagal memuat daftar device.'
    return <PageError>{message}</PageError>
  }

  const createError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? 'Gagal menambah device.'
        : null

  const claimError =
    claimMutation.error instanceof ApiError
      ? claimMutation.error.message
      : claimMutation.error
        ? 'Gagal klaim device.'
        : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {data.length} device terdaftar
          {isFetching && !isLoading ? ' · memperbarui…' : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <Plus size={16} />
            Tambah Device
          </button>
          <button
            type="button"
            onClick={openClaim}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--brand-light)] hover:text-[var(--brand)]"
          >
            <QrCode size={16} />
            Klaim Device
          </button>
        </div>
      </div>

      <DeviceTable devices={data} />

      <Modal
        open={modal === 'create'}
        title={createdDevice ? 'Device berhasil dibuat' : 'Tambah Device'}
        onClose={closeModal}
      >
        {createdDevice ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              Simpan claim code dan token di bawah. Token biasanya hanya
              ditampilkan sekali.
            </p>
            <SecretField
              label="Claim code"
              value={createdDevice.claimCode ?? ''}
              copied={copiedField === 'claimCode'}
              onCopy={() =>
                void copyValue(createdDevice.claimCode ?? '', 'claimCode')
              }
            />
            <SecretField
              label="Device token"
              value={createdDevice.token ?? ''}
              copied={copiedField === 'token'}
              onCopy={() => void copyValue(createdDevice.token ?? '', 'token')}
            />
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="device-name"
                className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
              >
                Nama
              </label>
              <input
                id="device-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]"
                placeholder="Sensor Gudang A"
                autoFocus
              />
            </div>
            {createError ? (
              <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{createError}</span>
              </div>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !name.trim()}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={modal === 'claim'} title="Klaim Device" onClose={closeModal}>
        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label
              htmlFor="claim-code"
              className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
            >
              Claim code
            </label>
            <input
              id="claim-code"
              type="text"
              required
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-light)]"
              placeholder="Masukkan claim code"
              autoFocus
            />
          </div>
          {claimError ? (
            <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--offline)_30%,transparent)] bg-[color-mix(in_srgb,var(--offline)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--offline)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{claimError}</span>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg)]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={claimMutation.isPending || !claimCode.trim()}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claimMutation.isPending ? 'Mengklaim…' : 'Klaim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function SecretField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-mono text-xs text-[var(--text)]">
          {value || '—'}
        </code>
        <button
          type="button"
          onClick={() => {
            console.log('[copy] SecretField button clicked', {
              label,
              disabled: !value,
              hasValue: Boolean(value),
            })
            onCopy()
          }}
          disabled={!value}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--brand-light)] hover:text-[var(--brand)] disabled:opacity-50"
          aria-label={`Salin ${label}`}
        >
          {copied ? <Check size={16} className="text-[var(--online)]" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}
