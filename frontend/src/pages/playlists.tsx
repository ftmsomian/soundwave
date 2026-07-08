import Head from 'next/head'
import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import PlaylistCard from '@/components/playlist/PlaylistCard'
import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { useAuth } from '@/context/AuthContext'
import { SUBSCRIPTION_LIMITS } from '@/constants'

export default function PlaylistsPage() {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlaylistContext()
  const { currentUser } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [modalError, setModalError] = useState('')

  const limits = currentUser ? SUBSCRIPTION_LIMITS[currentUser.subscription] : null
  const maxPlaylists = limits?.maxPlaylists

  function handleCreate(name: string) {
    const result = createPlaylist(name)
    if (!result.success) {
      setModalError(result.error ?? 'خطا در ایجاد پلی‌لیست')
    } else {
      setShowModal(false)
      setModalError('')
    }
  }

  return (
    <>
      <Head><title>پلی‌لیست‌ها | SoundWave</title></Head>
      {showModal && (
        <CreatePlaylistModal
          onConfirm={handleCreate}
          onClose={() => { setShowModal(false); setModalError('') }}
          error={modalError}
        />
      )}
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800 }}>پلی‌لیست‌ها</h1>
            {maxPlaylists !== null && (
              <p style={{ color: '#7A93A3', fontSize: '13px', marginTop: '4px' }}>
                {playlists.length} از {maxPlaylists} پلی‌لیست
              </p>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff',
              border: 'none', padding: '12px 24px', borderRadius: '24px',
              cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
            }}
          >
            + پلی‌لیست جدید
          </button>
        </div>

        {playlists.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#7A93A3', marginTop: '80px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎵</div>
            <h2 style={{ color: '#2B3A45', marginBottom: '8px' }}>هنوز پلی‌لیستی نداری</h2>
            <p>اولین پلی‌لیست خود را بساز!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {playlists.map(pl => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onDelete={deletePlaylist}
                onRename={renamePlaylist}
              />
            ))}
          </div>
        )}
      </MainLayout>
    </>
  )
}
