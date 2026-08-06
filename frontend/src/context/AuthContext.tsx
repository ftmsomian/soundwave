import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import {
  ApiError,
  apiDeleteMe,
  apiGetMe,
  apiLogin,
  apiPatchMe,
  apiRegister,
  apiRegisterArtist,
  apiUploadAvatar,
  tokenStorage,
} from '@/lib/api'
import type { Gender, User, Artist } from '@/types'

type AuthUser = User | Artist

interface RegisterInput {
  displayName: string
  email: string
  password: string
  passwordConfirm: string
  birthDate: string
  gender: Gender
}

interface RegisterArtistInput {
  artistName: string
  email: string
  password: string
  portfolioUrl: string
}

interface ActionResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
  user?: AuthUser
}

interface IAuthContext {
  user: AuthUser | null
  /** alias برای کدهایی که از currentUser استفاده کرده‌اند (نفر دوم و سوم) */
  currentUser: AuthUser | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<ActionResult>
  register: (input: RegisterInput) => Promise<ActionResult>
  registerArtist: (input: RegisterArtistInput) => Promise<ActionResult>
  logout: () => void
  updateUser: (updates: Partial<Pick<User, 'displayName' | 'bio'>>) => Promise<ActionResult>
  uploadAvatar: (file: File) => Promise<ActionResult>
  deleteAccount: () => Promise<ActionResult>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<IAuthContext | null>(null)

/** پیام‌های خطای اعتبارسنجی بک‌اند رو به شکل قابل‌نمایش برای فرم درمی‌آره. */
function extractFieldErrors(err: ApiError): Record<string, string> {
  const fields = ['email', 'display_name', 'birth_date', 'gender', 'password', 'password_confirm', 'artist_name', 'portfolio_url']
  const out: Record<string, string> = {}
  for (const f of fields) {
    const msg = err.fieldError(f)
    if (msg) out[f] = msg
  }
  return out
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // بار اول چک می‌کنیم آیا توکن معتبری داریم؛ اگه داشتیم پروفایل رو از بک‌اند می‌گیریم
  useEffect(() => {
    async function init() {
      const access = tokenStorage.getAccess()
      if (!access) {
        setIsLoading(false)
        return
      }
      try {
        const me = await apiGetMe()
        setUser(me)
      } catch {
        tokenStorage.clear()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  async function login(email: string, password: string): Promise<ActionResult> {
    try {
      const { user: loggedInUser, access, refresh } = await apiLogin(email, password)
      tokenStorage.set(access, refresh)
      setUser(loggedInUser)
      return { success: true, user: loggedInUser }
    } catch (err) {
      if (err instanceof ApiError) return { success: false, error: err.message }
      return { success: false, error: 'اتصال به سرور برقرار نشد. مطمئن شوید بک‌اند در حال اجراست.' }
    }
  }

  async function register(input: RegisterInput): Promise<ActionResult> {
    try {
      const { user: newUser, access, refresh } = await apiRegister(input)
      tokenStorage.set(access, refresh)
      setUser(newUser)
      return { success: true, user: newUser }
    } catch (err) {
      if (err instanceof ApiError) return { success: false, error: err.message, fieldErrors: extractFieldErrors(err) }
      return { success: false, error: 'اتصال به سرور برقرار نشد. مطمئن شوید بک‌اند در حال اجراست.' }
    }
  }

  async function registerArtist(input: RegisterArtistInput): Promise<ActionResult> {
    try {
      await apiRegisterArtist(input)
      // توجه: بک‌اند برای هنرمندِ در وضعیت pending توکن برنمی‌گردونه، پس اینجا لاگین نمی‌کنیم؛
      // هنرمند باید بعد از تأیید پشتیبان/مدیر، مثل بقیه از صفحه‌ی ورود وارد بشه.
      return { success: true }
    } catch (err) {
      if (err instanceof ApiError) return { success: false, error: err.message, fieldErrors: extractFieldErrors(err) }
      return { success: false, error: 'اتصال به سرور برقرار نشد. مطمئن شوید بک‌اند در حال اجراست.' }
    }
  }

  function logout() {
    setUser(null)
    tokenStorage.clear()
    router.push('/login')
  }

  async function updateUser(updates: Partial<Pick<User, 'displayName' | 'bio'>>): Promise<ActionResult> {
    if (!user) return { success: false, error: 'ابتدا وارد حساب کاربری شوید' }
    try {
      const updated = await apiPatchMe(updates)
      setUser(prev => (prev ? ({ ...prev, ...updated } as AuthUser) : updated))
      return { success: true, user: updated }
    } catch (err) {
      if (err instanceof ApiError) return { success: false, error: err.message }
      return { success: false, error: 'خطا در اتصال به سرور' }
    }
  }

  async function uploadAvatar(file: File): Promise<ActionResult> {
    if (!user) return { success: false, error: 'ابتدا وارد حساب کاربری شوید' }
    try {
      const updated = await apiUploadAvatar(file)
      setUser(prev => (prev ? ({ ...prev, ...updated } as AuthUser) : updated))
      return { success: true, user: updated }
    } catch (err) {
      if (err instanceof ApiError) return { success: false, error: err.message }
      return { success: false, error: 'خطا در اتصال به سرور' }
    }
  }

  async function deleteAccount(): Promise<ActionResult> {
    if (!user) return { success: false, error: 'ابتدا وارد حساب کاربری شوید' }
    try {
      await apiDeleteMe()
      setUser(null)
      tokenStorage.clear()
      return { success: true }
    } catch (err) {
      if (err instanceof ApiError) return { success: false, error: err.message }
      return { success: false, error: 'خطا در اتصال به سرور' }
    }
  }

  async function refreshUser() {
    try {
      const me = await apiGetMe()
      setUser(me)
    } catch {
      tokenStorage.clear()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isLoading,
        isLoggedIn: user !== null,
        login,
        register,
        registerArtist,
        logout,
        updateUser,
        uploadAvatar,
        deleteAccount,
        refreshUser,
      }}
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
