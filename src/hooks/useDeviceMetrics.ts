import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useDeviceMetrics(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['device-metrics', deviceId],
    queryFn: () => api.getDeviceMetrics(deviceId!),
    enabled: Boolean(deviceId),
  })
}
