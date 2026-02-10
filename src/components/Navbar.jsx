import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { user, role, signOut, isAuthenticated } = useAuth()
  const { selected, canCompare } = useCompare()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = user?.user_metadata?.name || 'User'
  const initial = (displayName || 'U').charAt(0).toUpperCase()

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            OTELIER-WEB
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated && (
              <>
                <Link
                  to="/"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                {selected.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/?compare=open')}
                    className={`text-sm font-medium transition-colors ${canCompare ? 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    Compare {selected.length}
                  </button>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <div
                    className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-medium shrink-0"
                    aria-hidden
                  >
                    {initial}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Hi, {displayName}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none ${
                      role === 'admin'
                        ? 'bg-amber-400 dark:bg-amber-500 text-amber-950 dark:text-amber-950'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                    }`}
                    aria-label={`Role: ${role === 'admin' ? 'Admin' : 'User'}`}
                  >
                    {role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
