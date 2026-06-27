const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_PUBLIC_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined
const PLACEHOLDER_URL = 'https://your-project-ref.supabase.co'
const PLACEHOLDER_KEY = 'your-publishable-or-anon-key'

type QueryResult<T> = { data: T[] | null; error: Error | null }
export type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> }
export type SupabaseSession = {
  access_token: string
  refresh_token: string
  expires_at?: number
  user: AuthUser
}

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_PUBLIC_KEY &&
    SUPABASE_URL !== PLACEHOLDER_URL &&
    SUPABASE_PUBLIC_KEY !== PLACEHOLDER_KEY,
)

const sessionKey = 'autopay.supabase.session'

export function getStoredSession(): SupabaseSession | null {
  const rawSession = window.localStorage.getItem(sessionKey)
  if (!rawSession) return null

  try {
    return JSON.parse(rawSession) as SupabaseSession
  } catch {
    window.localStorage.removeItem(sessionKey)
    return null
  }
}

export function storeSession(session: SupabaseSession) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session))
}

export function clearStoredSession() {
  window.localStorage.removeItem(sessionKey)
}

function getAuthHeaders(accessToken?: string) {
  const token = accessToken ?? SUPABASE_PUBLIC_KEY

  return {
    apikey: SUPABASE_PUBLIC_KEY!,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function getAuthErrorMessage(data: unknown) {
  if (data && typeof data === 'object') {
    const errorData = data as { msg?: unknown; error_description?: unknown; message?: unknown }
    if (typeof errorData.error_description === 'string') return errorData.error_description
    if (typeof errorData.message === 'string') return errorData.message
    if (typeof errorData.msg === 'string') return errorData.msg
  }

  return 'Supabase auth request failed.'
}

async function authRequest<T>(path: string, body: Record<string, unknown>): Promise<{ data: T | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase environment variables are not configured.') }
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })

  const data = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    return { data: null, error: new Error(getAuthErrorMessage(data)) }
  }

  return { data: data as T, error: null }
}

export async function signInWithPassword(email: string, password: string) {
  return authRequest<SupabaseSession>('token?grant_type=password', { email, password })
}

export function signInWithGoogle() {
  if (!isSupabaseConfigured || !SUPABASE_URL) {
    throw new Error('Supabase environment variables are not configured.')
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}`
  const params = new URLSearchParams({
    provider: 'google',
    redirect_to: redirectTo,
  })

  window.location.assign(`${SUPABASE_URL}/auth/v1/authorize?${params}`)
}

export function parseOAuthHash(): Omit<SupabaseSession, 'user'> | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  if (!accessToken) return null

  const expiresIn = params.get('expires_in')
  const expiresAt = expiresIn ? Math.floor(Date.now() / 1000) + Number.parseInt(expiresIn, 10) : undefined

  return {
    access_token: accessToken,
    refresh_token: params.get('refresh_token') ?? '',
    expires_at: expiresAt,
  }
}

export async function fetchAuthUser(accessToken: string) {
  if (!isSupabaseConfigured) {
    return { user: null, error: new Error('Supabase environment variables are not configured.') }
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: getAuthHeaders(accessToken),
  })

  const data = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    return { user: null, error: new Error(getAuthErrorMessage(data)) }
  }

  return { user: data as AuthUser, error: null }
}

export async function completeOAuthSession(session: Omit<SupabaseSession, 'user'>) {
  const { user, error } = await fetchAuthUser(session.access_token)
  if (error || !user) {
    return { data: null, error: error ?? new Error('Could not load Google account profile.') }
  }

  return {
    data: {
      ...session,
      user,
    } satisfies SupabaseSession,
    error: null,
  }
}

export async function signUpWithPassword(email: string, password: string, fullName: string) {
  return authRequest<SupabaseSession>('signup', {
    email,
    password,
    data: { full_name: fullName },
  })
}

export async function requestPasswordReset(email: string) {
  return authRequest<{ message?: string }>('recover', { email })
}

export async function refreshSession(refreshToken: string) {
  return authRequest<SupabaseSession>('token?grant_type=refresh_token', { refresh_token: refreshToken })
}

export async function signOut(accessToken?: string) {
  if (!isSupabaseConfigured || !accessToken) {
    clearStoredSession()
    return
  }

  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
  }).catch(() => undefined)

  clearStoredSession()
}

export async function selectFromSupabase<T>(table: string, query = 'select=*', accessToken?: string): Promise<QueryResult<T>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase environment variables are not configured.') }
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: getAuthHeaders(accessToken),
  })

  if (!response.ok) {
    return { data: null, error: new Error(`Supabase request failed with ${response.status}.`) }
  }

  return { data: (await response.json()) as T[], error: null }
}

export async function insertIntoSupabase<T>(
  table: string,
  payload: Record<string, unknown>,
  accessToken?: string,
): Promise<{ data: T | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase environment variables are not configured.') }
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(accessToken),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    return { data: null, error: new Error(`Supabase insert failed with ${response.status}.`) }
  }

  const rows = (await response.json()) as T[]
  return { data: rows[0] ?? null, error: null }
}

export async function updateSupabase<T>(
  table: string,
  query: string,
  payload: Record<string, unknown>,
  accessToken?: string,
): Promise<{ data: T | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase environment variables are not configured.') }
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(accessToken),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    return { data: null, error: new Error(`Supabase update failed with ${response.status}.`) }
  }

  const rows = (await response.json()) as T[]
  return { data: rows[0] ?? null, error: null }
}

export async function invokeSupabaseFunction<T>(
  functionName: string,
  payload: Record<string, unknown>,
  accessToken?: string,
): Promise<{ data: T | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase environment variables are not configured.') }
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    return { data: null, error: new Error(getAuthErrorMessage(data)) }
  }

  return { data: data as T, error: null }
}
