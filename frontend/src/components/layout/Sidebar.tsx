import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants'

const navItems = [
  { href: ROUTES.home,          label: 'خانه',         icon: '🏠' },
  { href: ROUTES.music,         label: 'موسیقی',        icon: '🎵' },
  { href: ROUTES.playlists,     label: 'پلی‌لیست‌ها',   icon: '📋' },
  { href: ROUTES.notifications, label: 'اعلانات',       icon: '🔔' },
  { href: ROUTES.settings,      label: 'تنظیمات',       icon: '⚙️' },
]

export default function Sidebar() {
  const router = useRouter()
  const { currentUser, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const extraItems =
    currentUser?.role === 'artist'
      ? [{ href: ROUTES.artistManage, label: 'مدیریت آثار', icon: '🎼' }]
      : currentUser?.role === 'admin' || currentUser?.role === 'support'
      ? [{ href: ROUTES.admin, label: 'داشبورد مدیریت', icon: '🛠️' }]
      : []

  function handleLogout() {
    setIsMobileOpen(false)
    logout()
  }

  const sidebarContent = (
    <aside
      className="flex h-full w-[240px] flex-col overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #EAF4FB 0%, #FDF8EF 100%)',
        borderInlineStart: '1px solid #DCE8F0',
      }}
    >
      {/* لوگو */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #DCE8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🎵</span>
          <span
            style={{
              fontSize: '22px', fontWeight: 800,
              background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            SoundWave
          </span>
        </div>
      </div>

      {/* ناوبری */}
      <nav style={{ padding: '20px 12px', flex: 1 }}>
        {[...navItems, ...extraItems].map((item) => {
          const isActive = router.pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '13px 16px', borderRadius: '14px', marginBottom: '6px',
                  color: isActive ? '#fff' : '#5A7A8C',
                  background: isActive ? 'linear-gradient(90deg, #4FA8D8, #7EC8E3)' : 'transparent',
                  fontWeight: isActive ? 700 : 500, fontSize: '15px',
                  boxShadow: isActive ? '0 4px 14px rgba(79,168,216,0.35)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* اطلاعات کاربر */}
      {/* توجه: paddingBottom اضافه اینجا عمداً هست چون نوار پخش‌کننده (پایین صفحه) با z-index بالاتر
          روی کل عرض صفحه (از جمله سایدبار) قرار می‌گیره؛ بدون این فاصله، دکمه‌ی خروج پشت اون نوار پنهان می‌شد. */}
      {currentUser && (
        <div style={{ padding: '16px', paddingBottom: '110px', borderTop: '1px solid #DCE8F0' }}>
          <Link
            href={ROUTES.profile(currentUser.username)}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', borderRadius: '14px',
                background: '#fff', border: '1px solid #DCE8F0', cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0, overflow: 'hidden',
                }}
              >
                {currentUser.avatarUrl
                  ? <img src={currentUser.avatarUrl} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  : '👤'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#3A4A55', fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          </Link>
          <button
            onClick={handleLogout}
            style={{
              marginTop: '8px', width: '100%', padding: '8px',
              background: 'transparent', border: '1px solid #DCE8F0',
              borderRadius: '10px', color: '#7A93A3', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            🚪 خروج از حساب
          </button>
        </div>
      )}
    </aside>
  )

  return (
    <>
      {/* ── دسکتاپ: سایدبار ثابت ── */}
      <div className="sticky top-0 hidden h-screen shadow-[2px_0_16px_rgba(135,180,210,0.15)] md:block">
        {sidebarContent}
      </div>

      {/* ── موبایل/تبلت: نوار بالا با دکمه منو ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
        style={{ background: '#FDF8EF', borderBottom: '1px solid #DCE8F0' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '22px' }}>🎵</span>
          <span
            style={{
              fontSize: '18px', fontWeight: 800,
              background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            SoundWave
          </span>
        </div>
        <button
          aria-label="باز کردن منو"
          onClick={() => setIsMobileOpen(true)}
          style={{
            fontSize: '22px', background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >
          ☰
        </button>
      </div>

      {/* ── موبایل: منوی کشویی ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* بک‌دراپ */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* پنل منو */}
          <div className="h-full w-[240px] shadow-2xl">
            <div className="flex items-center justify-end p-3">
              <button
                aria-label="بستن منو"
                onClick={() => setIsMobileOpen(false)}
                style={{ fontSize: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div onClick={() => setIsMobileOpen(false)}>{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  )
}
