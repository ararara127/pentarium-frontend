import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useAlertRules() {
  return useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => api.getAlertRules(),
  })
}
