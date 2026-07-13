export type DeviceStatus = 'online' | 'offline'

export interface Device {
  id: string
  name: string
  claimed: boolean
  lastSeenAt: string | null
  status: DeviceStatus
  claimCode?: string
  token?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterRequest {
  email: string
  password: string
  tenantName: string
}

export interface RegisterResponse {
  tenantId: string
  userId: string
  email: string
}

export interface DashboardResponse {
  totalDevices: number
  online: number
  offline: number
  devices: Device[]
}

export interface TelemetryData {
  suhu: number
  kelembapan: number
}

export interface TelemetryPoint {
  id: string
  deviceId: string
  ts: string
  data: TelemetryData
}

export interface CreateDeviceRequest {
  name: string
}

export interface ClaimDeviceRequest {
  claimCode: string
}

export type AlertMetric = 'suhu' | 'kelembapan'
export type AlertOperator = '>' | '<'

export interface Alert {
  id: string
  message: string
  value: number
  createdAt: string
  device: {
    name: string
  }
}

export interface AlertRule {
  id: string
  deviceId: string
  metric: AlertMetric
  operator: AlertOperator
  threshold: number
  device?: {
    id: string
    name: string
  }
}

export interface CreateAlertRuleRequest {
  deviceId: string
  metric: AlertMetric
  operator: AlertOperator
  threshold: number
}

