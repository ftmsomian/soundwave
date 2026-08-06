/**
 * لایه‌ی ارتباط با بک‌اند واقعی (اپ accounts).
 *
 * فقط همین اپ (auth / profile / follow / avatar / settings) الان به بک‌اند وصل شده،
 * چون فقط accounts کامل و تست‌شده است. بقیه‌ی صفحات (پلی‌لیست، موسیقی، اعلانات، ادمین)
 * هنوز از mock/localStorage استفاده می‌کنند تا وقتی catalog (نفر دوم) و اعلانات/تیکت/پرداخت
 * از نو نوشته بشن.
 */
import type { Artist, Gender, User } from '@/types'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const ACCESS_TOKEN_KEY = 'soundwave_access_token'
const REFRESH_TOKEN_KEY = 'soundwave_refresh_token'

// ============================================================
// نگهداری توکن‌ها
// ============================================================
export const tokenStorage = {
  getAccess(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefresh(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  setAccess(access: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// ============================================================
// خطای استاندارد API — فرمت مطابق core/exceptions.py بک‌اند:
// {"error": {"code": "...", "message": "...", "details": {...}}}
// ============================================================
export class ApiError extends Error {
  code: string
  details: Record<string, unknown>
  status: number

  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }

  /** پیام قابل‌نمایش برای اولین فیلد خطادار (برای فرم‌ها) */
  fieldError(field: string): string | undefined {
    const value = this.details?.[field]
    if (!value) return undefined
    return Array.isArray(value) ? String(value[0]) : String(value)
  }
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return false

  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
    .then(async res => {
      if (!res.ok) return false
      const data = await res.json()
      if (!data.access) return false
      tokenStorage.setAccess(data.access)
      return true
    })
    .catch(() => false)
    .finally(() => {
      isRefreshing = false
    })

  return refreshPromise
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  isFormData?: boolean
  auth?: boolean // پیش‌فرض true؛ برای endpoint های AllowAny مثل login/register می‌شه false گذاشت
}

/** درخواست پایه به بک‌اند؛ خودکار Authorization هدر می‌زنه و روی ۴۰۱ یک‌بار refresh token امتحان می‌کنه. */
async function apiFetch<T>(path: string, options: RequestOptions = {}, _isRetry = false): Promise<T> {
  const { method = 'GET', body, isFormData = false, auth = true } = options

  const headers: Record<string, string> = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'

  if (auth) {
    const access = tokenStorage.getAccess()
    if (access) headers['Authorization'] = `Bearer ${access}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  })

  // اگه توکن منقضی شده، یک‌بار تلاش کن refresh کنی و درخواست رو دوباره بزن
  if (res.status === 401 && auth && !_isRetry) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return apiFetch<T>(path, options, true)
    tokenStorage.clear()
  }

  const isNoContent = res.status === 204
  const data = isNoContent ? null : await res.json().catch(() => null)

  if (!res.ok) {
    const errorPayload = data?.error
    throw new ApiError(
      res.status,
      errorPayload?.code || 'UNKNOWN_ERROR',
      errorPayload?.message || 'خطایی رخ داد. دوباره تلاش کنید.',
      errorPayload?.details || {}
    )
  }

  return data as T
}

// ============================================================
// نگاشت شکل داده‌ی بک‌اند (snake_case) به تایپ‌های فرانت‌اند (camelCase)
// نکته: فیلد dailyStreamCount در بک‌اند وجود نداره (متعلق به StreamLog در اپ catalog
// است که هنوز نوشته نشده)، فعلاً صفر می‌ذاریم تا catalog تکمیل بشه.
// ============================================================
interface BackendUser {
  id: number
  username: string
  display_name: string
  email?: string
  role: User['role']
  subscription: User['subscription']
  subscription_expires_at: string | null
  avatar: string | null
  bio: string
  birth_date: string | null
  gender: Gender | ''
  created_at: string
  followers_count: number
  following_count: number
  is_followed_by_me?: boolean
}

interface BackendArtist {
  id: number
  username: string
  artist_name: string
  status: Artist['status']
  rejection_reason: string
  portfolio_url: string
  is_verified: boolean
  total_streams: number | null
  unique_listeners: number | null
  monthly_earnings: number
  created_at: string
}

function mapBackendUser(u: BackendUser): User {
  return {
    id: String(u.id),
    username: u.username,
    displayName: u.display_name,
    email: u.email ?? '',
    role: u.role,
    subscription: u.subscription,
    subscriptionExpiresAt: u.subscription_expires_at ?? undefined,
    avatarUrl: u.avatar ?? undefined,
    bio: u.bio,
    birthDate: u.birth_date ?? undefined,
    gender: (u.gender || undefined) as Gender | undefined,
    followersCount: u.followers_count,
    followingCount: u.following_count,
    dailyStreamCount: 0, // TODO: وقتی catalog.StreamLog نوشته شد، از بک‌اند بیاد
    createdAt: u.created_at,
  }
}

export function mapBackendArtist(a: BackendArtist): Partial<Artist> {
  return {
    artistName: a.artist_name,
    status: a.status,
    rejectionReason: a.rejection_reason || undefined,
    portfolioUrl: a.portfolio_url || undefined,
    isVerified: a.is_verified,
    totalStreams: a.total_streams ?? 0,
    uniqueListeners: a.unique_listeners ?? 0,
    monthlyEarnings: a.monthly_earnings,
  }
}

// ============================================================
// Auth
// ============================================================
export interface AuthResult {
  user: User
  access: string
  refresh: string
}

export async function apiRegister(input: {
  email: string
  displayName: string
  password: string
  passwordConfirm: string
  birthDate: string
  gender: Gender
}): Promise<AuthResult> {
  const data = await apiFetch<{ user: BackendUser; access: string; refresh: string }>(
    '/auth/register/',
    {
      method: 'POST',
      auth: false,
      body: {
        email: input.email,
        display_name: input.displayName,
        password: input.password,
        password_confirm: input.passwordConfirm,
        birth_date: input.birthDate,
        gender: input.gender,
      },
    }
  )
  return { user: mapBackendUser(data.user), access: data.access, refresh: data.refresh }
}

export async function apiRegisterArtist(input: {
  email: string
  artistName: string
  password: string
  portfolioUrl: string
}): Promise<void> {
  await apiFetch('/auth/register/artist/', {
    method: 'POST',
    auth: false,
    body: {
      email: input.email,
      artist_name: input.artistName,
      password: input.password,
      password_confirm: input.password,
      portfolio_url: input.portfolioUrl,
    },
  })
  // توجه: بک‌اند عمداً برای هنرمند در وضعیت pending توکن برنمی‌گردونه —
  // هنرمند باید بعد از تأیید پشتیبان/مدیر از صفحه‌ی ورود عادی وارد بشه.
}

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
  const data = await apiFetch<{ user: BackendUser; access: string; refresh: string }>('/auth/login/', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
  return { user: mapBackendUser(data.user), access: data.access, refresh: data.refresh }
}

export async function apiForgotPassword(email: string): Promise<void> {
  await apiFetch('/auth/forgot-password/', { method: 'POST', auth: false, body: { email } })
}

export async function apiResetPassword(input: { uid: string; token: string; newPassword: string }): Promise<void> {
  await apiFetch('/auth/reset-password/', {
    method: 'POST',
    auth: false,
    body: { uid: input.uid, token: input.token, new_password: input.newPassword },
  })
}

// ============================================================
// پروفایل
// ============================================================
export async function apiGetMe(): Promise<User> {
  const data = await apiFetch<BackendUser>('/users/me/')
  return mapBackendUser(data)
}

export async function apiPatchMe(updates: Partial<{ displayName: string; bio: string }>): Promise<User> {
  const body: Record<string, unknown> = {}
  if (updates.displayName !== undefined) body.display_name = updates.displayName
  if (updates.bio !== undefined) body.bio = updates.bio
  const data = await apiFetch<BackendUser>('/users/me/', { method: 'PATCH', body })
  return mapBackendUser(data)
}

export async function apiDeleteMe(): Promise<void> {
  await apiFetch('/users/me/', { method: 'DELETE' })
}

export async function apiGetPublicProfile(username: string): Promise<User & { isFollowedByMe: boolean }> {
  const data = await apiFetch<BackendUser>(`/users/${encodeURIComponent(username)}/`, { auth: false })
  return { ...mapBackendUser(data), isFollowedByMe: Boolean(data.is_followed_by_me) }
}

export async function apiToggleFollow(username: string): Promise<{ following: boolean }> {
  return apiFetch(`/users/${encodeURIComponent(username)}/follow/`, { method: 'POST' })
}

export async function apiUploadAvatar(file: File): Promise<User> {
  const formData = new FormData()
  formData.append('avatar', file)
  const data = await apiFetch<BackendUser>('/users/me/avatar/', { method: 'POST', body: formData, isFormData: true })
  return mapBackendUser(data)
}

export interface UserSettingsPayload {
  notificationPrefs: Record<string, boolean>
  language: 'fa' | 'en'
  soundVolume: number // 0..1
}

export async function apiGetSettings(): Promise<UserSettingsPayload> {
  const data = await apiFetch<{ notification_prefs: Record<string, boolean>; language: 'fa' | 'en'; sound_volume: number }>(
    '/users/me/settings/'
  )
  return { notificationPrefs: data.notification_prefs || {}, language: data.language, soundVolume: data.sound_volume }
}

export async function apiPatchSettings(updates: Partial<UserSettingsPayload>): Promise<UserSettingsPayload> {
  const body: Record<string, unknown> = {}
  if (updates.notificationPrefs !== undefined) body.notification_prefs = updates.notificationPrefs
  if (updates.language !== undefined) body.language = updates.language
  if (updates.soundVolume !== undefined) body.sound_volume = updates.soundVolume
  const data = await apiFetch<{ notification_prefs: Record<string, boolean>; language: 'fa' | 'en'; sound_volume: number }>(
    '/users/me/settings/',
    { method: 'PATCH', body }
  )
  return { notificationPrefs: data.notification_prefs || {}, language: data.language, soundVolume: data.sound_volume }
}
