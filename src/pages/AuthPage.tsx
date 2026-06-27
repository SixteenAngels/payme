import { useState } from 'react'
import { StatusBanner } from '../components/ui'
import { useAuth, type AuthMode } from '../hooks/useAuth'

export function AuthPage({
  submitAuth,
  signInWithGoogleAccount,
  authError,
  authMessage,
  isAuthLoading,
  isSupabaseConfigured,
}: ReturnType<typeof useAuth>) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <h1>AutoPay Africa</h1>
          <p>Secure payroll operations, salary advances, approvals, and recurring disbursements.</p>
        </div>
        {!isSupabaseConfigured && (
          <StatusBanner
            tone="warning"
            title="Supabase is not connected"
            copy="Save VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env, then restart Vite. Organization setup happens inside Settings after sign-up."
          />
        )}
        <div className="auth-tabs">
          {(['sign-in', 'sign-up', 'reset'] as AuthMode[]).map((tab) => (
            <button className={mode === tab ? 'active' : ''} key={tab} type="button" onClick={() => setMode(tab)}>
              {tab === 'sign-in' ? 'Sign In' : tab === 'sign-up' ? 'Sign Up' : 'Reset'}
            </button>
          ))}
        </div>
        {mode === 'sign-up' && (
          <label>
            Full name
            <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
        )}
        <label>
          Work email
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        {mode !== 'reset' && (
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
        )}
        {authError && <p className="form-error">{authError}</p>}
        {authMessage && <p className="form-success">{authMessage}</p>}
        <button className="primary wide" type="button" disabled={isAuthLoading} onClick={() => submitAuth(mode, form)}>
          {isAuthLoading ? 'Working...' : mode === 'sign-in' ? 'Enter Operations Console' : mode === 'sign-up' ? 'Create Admin Account' : 'Send Reset Email'}
        </button>
        {mode !== 'reset' && (
          <>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <button className="google wide" type="button" disabled={isAuthLoading || !isSupabaseConfigured} onClick={signInWithGoogleAccount}>
              <GoogleIcon />
              Continue with Google
            </button>
          </>
        )}
      </section>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
