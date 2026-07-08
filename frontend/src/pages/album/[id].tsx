import Head from 'next/head'
import MainLayout from '@/components/layout/MainLayout'
import { mockAlbums } from '@/mock'
import { useRouter } from 'next/router'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { usePlayer } from '@/context/PlayerContext'
import { useState } from 'react'

export default function AlbumPage() {
  const router = useRouter()
  const { id } = router.query
  const album = mockAlbums.find(a => a.id === id)
  const { playlists, addSongToPlaylist } = usePlaylistContext()
  const player = usePlayer()
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
    <>
      <Head><title>{album.title} | SoundWave</title></Head>
      <MainLayout>
        {/* هدر آلبوم */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '44px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <img src={album.coverUrl} width={200} height={200} alt={album.title}
            style={{ borderRadius: '20px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(135,180,210,0.25)' }} />
          <div>
            <div style={{ color: '#7A93A3', fontSize: '14px', fontWeight: 600 }}>آلبوم</div>
            <h1 style={{ color: '#2B3A45', fontSize: '36px', margin: '8px 0', fontWeight: 800 }}>{album.title}</h1>
            <div style={{ color: '#7A93A3' }}>{album.artistName} • {album.releaseYear} • {album.songs.length} آهنگ</div>
            <div style={{
              color: '#4FA8D8', fontSize: '13px', marginTop: '8px', fontWeight: 600,
              background: '#EAF4FB', padding: '4px 12px', borderRadius: '20px', display: 'inline-block',
            }}>
              {album.streamCount.toLocaleString('fa-IR')} پخش
            </div>
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => album.songs[0] && player.playSong(album.songs[0], album.songs)}
                style={{
                  background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff',
                  border: 'none', padding: '10px 24px', borderRadius: '24px',
                  cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
                }}
              >▶ پخش آلبوم</button>
            </div>
          </div>
        </div>

        {/* لیست آهنگ‌ها */}
        <div>
          {album.songs.map((song, index) => (
            <div key={song.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 18px', borderRadius: '14px', background: '#fff',
              marginBottom: '10px', position: 'relative', border: '1px solid #E3EEF5',
              boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
            }}>
              <div style={{ color: '#A0AEB8', width: '24px', textAlign: 'center', fontWeight: 600 }}>{index + 1}</div>
              <img src={song.coverUrl} width={46} height={46} style={{ borderRadius: '10px', objectFit: 'cover' }} alt={song.title} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#2B3A45', fontWeight: 700 }}>{song.title}</div>
                <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
              </div>
              <div style={{ color: '#A0AEB8', fontSize: '13px' }}>
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => player.playSong(song, album.songs)}
                style={{
                  background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff', border: 'none',
                  padding: '7px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
                }}
              >▶</button>
              <button
                onClick={() => setMenuSongId(menuSongId === song.id ? null : song.id)}
                style={{
                  background: '#EAF4FB', color: '#4FA8D8', border: 'none',
                  padding: '7px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
                }}
              >+ پلی‌لیست</button>

              {menuSongId === song.id && (
                <div style={{
                  position: 'absolute', left: '18px', top: '60px', background: '#fff', borderRadius: '12px',
                  padding: '8px', zIndex: 10, minWidth: '160px', boxShadow: '0 8px 24px rgba(135,180,210,0.25)',
                  border: '1px solid #E3EEF5',
                }}>
                  {playlists.length === 0
                    ? <div style={{ color: '#7A93A3', padding: '8px', fontSize: '13px' }}>پلی‌لیستی نداری</div>
                    : playlists.map(pl => (
                      <div key={pl.id}
                        onClick={() => { addSongToPlaylist(pl.id, song); setMenuSongId(null) }}
                        style={{ color: '#2B3A45', padding: '9px 12px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px' }}
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
    </>
  )
}
