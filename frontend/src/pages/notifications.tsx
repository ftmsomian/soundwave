import MainLayout from '@/components/layout/MainLayout'
import { mockNotifications } from '@/mock'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter(n => n.userId === currentUser?.id)
  )

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  function deleteNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unread = notifications.filter(n => !n.isRead)
  const read = notifications.filter(n => n.isRead)

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800 }}>اعلانات</h1>
        {unread.length > 0 && (
          <button onClick={markAllRead} style={{
            background: '#fff', color: '#4FA8D8', border: '1px solid #DCE8F0',
            padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600
          }}>
            ✓ خواندن همه
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#7A93A3', marginTop: '80px' }}>
          <div style={{ fontSize: '48px' }}>🔔</div>
          <p>اعلانی نداری!</p>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#7A93A3', fontSize: '14px', marginBottom: '14px', fontWeight: 700 }}>خوانده نشده</h2>
              {unread.map(n => (
                <NotifCard key={n.id} n={n} onDelete={deleteNotification} />
              ))}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 style={{ color: '#7A93A3', fontSize: '14px', marginBottom: '14px', fontWeight: 700 }}>خوانده شده</h2>
              {read.map(n => (
                <NotifCard key={n.id} n={n} onDelete={deleteNotification} />
              ))}
            </section>
          )}
        </>
      )}
    </MainLayout>
  )
}

function NotifCard({ n, onDelete }: { n: Notification, onDelete: (id: string) => void }) {
  return (
    <div style={{
      background: n.isRead ? '#fff' : '#EAF4FB',
      border: n.isRead ? '1px solid #E3EEF5' : '1px solid #B8DCF0',
      borderRadius: '14px', padding: '16px 20px',
      marginBottom: '10px', display: 'flex', gap: '16px', alignItems: 'flex-start',
      boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
    }}>
      <div style={{ fontSize: '22px' }}>
        {n.type === 'new_release' ? '🎵' : n.type === 'subscription_expiring' ? '⚠️' : '📢'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#2B3A45', fontWeight: 700, marginBottom: '4px' }}>{n.title}</div>
        <div style={{ color: '#7A93A3', fontSize: '14px' }}>{n.message}</div>
      </div>
      <button onClick={() => onDelete(n.id)} style={{
        background: 'transparent', color: '#A0AEB8', border: 'none',
        fontSize: '18px', cursor: 'pointer', padding: '4px'
      }}>✕</button>
    </div>
  )
}