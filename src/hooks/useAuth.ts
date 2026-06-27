import { useEffect, useMemo, useState } from 'react'
import {
  clearStoredSession,
  completeOAuthSession,
  getStoredSession,
  isSupabaseConfigured,
  parseOAuthHash,
  refreshSession,
  requestPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  storeSession,
  type SupabaseSession,
} from '../lib/supabase'

export type AuthMode = 'sign-in' | 'sign-up' | 'reset'
export type AppRole = 'owner' | 'admin' | 'approver' | 'viewer'

function getOAuthQueryError() {
  return new URLSearchParams(window.location.search).get('error_description') ?? ''
}

export function useAuth() {
  const [session, setSession] = useState<SupabaseSession | null>(() => getStoredSession())
  const [authError, setAuthError] = useState(getOAuthQueryError)
  const [authMessage, setAuthMessage] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(parseOAuthHash()))

  useEffect(() => {
    if (getOAuthQueryError()) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const oauthSession = parseOAuthHash()
    if (!oauthSession) return

    let mounted = true

    completeOAuthSession(oauthSession).then(({ data, error }) => {
      if (!mounted) return
      setIsAuthLoading(false)

      if (error) {
        setAuthError(error.message)
        return
      }

      if (data) {
        storeSession(data)
        setSession(data)
      }
    })

    window.history.replaceState({}, document.title, window.location.pathname)

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!session?.refresh_token) return

    const nowSeconds = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at - nowSeconds > 120) return

    refreshSession(session.refresh_token).then(({ data }) => {
      if (!data) return
      storeSession(data)
      setSession(data)
    })
  }, [session])

  const userName = useMemo(() => {
    const metadataName = session?.user.user_metadata?.full_name
    if (typeof metadataName === 'string' && metadataName.trim()) return metadataName
    return session?.user.email?.split('@')[0] ?? 'User'
  }, [session])

  const role = useMemo<AppRole>(() => {
    const metadataRole = session?.user.user_metadata?.role
    if (metadataRole === 'owner' || metadataRole === 'admin' || metadataRole === 'approver' || metadataRole === 'viewer') {
      return metadataRole
    }

    return 'admin'
  }, [session])

  const permissions = useMemo(
    () => ({
      canManageEmployees: role === 'owner' || role === 'admin',
      canManagePayroll: role === 'owner' || role === 'admin',
      canApprovePayroll: role === 'owner' || role === 'admin' || role === 'approver',
      canManageSettings: role === 'owner' || role === 'admin',
      canExport: role !== 'viewer',
    }),
    [role],
  )

  async function submitAuth(mode: AuthMode, form: { email: string; password: string; fullName: string }) {
    setAuthError('')
    setAuthMessage('')

    if (!isSupabaseConfigured) {
      setAuthError('Add real Supabase values to .env before signing in.')
      return
    }

    setIsAuthLoading(true)

    const result =
      mode === 'sign-in'
        ? await signInWithPassword(form.email, form.password)
        : mode === 'sign-up'
          ? await signUpWithPassword(form.email, form.password, form.fullName)
          : await requestPasswordReset(form.email)

    setIsAuthLoading(false)

    if (result.error) {
      setAuthError(result.error.message)
      return
    }

    if (mode === 'reset') {
      setAuthMessage('Password reset email requested. Check the inbox configured for this Supabase project.')
      return
    }

    if (result.data && 'access_token' in result.data) {
      storeSession(result.data)
      setSession(result.data)
      return
    }

    setAuthMessage('Account created. Confirm the email address if your Supabase project requires verification.')
  }

  function signInWithGoogleAccount() {
    setAuthError('')
    setAuthMessage('')

    if (!isSupabaseConfigured) {
      setAuthError('Add real Supabase values to .env before signing in.')
      return
    }

    try {
      signInWithGoogle()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed.')
    }
  }

  async function logout() {
    await signOut(session?.access_token)
    clearStoredSession()
    setSession(null)
  }

  return {
    session,
    role,
    permissions,
    userName,
    authError,
    authMessage,
    isAuthLoading,
    isSupabaseConfigured,
    submitAuth,
    signInWithGoogleAccount,
    logout,
  }
}
