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
  message?: string
  tenantId?: string
  userId?: string
  email?: string
}

export interface MessageResponse {
  message: string
}

export interface DashboardResponse {
  totalDevices: number
  online: number
  offline: number
  devices: Device[]
}

export type TelemetryData = Record<string, number>

export interface TelemetryPoint {
  id: string
  ts: string
  data: TelemetryData
}

export type TelemetryRange = '15m' | '1h' | '24h' | '7d'

export type WidgetType = 'chart' | 'gauge' | 'stat' | 'text' | 'button'
export type WidgetWidth = 'half' | 'full'

export interface WidgetConfig {
  min?: number
  max?: number
  unit?: string
  limit?: number
  range?: TelemetryRange
  content?: string
  command?: string
}

export interface SendCommandRequest {
  command: string
  value?: string | number | null
}

export interface SendCommandResponse {
  message: string
}

export interface Widget {
  id: string
  type: WidgetType
  title: string
  deviceId: string | null
  metric: string | null
  config: WidgetConfig
  width: WidgetWidth
  position: number
  device?: {
    name: string
  } | null
}

export interface CreateWidgetRequest {
  type: WidgetType
  title: string
  deviceId?: string | null
  metric?: string | null
  config?: WidgetConfig
  width: WidgetWidth
}

export interface UpdateWidgetRequest {
  title?: string
  metric?: string | null
  config?: WidgetConfig
  width?: WidgetWidth
  deviceId?: string | null
}

export interface ReorderWidgetsRequest {
  ids: string[]
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

