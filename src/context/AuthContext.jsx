import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../auth/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name) => {
    setError(null)
    const { data, error: e } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || undefined,
          role: 'user',
        },
      },
    })
    if (e) {
      setError(e.message)
      return { error: e.message }
    }
    return { data }
  }

  const signIn = async (email, password) => {
    setError(null)
    const { data, error: e } = await supabase.auth.signInWithPassword({ email, password })
    if (e) {
      setError(e.message)
      return { error: e.message }
    }
    return { data }
  }

  const signOut = async () => {
    setError(null)
    await supabase.auth.signOut()
  }

  // Role from Supabase user_metadata. Updated on initial load and on auth state change. Default 'user'; set admin in Supabase Dashboard (user_metadata.role = "admin").
  const role = session?.user?.user_metadata?.role || user?.user_metadata?.role || 'user'

  const value = {
    user,
    session,
    loading,
    error,
    setError,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    token: session?.access_token ?? null,
    role,
    isAdmin: role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
