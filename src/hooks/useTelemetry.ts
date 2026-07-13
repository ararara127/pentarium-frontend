import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface UseTelemetryOptions {
  limit?: number
  refetchInterval?: number | false
  enabled?: boolean
}

export function useTelemetry(
  deviceId: string | undefined,
  options: UseTelemetryOptions = {},
) {
  const {
    limit = 50,
    refetchInterval = 5_000,
    enabled = true,
  } = options

  return useQuery({
    queryKey: ['telemetry', deviceId, limit],
    queryFn: () => api.getTelemetry(deviceId!, limit),
    enabled: Boolean(deviceId) && enabled,
    refetchInterval,
  })
}
