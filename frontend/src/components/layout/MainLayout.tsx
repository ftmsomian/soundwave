import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#181818',
      color: '#fff',
      fontFamily: 'Vazirmatn, Tahoma, sans-serif',
      direction: 'rtl',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  )
}