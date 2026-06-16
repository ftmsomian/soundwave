import type { SubscriptionTier } from '@/types'

// ============================================================
// محدودیت‌های اشتراک
// ============================================================

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, {
  dailyStreams: number | null       // null = نامحدود
  maxPlaylists: number | null       // null = نامحدود
  canUploadAvatar: boolean
  canDownload: boolean
  hasEarlyAccess: boolean
  canViewStats: boolean
}> = {
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

// ============================================================
// قیمت‌های پیش‌فرض اشتراک (تومان)
// در فاز دوم از بک‌اند می‌آد، اینجا فقط پیش‌فرض فاز اول است
// ============================================================

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
// سایر ثابت‌ها
// ============================================================

export const APP_NAME = 'SoundWave'

export const DEFAULT_AVATAR = 'https://via.placeholder.com/150/282828/B3B3B3?text=SW'
export const DEFAULT_COVER = 'https://via.placeholder.com/300/282828/B3B3B3?text=SW'

export const PLAYER_TICK_MS = 1000