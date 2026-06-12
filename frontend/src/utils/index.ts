/**
 * تبدیل ثانیه به فرمت mm:ss
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * تبدیل عدد به فرمت فارسی با جداکننده هزار
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num)
}

/**
 * تبدیل عدد به فرمت کوتاه (مثلاً ۱۲.۵ هزار)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} م`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)} هزار`
  return String(num)
}

/**
 * تبدیل تاریخ ISO به فرمت فارسی
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('fa-IR')
}

/**
 * بررسی اینکه آیا کاربر به یک امکان دسترسی دارد
 */
export function canAccess(
  subscription: 'free' | 'silver' | 'gold',
  feature: 'canUploadAvatar' | 'canDownload' | 'hasEarlyAccess' | 'canViewStats'
): boolean {
  const limits = {
    free:   { canUploadAvatar: false, canDownload: false, hasEarlyAccess: false, canViewStats: false },
    silver: { canUploadAvatar: true,  canDownload: true,  hasEarlyAccess: false, canViewStats: false },
    gold:   { canUploadAvatar: true,  canDownload: true,  hasEarlyAccess: true,  canViewStats: true },
  }
  return limits[subscription][feature]
}

/**
 * تولید ID یکتا
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
