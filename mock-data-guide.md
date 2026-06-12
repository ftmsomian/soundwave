# راهنمای Mock Data

همه داده‌های mock در `src/mock/` قرار می‌گیرند و از `localStorage` استفاده می‌کنند.

## کلیدهای localStorage

| کلید | توضیح | مسئول |
|------|-------|-------|
| `sw_auth_user` | کاربر وارد شده | نفر اول |
| `sw_users` | لیست همه کاربران | نفر اول |
| `sw_artists` | لیست هنرمندان | نفر اول |
| `sw_tracks` | لیست آهنگ‌ها | نفر دوم |
| `sw_albums` | لیست آلبوم‌ها | نفر دوم |
| `sw_playlists` | پلی‌لیست‌های کاربر | نفر دوم |
| `sw_notifications` | اعلانات | نفر اول |
| `sw_tickets` | تیکت‌های پشتیبانی | نفر اول |
| `sw_player_state` | وضعیت پخش‌کننده | نفر سوم |

---

## تایپ‌های پایه (src/types/index.ts)

```typescript
export type UserRole = 'listener' | 'artist' | 'support' | 'admin'
export type SubscriptionTier = 'free' | 'silver' | 'gold'
export type ArtistStatus = 'pending' | 'approved' | 'rejected'
export type RepeatMode = 'none' | 'all' | 'one'
export type TicketStatus = 'open' | 'answered' | 'closed'
export type PaymentStatus = 'pending' | 'settled'

export interface IUser {
  id: string
  username: string       // تخصیص سامانه
  displayName: string    // انتخاب کاربر
  email: string
  role: UserRole
  subscription: SubscriptionTier
  subscriptionExpiry?: string  // ISO date
  avatarUrl?: string
  bio?: string
  birthDate?: string
  gender?: 'male' | 'female' | 'other'
  followersCount: number
  followingCount: number
  dailyStreams: number
  createdAt: string
}

export interface IArtist extends IUser {
  role: 'artist'
  artistName: string
  status: ArtistStatus
  rejectionReason?: string
  totalStreams: number
  monthlyListeners: number
  earnings: number
}

export interface ITrack {
  id: string
  title: string
  artistId: string
  artistName: string
  albumId?: string
  albumName?: string
  coverUrl: string
  audioUrl: string      // در فاز اول mock URL
  duration: number      // ثانیه
  genre?: string
  releaseYear?: number
  lyrics?: string
  streamCount: number
  listenerCount: number
  isEarlyAccess: boolean
  collaborators?: string[]
  createdAt: string
}

export interface IAlbum {
  id: string
  title: string
  artistId: string
  artistName: string
  coverUrl: string
  releaseYear: number
  genre?: string
  trackIds: string[]
  streamCount: number
  createdAt: string
}

export interface IPlaylist {
  id: string
  userId: string
  name: string
  trackIds: string[]
  createdAt: string
  updatedAt: string
}

export interface INotification {
  id: string
  userId: string
  type: 'subscription_expiry' | 'new_release' | 'artist_status' | 'payment' | 'new_ticket' | 'new_artist_request'
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

export interface ITicket {
  id: string
  userId: string
  userName: string
  subject: string
  messages: ITicketMessage[]
  status: TicketStatus
  createdAt: string
}

export interface ITicketMessage {
  id: string
  senderId: string
  senderRole: UserRole
  content: string
  createdAt: string
}

export interface IPlayerState {
  currentTrack: ITrack | null
  queue: ITrack[]
  isPlaying: boolean
  currentTime: number
  volume: number
  repeatMode: RepeatMode
  isShuffled: boolean
  isCrossfadeEnabled: boolean
}

export interface ISubscriptionPrices {
  silver: number
  gold: number
}

export const SUBSCRIPTION_LIMITS = {
  free: { maxPlaylists: 6, dailyStreams: 60, canUploadAvatar: false, canDownload: false, earlyAccess: false, stats: false },
  silver: { maxPlaylists: 100, dailyStreams: Infinity, canUploadAvatar: true, canDownload: true, earlyAccess: false, stats: false },
  gold: { maxPlaylists: Infinity, dailyStreams: Infinity, canUploadAvatar: true, canDownload: true, earlyAccess: true, stats: true },
} as const
```
