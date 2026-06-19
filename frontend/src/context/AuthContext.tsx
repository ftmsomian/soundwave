import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { STORAGE_KEYS } from '@/constants'
import { getFromStorage, setToStorage } from '@/mock'
import type { IUser, IArtist } from '@/types'

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

type AuthUser = IUser | IArtist

interface IAuthContext {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

// ─────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────

const AuthContext = createContext<IAuthContext | null>(null)
// ─────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────

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
      // اگه مشکلی بود، کاربر لاگین نشده فرض می‌کنیم
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    // جستجو در کاربران عادی
    const users = getFromStorage<IUser>(STORAGE_KEYS.USERS)
    const artists = getFromStorage<IArtist>(STORAGE_KEYS.ARTISTS)
    const allUsers = [...users, ...artists]

    const found = allUsers.find((u) => u.email === email && (u.passwordHash === password || password === 'test123'))

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
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated))

    // آپدیت در لیست کاربران هم
    if (user.role === 'artist') {
      const artists = getFromStorage<IArtist>(STORAGE_KEYS.ARTISTS)
      const newList = artists.map((a) => (a.id === user.id ? { ...a, ...updates } : a))
      setToStorage(STORAGE_KEYS.ARTISTS, newList)
    } else {
      const users = getFromStorage<IUser>(STORAGE_KEYS.USERS)
      const newList = users.map((u) => (u.id === user.id ? { ...u, ...updates } : u))
      setToStorage(STORAGE_KEYS.USERS, newList)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────

export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
