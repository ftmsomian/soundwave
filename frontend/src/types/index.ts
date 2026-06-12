// ============================================================
// USER TYPES
// ============================================================

export type UserRole = 'user' | 'artist' | 'support' | 'admin'
export type SubscriptionTier = 'free' | 'silver' | 'gold'
export type ArtistStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  username: string         // اختصاص‌داده‌شده توسط سامانه
  displayName: string      // نام نمایشی
  email: string
  role: UserRole
  subscription: SubscriptionTier
  subscriptionExpiresAt?: string  // ISO date string
  avatarUrl?: string
  birthDate?: string
  gender?: 'male' | 'female' | 'other'
  followersCount: number
  followingCount: number
  dailyStreamCount: number
  createdAt: string
}

export interface Artist extends User {
  role: 'artist'
  artistName: string
  bio?: string
  status: ArtistStatus
  rejectionReason?: string
  totalStreams: number
  uniqueListeners: number
  monthlyEarnings: number
  isVerified: boolean
}

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
  audioUrl?: string       // در فاز اول می‌تونه undefined باشه
  duration: number        // ثانیه
  lyrics?: string
  genre?: string
  releaseYear?: number
  streamCount: number
  uniqueListenerCount: number
  isEarlyAccess?: boolean // فقط برای اشتراک طلایی
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

export interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  isPlaying: boolean
  currentTime: number
  volume: number
  repeatMode: RepeatMode
  isShuffle: boolean
}

// ============================================================
// SUBSCRIPTION TYPES
// ============================================================

export interface SubscriptionPricing {
  silver: number  // تومان
  gold: number    // تومان
}

// ============================================================
// ACCOUNTING TYPES
// ============================================================

export type PaymentStatus = 'pending' | 'settled'

export interface ArtistAccounting {
  artistId: string
  artistName: string
  month: string          // مثلاً "1403-03"
  uniqueListeners: number
  totalStreams: number
  earnings: number
  paymentStatus: PaymentStatus
}
