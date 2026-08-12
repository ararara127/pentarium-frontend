import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { TelemetryRange } from '../lib/types'

interface UseTelemetryOptions {
  limit?: number
  range?: TelemetryRange
  refetchInterval?: number | false
  enabled?: boolean
}

export function useTelemetry(
  deviceId: string | undefined,
  options: UseTelemetryOptions = {},
) {
  const {
    limit = 50,
    range,
    refetchInterval = 5_000,
    enabled = true,
  } = options

  return useQuery({
    queryKey: ['telemetry', deviceId, range ?? null, range ? null : limit],
    queryFn: () =>
      api.getTelemetry(deviceId!, range ? { range } : { limit }),
    enabled: Boolean(deviceId) && enabled,
    refetchInterval,
  })
}
