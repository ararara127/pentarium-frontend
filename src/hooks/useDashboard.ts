import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
    refetchInterval: 10_000,
  })
}
