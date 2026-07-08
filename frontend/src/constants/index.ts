import type { SubscriptionTier } from '@/types'

// ============================================================
// کلیدهای localStorage (یک نسخه‌ی واحد برای کل پروژه)
// ============================================================
export const STORAGE_KEYS = {
  USERS: 'users',
  ARTISTS: 'artists',
  AUTH_USER: 'auth_user',
  SONGS: 'songs',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  NOTIFICATIONS: 'notifications',
  TICKETS: 'tickets',
  SETTINGS: 'soundwave_settings',
  SUBSCRIPTION_PRICES: 'soundwave_subscription_prices',
} as const

// ============================================================
// محدودیت‌های اشتراک
// ============================================================
interface SubscriptionLimit {
  dailyStreams: number | null
  maxPlaylists: number | null
  canUploadAvatar: boolean
  canDownload: boolean
  hasEarlyAccess: boolean
  canViewStats: boolean
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimit> = {
  free: {
    dailyStreams: 60,
    maxPlaylists: 6,
    canUploadAvatar: false,
    canDownload: false,
    hasEarlyAccess: false,
    canViewStats: false,
  },
  silver: {
    dailyStreams: null,
    maxPlaylists: 100,
    canUploadAvatar: true,
    canDownload: true,
    hasEarlyAccess: false,
    canViewStats: false,
  },
  gold: {
    dailyStreams: null,
    maxPlaylists: null,
    canUploadAvatar: true,
    canDownload: true,
    hasEarlyAccess: true,
    canViewStats: true,
  },
}

export const SUBSCRIPTION_LABELS: Record<SubscriptionTier, string> = {
  free: 'رایگان',
  silver: 'نقره‌ای',
  gold: 'طلایی',
}

export const DEFAULT_SUBSCRIPTION_PRICES = {
  silver: 50000,
  gold: 100000,
}

// ============================================================
// مسیرها
// ============================================================
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  playlists: '/playlists',
  music: '/music',
  notifications: '/notifications',
  settings: '/settings',
  profile: (username: string) => `/profile/${username}`,
  artist: (id: string) => `/artist/${id}`,
  artistManage: '/artist/manage',
  album: (id: string) => `/album/${id}`,
  admin: '/admin',
} as const

// ============================================================
// ثابت‌های Player و UI
// ============================================================
export const APP_NAME = 'SoundWave'
export const DEFAULT_AVATAR = 'https://via.placeholder.com/150/282828/B3B3B3?text=SW'
export const DEFAULT_COVER = 'https://via.placeholder.com/300/282828/B3B3B3?text=SW'
export const PLAYER_DEFAULT_VOLUME = 0.8
export const PLAYER_MIN_VOLUME = 0
export const PLAYER_MAX_VOLUME = 1
export const PLAYER_TICK_MS = 1000
export const PLAYER_PREVIOUS_THRESHOLD_SECONDS = 3
export const DEFAULT_SYSTEM_VOLUME = 70
export const SETTINGS_MIN_VOLUME = 0
export const SETTINGS_MAX_VOLUME = 100
