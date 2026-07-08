import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layout/MainLayout'
import { mockNotifications } from '@/mock'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants'
import type { Notification } from '@/types'

function NotifCard({ n, onDelete, onMarkRead }: { n: Notification; onDelete: (id: string) => void; onMarkRead: (id: string) => void }) {
  const icon =
    n.type === 'new_release' ? '🎵'
    : n.type === 'subscription_expiring' ? '⚠️'
    : n.type === 'artist_approved' ? '✅'
    : n.type === 'artist_rejected' ? '❌'
    : '📢'

  return (
    <div style={{
      background: n.isRead ? '#fff' : '#EAF4FB',
      border: n.isRead ? '1px solid #E3EEF5' : '1px solid #B8DCF0',
      borderRadius: '14px', padding: '16px 20px', marginBottom: '10px',
      display: 'flex', gap: '16px', alignItems: 'flex-start',
      boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
    }}>
      <div style={{ fontSize: '22px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#2B3A45', fontWeight: 700, marginBottom: '4px' }}>{n.title}</div>
        <div style={{ color: '#7A93A3', fontSize: '14px' }}>{n.message}</div>
        <div style={{ color: '#A0AEB8', fontSize: '11px', marginTop: '6px' }}>
          {new Date(n.createdAt).toLocaleDateString('fa-IR')}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {!n.isRead && (
          <button
            onClick={() => onMarkRead(n.id)}
            style={{
              background: 'transparent', color: '#4FA8D8', border: 'none',
              fontSize: '13px', cursor: 'pointer', padding: '4px', lineHeight: 1,
              fontWeight: 700, whiteSpace: 'nowrap',
            }}
            title="علامت‌گذاری به عنوان خوانده شده"
          >✓ خوانده شد</button>
        )}
        <button
          onClick={() => onDelete(n.id)}
          style={{
            background: 'transparent', color: '#A0AEB8', border: 'none',
            fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1,
          }}
          title="حذف اعلان"
        >✕</button>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push(ROUTES.login)
      return
    }
    if (currentUser) {
      // نمایش همه‌ی اعلانات کاربر جاری (یا اگه اعلانی برایش نبود، همه رو نشان می‌دهیم)
      const mine = mockNotifications.filter(n => n.userId === currentUser.id)
      setNotifications(mine.length > 0 ? mine : mockNotifications)
    }
  }, [currentUser, isLoading, router])

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  function markAsRead(id: string) {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)))
  }

  function deleteNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unread = notifications.filter(n => !n.isRead)
  const read   = notifications.filter(n => n.isRead)

  return (
    <>
      <Head><title>اعلانات | SoundWave</title></Head>
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800 }}>اعلانات</h1>
            {unread.length > 0 && (
              <p style={{ color: '#7A93A3', fontSize: '13px', marginTop: '4px' }}>
                {unread.length} اعلان خوانده‌نشده
              </p>
            )}
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: '#fff', color: '#4FA8D8', border: '1px solid #DCE8F0',
                padding: '10px 20px', borderRadius: '20px', cursor: 'pointer',
                fontWeight: 600, fontFamily: 'inherit',
              }}
            >✓ خواندن همه</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#7A93A3', marginTop: '80px' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🔔</div>
            <p>اعلانی نداری!</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ color: '#7A93A3', fontSize: '13px', marginBottom: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  خوانده نشده ({unread.length})
                </h2>
                {unread.map(n => <NotifCard key={n.id} n={n} onDelete={deleteNotification} onMarkRead={markAsRead} />)}
              </section>
            )}
            {read.length > 0 && (
              <section>
                <h2 style={{ color: '#7A93A3', fontSize: '13px', marginBottom: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  خوانده شده ({read.length})
                </h2>
                {read.map(n => <NotifCard key={n.id} n={n} onDelete={deleteNotification} onMarkRead={markAsRead} />)}
              </section>
            )}
          </>
        )}
      </MainLayout>
    </>
  )
}
