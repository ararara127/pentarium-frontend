import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useWidgets(refetchInterval: number | false = 10_000) {
  return useQuery({
    queryKey: ['widgets'],
    queryFn: () => api.getWidgets(),
    refetchInterval,
  })
}
