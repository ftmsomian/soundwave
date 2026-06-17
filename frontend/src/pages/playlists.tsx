import MainLayout from '@/components/layout/MainLayout'
import { usePlaylists } from '@/hooks/usePlaylists'
import { useState } from 'react'

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlaylists()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function handleCreate() {
    if (!newName.trim()) return
    createPlaylist(newName.trim())
    setNewName('')
    setShowCreate(false)
  }

  function handleRename(id: string) {
    if (!editName.trim()) return
    renamePlaylist(id, editName.trim())
    setEditingId(null)
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800 }}>پلی‌لیست‌های من</h1>
        <button onClick={() => setShowCreate(true)} style={{
          background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)',
          color: '#fff', border: 'none', padding: '11px 22px',
          borderRadius: '24px', cursor: 'pointer', fontWeight: 700,
          boxShadow: '0 4px 14px rgba(79,168,216,0.35)',
        }}>
          + پلی‌لیست جدید
        </button>
      </div>

      {showCreate && (
        <div style={{
          background: '#fff', padding: '20px', borderRadius: '16px',
          marginBottom: '28px', border: '1px solid #E3EEF5',
          boxShadow: '0 2px 10px rgba(135,180,210,0.1)',
        }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="نام پلی‌لیست..."
            style={{
              background: '#EAF4FB', border: '1px solid #DCE8F0', color: '#2B3A45',
              padding: '10px 16px', borderRadius: '10px', marginLeft: '8px', width: '250px'
            }}
          />
          <button onClick={handleCreate} style={{
            background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff', border: 'none',
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', marginLeft: '8px', fontWeight: 700
          }}>ایجاد</button>
          <button onClick={() => setShowCreate(false)} style={{
            background: '#F0F0F0', color: '#5A7A8C', border: 'none',
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer'
          }}>انصراف</button>
        </div>
      )}

      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#7A93A3', marginTop: '80px' }}>
          <div style={{ fontSize: '48px' }}>🎵</div>
          <p>هنوز پلی‌لیستی نداری. یکی بساز!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {playlists.map(pl => (
            <div key={pl.id} style={{
              background: '#fff', borderRadius: '16px',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
              border: '1px solid #E3EEF5',
              boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
            }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px', flexShrink: 0,
              }}>🎵</div>

              <div style={{ flex: 1 }}>
                {editingId === pl.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{
                        background: '#EAF4FB', border: '1px solid #DCE8F0', color: '#2B3A45',
                        padding: '6px 12px', borderRadius: '8px'
                      }}
                    />
                    <button onClick={() => handleRename(pl.id)} style={{
                      background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff', border: 'none',
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700
                    }}>ذخیره</button>
                    <button onClick={() => setEditingId(null)} style={{
                      background: '#F0F0F0', color: '#5A7A8C', border: 'none',
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer'
                    }}>لغو</button>
                  </div>
                ) : (
                  <div style={{ color: '#2B3A45', fontWeight: 700 }}>{pl.name}</div>
                )}
                <div style={{ color: '#7A93A3', fontSize: '13px' }}>{pl.songs.length} آهنگ</div>
              </div>

              <button onClick={() => { setEditingId(pl.id); setEditName(pl.name) }} style={{
                background: '#EAF4FB', color: '#4FA8D8', border: 'none',
                padding: '8px 14px', borderRadius: '10px', cursor: 'pointer'
              }}>✏️</button>
              <button onClick={() => deletePlaylist(pl.id)} style={{
                background: '#FDEAEA', color: '#D9534F', border: 'none',
                padding: '8px 14px', borderRadius: '10px', cursor: 'pointer'
              }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}