import MainLayout from '@/components/layout/MainLayout'
import { mockAlbums } from '@/mock'
import { useRouter } from 'next/router'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { useState } from 'react'

export default function AlbumPage() {
  const router = useRouter()
  const { id } = router.query
  const album = mockAlbums.find(a => a.id === id)
  const { playlists, addSongToPlaylist } = usePlaylistContext()
  const [menuSongId, setMenuSongId] = useState<string | null>(null)

  if (!album) return (
    <MainLayout>
      <div style={{ color: '#7A93A3', textAlign: 'center', marginTop: '80px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <p>آلبوم پیدا نشد</p>
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <div style={{ display: 'flex', gap: '32px', marginBottom: '44px', alignItems: 'flex-end' }}>
        <img src={album.coverUrl} width={200} height={200}
          style={{ borderRadius: '20px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(135,180,210,0.25)' }} />
        <div>
          <div style={{ color: '#7A93A3', fontSize: '14px', fontWeight: 600 }}>آلبوم</div>
          <h1 style={{ color: '#2B3A45', fontSize: '36px', margin: '8px 0', fontWeight: 800 }}>{album.title}</h1>
          <div style={{ color: '#7A93A3' }}>{album.artistName} • {album.releaseYear} • {album.songs.length} آهنگ</div>
          <div style={{
            color: '#4FA8D8', fontSize: '13px', marginTop: '8px', fontWeight: 600,
            background: '#EAF4FB', padding: '4px 12px', borderRadius: '20px', display: 'inline-block',
          }}>
            {album.streamCount.toLocaleString()} پخش
          </div>
        </div>
      </div>

      <div>
        {album.songs.map((song, index) => (
          <div key={song.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '12px 18px', borderRadius: '14px',
            background: '#fff', marginBottom: '10px', position: 'relative',
            border: '1px solid #E3EEF5',
            boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
          }}>
            <div style={{ color: '#A0AEB8', width: '24px', textAlign: 'center', fontWeight: 600 }}>{index + 1}</div>
            <img src={song.coverUrl} width={46} height={46}
              style={{ borderRadius: '10px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#2B3A45', fontWeight: 700 }}>{song.title}</div>
              <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
            </div>
            <div style={{ color: '#A0AEB8', fontSize: '13px' }}>
              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
            </div>
            <button onClick={() => setMenuSongId(menuSongId === song.id ? null : song.id)} style={{
              background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff', border: 'none',
              padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
            }}>+ پلی‌لیست</button>

            {menuSongId === song.id && (
              <div style={{
                position: 'absolute', left: '18px', top: '60px',
                background: '#fff', borderRadius: '12px', padding: '8px',
                zIndex: 10, minWidth: '160px', boxShadow: '0 8px 24px rgba(135,180,210,0.25)',
                border: '1px solid #E3EEF5',
              }}>
                {playlists.length === 0
                  ? <div style={{ color: '#7A93A3', padding: '8px' }}>پلی‌لیستی نداری</div>
                  : playlists.map(pl => (
                    <div key={pl.id}
                      onClick={() => { addSongToPlaylist(pl.id, song); setMenuSongId(null) }}
                      style={{
                        color: '#2B3A45', padding: '9px 12px', cursor: 'pointer',
                        borderRadius: '8px', fontSize: '14px'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#EAF4FB')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >{pl.name}</div>
                  ))
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </MainLayout>
  )
}