import { useSearchParams } from 'react-router-dom'

/**
 * Simulated role from URL for UI-only behavior. No auth, no backend.
 * /hotels → user
 * /hotels?role=admin → admin
 */
export function useRole() {
  const [searchParams] = useSearchParams()
  const raw = searchParams.get('role') || 'user'
  return raw === 'admin' ? 'admin' : 'user'
}
