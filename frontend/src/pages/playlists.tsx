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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#fff' }}>📋 پلی‌لیست‌های من</h1>
        <button onClick={() => setShowCreate(true)} style={{
          background: '#1DB954', color: '#000', border: 'none',
          padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          + پلی‌لیست جدید
        </button>
      </div>

      {showCreate && (
        <div style={{ background: '#1e1e1e', padding: '16px', borderRadius: '10px', marginBottom: '24px' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="نام پلی‌لیست..."
            style={{
              background: '#333', border: 'none', color: '#fff',
              padding: '10px 16px', borderRadius: '8px', marginLeft: '8px', width: '250px'
            }}
          />
          <button onClick={handleCreate} style={{
            background: '#1DB954', color: '#000', border: 'none',
            padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', marginLeft: '8px'
          }}>ایجاد</button>
          <button onClick={() => setShowCreate(false)} style={{
            background: '#333', color: '#fff', border: 'none',
            padding: '10px 16px', borderRadius: '8px', cursor: 'pointer'
          }}>انصراف</button>
        </div>
      )}

      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '80px' }}>
          <div style={{ fontSize: '48px' }}>🎵</div>
          <p>هنوز پلی‌لیستی نداری. یکی بساز!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playlists.map(pl => (
            <div key={pl.id} style={{
              background: '#1e1e1e', borderRadius: '10px',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '48px', height: '48px', background: '#333',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px'
              }}>🎵</div>

              <div style={{ flex: 1 }}>
                {editingId === pl.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{
                        background: '#333', border: 'none', color: '#fff',
                        padding: '6px 12px', borderRadius: '6px'
                      }}
                    />
                    <button onClick={() => handleRename(pl.id)} style={{
                      background: '#1DB954', color: '#000', border: 'none',
                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                    }}>ذخیره</button>
                    <button onClick={() => setEditingId(null)} style={{
                      background: '#333', color: '#fff', border: 'none',
                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                    }}>لغو</button>
                  </div>
                ) : (
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{pl.name}</div>
                )}
                <div style={{ color: '#b3b3b3', fontSize: '13px' }}>
                  {pl.songs.length} آهنگ
                </div>
              </div>

              <button onClick={() => { setEditingId(pl.id); setEditName(pl.name) }} style={{
                background: '#333', color: '#fff', border: 'none',
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
              }}>✏️</button>
              <button onClick={() => deletePlaylist(pl.id)} style={{
                background: '#c0392b', color: '#fff', border: 'none',
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer'
              }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}