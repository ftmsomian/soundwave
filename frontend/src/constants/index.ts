export const STORAGE_KEYS = {
  USERS: 'users',
  ARTISTS: 'artists',
  AUTH_USER: 'auth_user',
  SONGS: 'songs',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  NOTIFICATIONS: 'notifications',
  TICKETS: 'tickets',
}

// این مقادیر رو هم که توی پروفایل استفاده کردی همینجا بذار تا ارور نده:
export const DEFAULT_AVATAR = 'https://picsum.photos/150'
export const SUBSCRIPTION_LABELS: Record<string, string> = {
  free: 'رایگان',
  silver: 'نقره‌ای',
  gold: 'طلایی'
}
export const SUBSCRIPTION_LIMITS: Record<string, any> = {
  free: { canUploadAvatar: false },
  silver: { canUploadAvatar: true },
  gold: { canUploadAvatar: true }
}