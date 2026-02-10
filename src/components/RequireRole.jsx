import { useAuth } from '../context/AuthContext'

/**
 * Renders children only when the current user has one of the allowed roles.
 * Role is read from user.user_metadata.role (client-side gated; no backend required).
 */
export function RequireRole({ role: allowedRoles, children }) {
  const { user } = useAuth()
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const userRole = user?.user_metadata?.role ?? 'user'
  const allowed = roles.includes(userRole)

  if (!allowed) return null
  return children
}
