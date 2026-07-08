import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { STORAGE_KEYS } from '@/constants'
import { getFromStorage, setToStorage, allMockUsers } from '@/mock'
import type { User, Artist } from '@/types'

type AuthUser = User | Artist

interface IAuthContext {
  user: AuthUser | null
  /** alias برای کدهایی که از currentUser استفاده کرده‌اند (نفر دوم و سوم) */
  currentUser: AuthUser | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

const AuthContext = createContext<IAuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // بار اول چک می‌کنیم آیا کاربر قبلاً لاگین کرده
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // اگه مشکلی بود، کاربر لاگین‌نشده فرض می‌کنیم
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    // اول توی localStorage می‌گردیم (کاربرهایی که خودشون ثبت‌نام کردن)
    const storedUsers = getFromStorage<User>(STORAGE_KEYS.USERS)
    const storedArtists = getFromStorage<Artist>(STORAGE_KEYS.ARTISTS)
    const candidates = [...storedUsers, ...storedArtists, ...allMockUsers]

    // رمز تستی test123 برای همه‌ی mock userها هم کار می‌کنه
    const found = candidates.find(
      (u) => u.email === email && (u.passwordHash === password || password === 'test123')
    )

    if (!found) {
      return { success: false, error: 'ایمیل یا رمز عبور اشتباه است' }
    }

    setUser(found)
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(found))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    router.push('/login')
  }

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return
    const updated = { ...user, ...updates } as AuthUser
    setUser(updated)
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated))

    if (user.role === 'artist') {
      const artists = getFromStorage<Artist>(STORAGE_KEYS.ARTISTS)
      const newList = artists.map((a) => (a.id === user.id ? { ...a, ...updates } : a))
      setToStorage(STORAGE_KEYS.ARTISTS, newList)
    } else {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      const newList = users.map((u) => (u.id === user.id ? { ...u, ...updates } : u))
      setToStorage(STORAGE_KEYS.USERS, newList)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, currentUser: user, isLoading, isLoggedIn: user !== null, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
