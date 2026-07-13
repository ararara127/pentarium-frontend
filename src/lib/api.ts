import { clearToken, getToken } from './auth'
import type {
  Alert,
  AlertRule,
  ClaimDeviceRequest,
  CreateAlertRuleRequest,
  CreateDeviceRequest,
  DashboardResponse,
  Device,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TelemetryPoint,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearToken()
    const path = window.location.pathname
    if (path !== '/login' && path !== '/register') {
      window.location.assign('/login')
    }
    throw new ApiError('Unauthorized', 401)
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string; error?: string }
      message = body.message ?? body.error ?? message
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  login(body: LoginRequest) {
    return request<LoginResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      false,
    )
  },

  register(body: RegisterRequest) {
    return request<RegisterResponse>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      false,
    )
  },

  getDashboard() {
    return request<DashboardResponse>('/api/dashboard')
  },

  getDevices() {
    return request<Device[]>('/api/devices')
  },

  createDevice(body: CreateDeviceRequest) {
    return request<Device>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  claimDevice(body: ClaimDeviceRequest) {
    return request<Device>('/api/devices/claim', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  getTelemetry(deviceId: string, limit = 50) {
    return request<TelemetryPoint[]>(
      `/api/telemetry/${encodeURIComponent(deviceId)}?limit=${limit}`,
    )
  },

  getAlerts() {
    return request<Alert[]>('/api/alerts')
  },

  getAlertRules() {
    return request<AlertRule[]>('/api/alerts/rules')
  },

  createAlertRule(body: CreateAlertRuleRequest) {
    return request<AlertRule>('/api/alerts/rules', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  deleteAlertRule(id: string) {
    return request<void>(`/api/alerts/rules/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}
