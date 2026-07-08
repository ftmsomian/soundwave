import { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#FDF8EF',
        color: '#2B3A45',
        fontFamily: 'Vazirmatn, Tahoma, sans-serif',
        direction: 'rtl',
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: '40px 48px',
          paddingBottom: '120px', // فضا برای music player ثابت پایین
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
