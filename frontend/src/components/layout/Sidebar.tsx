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
  const { currentUser } = useAuth()

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #EAF4FB 0%, #FDF8EF 100%)',
      borderRight: '1px solid #DCE8F0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 16px rgba(135,180,210,0.15)',
    }}>
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #DCE8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🎵</span>
          <span style={{
            fontSize: '22px',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>SoundWave</span>
        </div>
      </div>

      <nav style={{ padding: '20px 12px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = router.pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '13px 16px',
                borderRadius: '14px',
                marginBottom: '6px',
                color: isActive ? '#fff' : '#5A7A8C',
                background: isActive ? 'linear-gradient(90deg, #4FA8D8, #7EC8E3)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '15px',
                boxShadow: isActive ? '0 4px 14px rgba(79,168,216,0.35)' : 'none',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {currentUser && (
        <div style={{ padding: '16px', borderTop: '1px solid #DCE8F0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: '14px',
            background: '#fff', border: '1px solid #DCE8F0',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>
              {currentUser.avatarUrl
                ? <img src={currentUser.avatarUrl} width={40} height={40} style={{ borderRadius: '50%' }} />
                : '👤'}
            </div>
            <div>
              <div style={{ color: '#3A4A55', fontSize: '14px', fontWeight: 600 }}>
                {currentUser.displayName}
              </div>
              <div style={{
                fontSize: '11px', marginTop: '2px', fontWeight: 600,
                color: currentUser.subscription === 'gold' ? '#D4A017'
                  : currentUser.subscription === 'silver' ? '#7A8A95' : '#A0AEB8',
              }}>
                {currentUser.subscription === 'gold' ? '⭐ طلایی'
                  : currentUser.subscription === 'silver' ? '🥈 نقره‌ای' : 'رایگان'}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}