import type { User, Artist, Song, Album, Playlist, Notification, Ticket } from '@/types'
import { STORAGE_KEYS } from '@/constants'

// ============================================================
// کاربران تست
// ============================================================

export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'user_free_001',
    displayName: 'علی رضایی',
    email: 'user.free@test.com',
    role: 'user',
    subscription: 'free',
    avatarUrl: undefined,
    birthDate: '2000-05-15',
    gender: 'male',
    followersCount: 12,
    followingCount: 8,
    dailyStreamCount: 45,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    username: 'user_silver_002',
    displayName: 'سارا محمدی',
    email: 'user.silver@test.com',
    role: 'user',
    subscription: 'silver',
    subscriptionExpiresAt: '2025-09-01T00:00:00Z',
    avatarUrl: 'https://picsum.photos/seed/sara/150',
    birthDate: '1998-11-20',
    gender: 'female',
    followersCount: 34,
    followingCount: 52,
    dailyStreamCount: 0,
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'u3',
    username: 'user_gold_003',
    displayName: 'مهران کریمی',
    email: 'user.gold@test.com',
    role: 'user',
    subscription: 'gold',
    subscriptionExpiresAt: '2025-12-31T00:00:00Z',
    avatarUrl: 'https://picsum.photos/seed/mehran/150',
    birthDate: '1995-03-08',
    gender: 'male',
    followersCount: 120,
    followingCount: 67,
    dailyStreamCount: 0,
    createdAt: '2024-03-15T00:00:00Z',
  },
]

// ============================================================
// هنرمندان تست
// ============================================================

export const mockArtists: Artist[] = [
  {
    id: 'a1',
    username: 'artist_shajarian',
    displayName: 'محمدرضا شجریان',
    email: 'artist@test.com',
    role: 'artist',
    subscription: 'free',
    artistName: 'شجریان',
    bio: 'استاد موسیقی سنتی ایران',
    status: 'approved',
    isVerified: true,
    followersCount: 50000,
    followingCount: 0,
    dailyStreamCount: 0,
    totalStreams: 120000,
    uniqueListeners: 45000,
    monthlyEarnings: 2500000,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'a2',
    username: 'artist_googoosh',
    displayName: 'گوگوش',
    email: 'artist2@test.com',
    role: 'artist',
    subscription: 'free',
    artistName: 'گوگوش',
    bio: 'خواننده مشهور ایرانی',
    status: 'approved',
    isVerified: true,
    followersCount: 80000,
    followingCount: 0,
    dailyStreamCount: 0,
    totalStreams: 200000,
    uniqueListeners: 75000,
    monthlyEarnings: 4000000,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'a3',
    username: 'artist_pending',
    displayName: 'هنرمند جدید',
    email: 'artist3@test.com',
    role: 'artist',
    subscription: 'free',
    artistName: 'آرتیست جدید',
    bio: '',
    status: 'pending',
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
    dailyStreamCount: 0,
    totalStreams: 0,
    uniqueListeners: 0,
    monthlyEarnings: 0,
    createdAt: '2024-06-01T00:00:00Z',
  },
]

// ============================================================
// کاربران سیستم (پشتیبان و مدیر)
// ============================================================

export const mockSystemUsers: User[] = [
  {
    id: 's1',
    username: 'support_001',
    displayName: 'پشتیبان اول',
    email: 'support@test.com',
    role: 'support',
    subscription: 'free',
    followersCount: 0,
    followingCount: 0,
    dailyStreamCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin1',
    username: 'admin',
    displayName: 'مدیر سامانه',
    email: 'admin@test.com',
    role: 'admin',
    subscription: 'free',
    followersCount: 0,
    followingCount: 0,
    dailyStreamCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

export const allMockUsers = [...mockUsers, ...mockArtists, ...mockSystemUsers]

// ============================================================
// آهنگ‌های تست
// ============================================================

export const mockSongs: Song[] = [
  {
    id: 'song1', title: 'دستم بگیر', artistId: 'a1', artistName: 'شجریان',
    albumId: 'album1', albumName: 'بیداد', coverUrl: 'https://picsum.photos/seed/song1/300',
    duration: 245, genre: 'سنتی', releaseYear: 1980, streamCount: 15000,
    uniqueListenerCount: 8000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'song2', title: 'مرغ سحر', artistId: 'a1', artistName: 'شجریان',
    albumId: 'album1', albumName: 'بیداد', coverUrl: 'https://picsum.photos/seed/song2/300',
    duration: 310, genre: 'سنتی', releaseYear: 1980, streamCount: 22000,
    uniqueListenerCount: 12000, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'song3', title: 'تالار آینه', artistId: 'a2', artistName: 'گوگوش',
    coverUrl: 'https://picsum.photos/seed/song3/300', duration: 198, genre: 'پاپ',
    releaseYear: 1975, streamCount: 45000, uniqueListenerCount: 30000,
    isEarlyAccess: true, createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'song4', title: 'ببین', artistId: 'a2', artistName: 'گوگوش',
    coverUrl: 'https://picsum.photos/seed/song4/300', duration: 220, genre: 'پاپ',
    releaseYear: 2000, streamCount: 38000, uniqueListenerCount: 25000,
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: 'song5', title: 'عشق من', artistId: 'a2', artistName: 'گوگوش',
    coverUrl: 'https://picsum.photos/seed/song5/300', duration: 185, genre: 'پاپ',
    releaseYear: 1998, streamCount: 28000, uniqueListenerCount: 18000,
    lyrics: 'عشق من، نور من\nهمیشه در کنارمی\nبا تو زندگی زیباست...',
    createdAt: '2024-04-01T00:00:00Z',
  },
]

// ============================================================
// آلبوم‌های تست
// ============================================================

export const mockAlbums: Album[] = [
  {
    id: 'album1', title: 'بیداد', artistId: 'a1', artistName: 'شجریان',
    coverUrl: 'https://picsum.photos/seed/album1/300',
    songs: mockSongs.filter(s => s.albumId === 'album1'),
    genre: 'سنتی', releaseYear: 1980, streamCount: 37000,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// ============================================================
// پلی‌لیست‌های تست
// ============================================================

export const mockPlaylists: Playlist[] = [
  {
    id: 'pl1', name: 'پلی‌لیست صبحگاهی', ownerId: 'u2',
    songs: [mockSongs[0], mockSongs[2]],
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'pl2', name: 'آهنگ‌های ایرانی', ownerId: 'u2',
    songs: [mockSongs[1], mockSongs[3], mockSongs[4]],
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-04-15T00:00:00Z',
  },
]

// ============================================================
// اعلانات تست
// ============================================================

export const mockNotifications: Notification[] = [
  {
    id: 'n1', userId: 'u1', type: 'subscription_expiring',
    title: 'اشتراک شما رو به پایان است',
    message: 'اشتراک رایگان شما ۳ روز دیگر تمام می‌شود.',
    isRead: false, createdAt: '2024-06-10T08:00:00Z',
  },
  {
    id: 'n2', userId: 'u2', type: 'new_release',
    title: 'آهنگ جدید گوگوش',
    message: 'گوگوش آهنگ جدیدی منتشر کرد: «تالار آینه»',
    isRead: false, link: '/music', createdAt: '2024-06-09T12:00:00Z',
  },
  {
    id: 'n3', userId: 'u2', type: 'new_release',
    title: 'آلبوم جدید شجریان',
    message: 'آلبوم جدید شجریان در دسترس است.',
    isRead: true, link: '/album/album1', createdAt: '2024-06-01T10:00:00Z',
  },
]

// ============================================================
// تیکت‌های تست
// ============================================================

export const mockTickets: Ticket[] = [
  {
    id: 't1', userId: 'u1', userName: 'علی رضایی', subject: 'مشکل در پخش آهنگ', status: 'open',
    messages: [
      {
        id: 'm1', senderId: 'u1', senderName: 'علی رضایی', senderRole: 'user',
        content: 'سلام، آهنگ‌ها پخش نمی‌شن. لطفاً کمک کنید.', createdAt: '2024-06-10T09:00:00Z',
      },
    ],
    createdAt: '2024-06-10T09:00:00Z', updatedAt: '2024-06-10T09:00:00Z',
  },
]

// ============================================================
// seed کردن localStorage در اولین اجرا
// ============================================================

export const seedMockData = () => {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setToStorage(STORAGE_KEYS.USERS, mockUsers)
  }
  if (!localStorage.getItem(STORAGE_KEYS.ARTISTS)) {
    setToStorage(STORAGE_KEYS.ARTISTS, mockArtists)
  }
  if (!localStorage.getItem(STORAGE_KEYS.SONGS)) {
    setToStorage(STORAGE_KEYS.SONGS, mockSongs)
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALBUMS)) {
    setToStorage(STORAGE_KEYS.ALBUMS, mockAlbums)
  }
  if (!localStorage.getItem(STORAGE_KEYS.PLAYLISTS)) {
    setToStorage(STORAGE_KEYS.PLAYLISTS, mockPlaylists)
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, mockNotifications)
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    setToStorage(STORAGE_KEYS.TICKETS, mockTickets)
  }
}

// ============================================================
// توابع کمکی برای کار با localStorage
// ============================================================

export const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(key)
  if (!data) return []
  try {
    return JSON.parse(data) as T[]
  } catch {
    return []
  }
}

export const setToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}
