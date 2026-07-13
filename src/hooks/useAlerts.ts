import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useAlerts(refetchInterval: number | false = 10_000) {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
    refetchInterval,
  })
}
