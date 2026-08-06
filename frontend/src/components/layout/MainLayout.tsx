import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{
        background: '#FDF8EF',
        color: '#2B3A45',
        fontFamily: 'Vazirmatn, Tahoma, sans-serif',
        direction: 'rtl',
      }}
    >
      <Sidebar />
      <main
        className="px-4 py-6 md:px-12 md:py-10"
        style={{
          flex: 1,
          paddingBottom: '120px', // فضا برای music player ثابت پایین (فقط وقتی کاربر لاگین است نمایش داده می‌شود)
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #EAF4FB 0%, #FDF8EF 100%)',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  )
}
