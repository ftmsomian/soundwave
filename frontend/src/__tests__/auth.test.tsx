/**
 * تست‌های صفحات Auth
 * اجرا: npm test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mock های لازم ───────────────────────────────────────────
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), query: {}, back: jest.fn() }),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: (email: string, password: string) => {
      if (email === 'ali@test.com' && password === '123456') return { success: true }
      return { success: false, error: 'ایمیل یا رمز عبور اشتباه است' }
    },
    logout: jest.fn(),
    updateUser: jest.fn(),
  }),
}))

jest.mock('@/mock', () => ({
  getFromStorage: () => [],
  setToStorage: jest.fn(),
}))

// ─── Import کامپوننت‌ها ───────────────────────────────────────
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

// ═════════════════════════════════════════════════════════════
//  تست ۱: رندر صفحه لاگین
// ═════════════════════════════════════════════════════════════
describe('LoginForm', () => {
  test('صفحه لاگین رندر می‌شود', () => {
    render(<LoginForm />)
    expect(screen.getByText('ورود')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument()
  })

  // ─── تست ۲: validation فیلد خالی ───────────────────────────
  test('با فیلد خالی خطا نشان می‌دهد', async () => {
    render(<LoginForm />)
    const submitBtn = screen.getByRole('button', { name: /ورود/i })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(screen.getByText('ایمیل الزامی است')).toBeInTheDocument()
    })
  })

  // ─── تست ۳: validation فرمت ایمیل ──────────────────────────
  test('با ایمیل نامعتبر خطا نشان می‌دهد', async () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('example@email.com')
    await userEvent.type(emailInput, 'invalid-email')
    fireEvent.click(screen.getByRole('button', { name: /ورود/i }))
    await waitFor(() => {
      expect(screen.getByText('فرمت ایمیل نادرست است')).toBeInTheDocument()
    })
  })

  // ─── تست ۴: اطلاعات اشتباه ──────────────────────────────────
  test('با اطلاعات اشتباه پیام خطا نشان می‌دهد', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'wrong@test.com')
    await userEvent.type(screen.getByPlaceholderText('رمز عبور'), 'wrongpass')
    fireEvent.click(screen.getByRole('button', { name: /ورود/i }))
    await waitFor(() => {
      expect(screen.getByText('ایمیل یا رمز عبور اشتباه است')).toBeInTheDocument()
    })
  })

  // ─── تست ۵: لینک فراموشی رمز وجود دارد ─────────────────────
  test('لینک فراموشی رمز وجود دارد', () => {
    render(<LoginForm />)
    expect(screen.getByText('رمز عبور را فراموش کردید؟')).toBeInTheDocument()
  })
})

// ═════════════════════════════════════════════════════════════
//  تست ۶: رندر صفحه ثبت‌نام
// ═════════════════════════════════════════════════════════════
describe('RegisterForm', () => {
  test('صفحه ثبت‌نام رندر می‌شود', () => {
    render(<RegisterForm />)
    expect(screen.getByText('ثبت‌نام')).toBeInTheDocument()
  })

  // ─── تست ۷: فیلدهای ثبت‌نام وجود دارند ─────────────────────
  test('همه فیلدهای لازم وجود دارند', () => {
    render(<RegisterForm />)
    expect(screen.getByPlaceholderText('مثلاً: علی رضایی')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('حداقل ۶ کاراکتر')).toBeInTheDocument()
  })

  // ─── تست ۸: validation تطابق رمز ───────────────────────────
  test('عدم تطابق رمز عبور خطا می‌دهد', async () => {
    render(<RegisterForm />)
    const inputs = screen.getAllByPlaceholderText(/کاراکتر/)
    await userEvent.type(inputs[0], 'pass123')
    await userEvent.type(screen.getByPlaceholderText('رمز عبور را تکرار کنید'), 'pass456')
    fireEvent.click(screen.getByRole('button', { name: /ثبت‌نام/i }))
    await waitFor(() => {
      expect(screen.getByText('رمزها یکسان نیستند')).toBeInTheDocument()
    })
  })
})
