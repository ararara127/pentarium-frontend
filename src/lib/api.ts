import { clearToken, getToken } from './auth'
import type {
  Alert,
  AlertRule,
  ClaimDeviceRequest,
  CreateAlertRuleRequest,
  CreateDeviceRequest,
  CreateWidgetRequest,
  DashboardResponse,
  Device,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ReorderWidgetsRequest,
  SendCommandRequest,
  SendCommandResponse,
  TelemetryPoint,
  UpdateWidgetRequest,
  Widget,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  status: number
  needVerification?: boolean

  constructor(message: string, status: number, needVerification?: boolean) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.needVerification = needVerification
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
    const currentPath = window.location.pathname
    if (
      currentPath !== '/login' &&
      currentPath !== '/register' &&
      currentPath !== '/verify-email'
    ) {
      window.location.assign('/login')
    }
    throw new ApiError('Unauthorized', 401)
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    let needVerification = false
    try {
      const body = (await response.json()) as {
        message?: string
        error?: string
        needVerification?: boolean
      }
      message = body.message ?? body.error ?? message
      needVerification = Boolean(body.needVerification)
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status, needVerification)
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

  verifyEmail(token: string) {
    return request<MessageResponse>(
      '/api/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      },
      false,
    )
  },

  resendVerification(email: string) {
    return request<MessageResponse>(
      '/api/auth/resend-verification',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
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

  getDeviceMetrics(deviceId: string) {
    return request<string[]>(
      `/api/devices/${encodeURIComponent(deviceId)}/metrics`,
    )
  },

  getWidgets() {
    return request<Widget[]>('/api/widgets')
  },

  createWidget(body: CreateWidgetRequest) {
    return request<Widget>('/api/widgets', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  updateWidget(id: string, body: UpdateWidgetRequest) {
    return request<Widget>(`/api/widgets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  reorderWidgets(body: ReorderWidgetsRequest) {
    return request<Widget[]>('/api/widgets/reorder', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },

  deleteWidget(id: string) {
    return request<void>(`/api/widgets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  sendCommand(deviceId: string, body: SendCommandRequest) {
    return request<SendCommandResponse>(
      `/api/devices/${encodeURIComponent(deviceId)}/command`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    )
  },
}
