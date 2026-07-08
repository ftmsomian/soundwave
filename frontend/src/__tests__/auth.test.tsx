/**
 * تست‌های صفحات auth
 * اجرا: npm test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

// ── موک‌های لازم ──────────────────────────────────────────
jest.mock('next/router', () => ({ useRouter: jest.fn() }))

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    currentUser: null,
    isLoading: false,
    isLoggedIn: false,
    login: (email: string, password: string) => {
      if (email === 'user.free@test.com' && password === 'test123')
        return { success: true }
      return { success: false, error: 'ایمیل یا رمز عبور اشتباه است' }
    },
    logout: jest.fn(),
    updateUser: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}))

jest.mock('@/mock', () => ({
  getFromStorage: () => [],
  setToStorage:   jest.fn(),
  allMockUsers:   [],
  mockPlaylists:  [],
}))

// ── ایمپورت کامپوننت‌ها ───────────────────────────────────
import LoginForm         from '@/components/auth/LoginForm'
import RegisterForm      from '@/components/auth/RegisterForm'
import ArtistRegisterForm from '@/components/auth/ArtistRegisterForm'

// ── راه‌اندازی router ────────────────────────────────────
beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    query: {},
    pathname: '/login',
    isReady: true,
  })
})

// ═══════════════════════════════════════════════════════════
// LoginForm — ۵ تست
// ═══════════════════════════════════════════════════════════
describe('LoginForm', () => {
  test('۱. صفحه ورود رندر می‌شود', () => {
    render(<LoginForm />)
    expect(screen.getByRole('heading', { name: 'ورود' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument()
  })

  test('۲. اگر فیلدها خالی باشند، خطا نمایش داده می‌شود', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /ورود/i }))
    await waitFor(() => {
      expect(screen.getByText('ایمیل الزامی است')).toBeInTheDocument()
    })
  })

  test('۳. ایمیل نامعتبر خطا نشان می‌دهد', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'invalid-email')
    fireEvent.click(screen.getByRole('button', { name: /ورود/i }))
    await waitFor(() => {
      expect(screen.getByText('فرمت ایمیل نادرست است')).toBeInTheDocument()
    })
  })

  test('۴. اطلاعات اشتباه پیام خطا نشان می‌دهد', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'wrong@test.com')
    await userEvent.type(screen.getByPlaceholderText('رمز عبور'), 'wrongpass')
    fireEvent.click(screen.getByRole('button', { name: /ورود/i }))
    await waitFor(() => {
      expect(screen.getByText('ایمیل یا رمز عبور اشتباه است')).toBeInTheDocument()
    })
  })

  test('۵. لینک فراموشی رمز عبور وجود دارد', () => {
    render(<LoginForm />)
    expect(screen.getByText('رمز عبور را فراموش کردید؟')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════
// RegisterForm — ۳ تست
// ═══════════════════════════════════════════════════════════
describe('RegisterForm', () => {
  test('۶. فرم ثبت‌نام رندر می‌شود', () => {
    render(<RegisterForm />)
    expect(screen.getByPlaceholderText('مثلاً: علی رضایی')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('حداقل ۶ کاراکتر')).toBeInTheDocument()
  })

  test('۷. رمز عبور ناهمخوان خطا نشان می‌دهد', async () => {
    render(<RegisterForm />)
    const passInputs = screen.getAllByPlaceholderText(/کاراکتر/)
    await userEvent.type(passInputs[0], 'pass123')
    await userEvent.type(screen.getByPlaceholderText('رمز عبور را تکرار کنید'), 'pass456')
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام/i }))
    await waitFor(() => {
      expect(screen.getByText('رمزها یکسان نیستند')).toBeInTheDocument()
    })
  })

  test('۸. اگر جنسیت انتخاب نشده باشد، خطا نشان می‌دهد', async () => {
    render(<RegisterForm />)
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام/i }))
    await waitFor(() => {
      expect(screen.getByText('جنسیت الزامی است')).toBeInTheDocument()
    })
  })
})

// ═══════════════════════════════════════════════════════════
// ArtistRegisterForm — ۲ تست
// ═══════════════════════════════════════════════════════════
describe('ArtistRegisterForm', () => {
  test('۹. فرم ثبت‌نام هنرمند رندر می‌شود', () => {
    render(<ArtistRegisterForm />)
    expect(screen.getByPlaceholderText('مثلاً: شجریان')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument()
  })

  test('۱۰. اگر لینک نمونه‌کار خالی باشد، خطا نشان می‌دهد', async () => {
    render(<ArtistRegisterForm />)
    await userEvent.type(screen.getByPlaceholderText('مثلاً: شجریان'), 'هنرمند تست')
    await userEvent.type(screen.getByPlaceholderText('artist@email.com'), 'artist@test.com')
    await userEvent.type(screen.getByPlaceholderText('حداقل ۶ کاراکتر'), 'pass123')
    // لینک نمونه‌کار را خالی می‌گذاریم
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام/i }))
    await waitFor(() => {
      expect(screen.getByText('لینک نمونه‌کار الزامی است')).toBeInTheDocument()
    })
  })
})
