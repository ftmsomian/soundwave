import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { href: '/', label: 'خانه', icon: '🏠' },
  { href: '/music', label: 'موسیقی', icon: '🎵' },
  { href: '/playlists', label: 'پلی‌لیست‌ها', icon: '📋' },
  { href: '/notifications', label: 'اعلانات', icon: '🔔' },
]

export default function Sidebar() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#121212',
      borderRight: '1px solid #282828',
      padding: '24px 0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '0 16px 24px', borderBottom: '1px solid #282828' }}>
        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#1DB954' }}>
          🎵 SoundWave
        </span>
      </div>

      <nav style={{ padding: '16px 8px', flex: 1 }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '4px',
            textDecoration: 'none',
            color: router.pathname === item.href ? '#fff' : '#b3b3b3',
            background: router.pathname === item.href ? '#282828' : 'transparent',
            fontWeight: router.pathname === item.href ? 'bold' : 'normal',
          }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {user && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #282828',
          color: '#b3b3b3',
          fontSize: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span>
            <span>{user.displayName}</span>
          </div>
          <div style={{
            marginTop: '4px',
            fontSize: '12px',
            color: user.subscription === 'gold' ? '#FFD700' : user.subscription === 'silver' ? '#C0C0C0' : '#666'
          }}>
            {user.subscription === 'gold' ? '⭐ طلایی' : user.subscription === 'silver' ? '🥈 نقره‌ای' : 'رایگان'}
          </div>
        </div>
      )}
    </aside>
  )
}