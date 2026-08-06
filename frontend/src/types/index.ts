// ============================================================
// USER TYPES
// ============================================================

export type UserRole = 'user' | 'artist' | 'support' | 'admin'
export type SubscriptionTier = 'free' | 'silver' | 'gold'
export type ArtistStatus = 'pending' | 'approved' | 'rejected'
export type Gender = 'male' | 'female' | 'other'

export interface User {
  id: string
  username: string
  displayName: string
  email: string
  passwordHash?: string
  role: UserRole
  subscription: SubscriptionTier
  subscriptionExpiresAt?: string
  avatarUrl?: string
  bio?: string
  birthDate?: string
  gender?: Gender
  followersCount: number
  followingCount: number
  dailyStreamCount: number
  createdAt: string
}

// alias تا کدهای قدیمی که از IUser استفاده کرده‌اند هم کار کنند
export type IUser = User

export interface Artist extends User {
  role: 'artist'
  artistName: string
  bio?: string
  status: ArtistStatus
  rejectionReason?: string
  portfolioUrl?: string
  totalStreams: number
  uniqueListeners: number
  monthlyEarnings: number
  isVerified: boolean
}

export type IArtist = Artist

// ============================================================
// MUSIC TYPES
// ============================================================

export interface Song {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId?: string
  albumName?: string
  coverUrl: string
  audioUrl?: string
  /** فایل‌های صوتی با کیفیت‌های مختلف (بخش امتیازی «پخش‌کننده پیشرفته»). اگه موجود نباشه از audioUrl برای هر دو کیفیت استفاده می‌شه. */
  audioQualities?: {
    low: string
    high: string
  }
  duration: number
  lyrics?: string
  genre?: string
  releaseYear?: number
  streamCount: number
  uniqueListenerCount: number
  isEarlyAccess?: boolean
  createdAt: string
}

export interface Album {
  id: string
  title: string
  artistId: string
  artistName: string
  coverUrl: string
  songs: Song[]
  genre?: string
  releaseYear?: number
  streamCount: number
  createdAt: string
}

// ============================================================
// PLAYLIST TYPES
// ============================================================

export interface Playlist {
  id: string
  name: string
  ownerId: string
  songs: Song[]
  coverUrl?: string
  createdAt: string
  updatedAt: string
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType =
  | 'subscription_expiring'
  | 'new_release'
  | 'artist_approved'
  | 'artist_rejected'
  | 'monthly_earnings'
  | 'new_ticket'
  | 'artist_verification_request'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

// ============================================================
// TICKET TYPES
// ============================================================

export type TicketStatus = 'open' | 'answered' | 'closed'

export interface TicketMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: UserRole
  content: string
  createdAt: string
}

export interface Ticket {
  id: string
  userId: string
  userName: string
  subject: string
  status: TicketStatus
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

// ============================================================
// PLAYER TYPES
// ============================================================

export type RepeatMode = 'none' | 'all' | 'one'
export type AudioQuality = 'low' | 'high'

export interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  isPlaying: boolean
  currentTime: number
  volume: number
  repeatMode: RepeatMode
  isShuffle: boolean
  /** بخش امتیازی: کیفیت پخش */
  quality: AudioQuality
  /** بخش امتیازی: حالت Crossfade روشن/خاموش */
  isCrossfadeEnabled: boolean
  /** بخش امتیازی: رنگ غالب کاور آهنگ فعلی، برای هماهنگ‌سازی رنگ ویجت‌های پخش‌کننده */
  dominantColor: string
  /** هر بار که آهنگی پخش می‌شه (حتی اگه همون آهنگ قبلی باشه) آپدیت می‌شه؛
   * برای این استفاده می‌شه که اگه کاربر نوار پخش‌کننده رو با دکمه‌ی × بسته باشه، با پخش دوباره یک آهنگ برگرده. */
  lastPlayedAt: number
}

// ============================================================
// SUBSCRIPTION / ACCOUNTING TYPES
// ============================================================

export interface SubscriptionPricing {
  silver: number
  gold: number
}

export type PaymentStatus = 'pending' | 'settled'

export interface ArtistAccounting {
  artistId: string
  artistName: string
  month: string
  uniqueListeners: number
  totalStreams: number
  earnings: number
  paymentStatus: PaymentStatus
}
