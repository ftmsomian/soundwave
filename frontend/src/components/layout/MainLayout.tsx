import Sidebar from './Sidebar'
import { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#FDF8EF',
      color: '#2B3A45',
      fontFamily: 'Vazirmatn, Tahoma, sans-serif',
      direction: 'rtl',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: '40px 48px',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #EAF4FB 0%, #FDF8EF 100%)',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}