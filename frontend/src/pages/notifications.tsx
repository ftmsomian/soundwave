import MainLayout from '@/components/layout/MainLayout'
import { mockNotifications } from '@/mock'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.filter(n => n.userId === user?.id)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#fff' }}>🔔 اعلانات</h1>
        {unread.length > 0 && (
          <button onClick={markAllRead} style={{
            background: '#333', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '20px', cursor: 'pointer'
          }}>
            ✓ خواندن همه
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '80px' }}>
          <div style={{ fontSize: '48px' }}>🔔</div>
          <p>اعلانی نداری!</p>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#b3b3b3', fontSize: '14px', marginBottom: '12px' }}>خوانده نشده</h2>
              {unread.map(n => (
                <NotifCard key={n.id} n={n} onDelete={deleteNotification} />
              ))}
            </section>
          )}
          {read.length > 0 && (
            <section>
              <h2 style={{ color: '#b3b3b3', fontSize: '14px', marginBottom: '12px' }}>خوانده شده</h2>
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
      background: n.isRead ? '#1a1a1a' : '#1e2a1e',
      border: n.isRead ? '1px solid #282828' : '1px solid #1DB954',
      borderRadius: '10px', padding: '16px 20px',
      marginBottom: '10px', display: 'flex', gap: '16px', alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: '24px' }}>
        {n.type === 'new_release' ? '🎵' : n.type === 'subscription_expiring' ? '⚠️' : '📢'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>{n.title}</div>
        <div style={{ color: '#b3b3b3', fontSize: '14px' }}>{n.message}</div>
      </div>
      <button onClick={() => onDelete(n.id)} style={{
        background: 'transparent', color: '#666', border: 'none',
        fontSize: '18px', cursor: 'pointer', padding: '4px'
      }}>✕</button>
    </div>
  )
}