import Head from 'next/head'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layout/MainLayout'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { usePlayer } from '@/context/PlayerContext'
import Link from 'next/link'
import { ROUTES } from '@/constants'
import { formatDuration } from '@/utils'

export default function PlaylistDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { playlists, removeSongFromPlaylist } = usePlaylistContext()
  const player = usePlayer()

  const playlist = playlists.find(p => p.id === id)

  if (!playlist) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', color: '#7A93A3', marginTop: '80px' }}>
          <div style={{ fontSize: '48px' }}>😕</div>
          <p>پلی‌لیست پیدا نشد</p>
          <Link href={ROUTES.playlists} style={{ color: '#4FA8D8' }}>بازگشت به پلی‌لیست‌ها</Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <>
      <Head><title>{playlist.name} | SoundWave</title></Head>
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '36px', flexWrap: 'wrap' }}>
          <div style={{
            width: '160px', height: '160px', borderRadius: '20px', flexShrink: 0,
            background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px',
          }}>🎵</div>
          <div>
            <h1 style={{ color: '#2B3A45', fontSize: '32px', fontWeight: 800 }}>{playlist.name}</h1>
            <p style={{ color: '#7A93A3', marginTop: '8px' }}>{playlist.songs.length} آهنگ</p>
            {playlist.songs.length > 0 && (
              <button
                onClick={() => player.playSong(playlist.songs[0], playlist.songs)}
                style={{
                  marginTop: '16px', background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)',
                  color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '24px',
                  cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
                }}
              >▶ پخش همه</button>
            )}
          </div>
        </div>

        {playlist.songs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#7A93A3', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
            <p>این پلی‌لیست خالی است. از صفحه موسیقی آهنگ اضافه کن!</p>
          </div>
        ) : (
          <div>
            {playlist.songs.map((song, index) => (
              <div key={song.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 18px', borderRadius: '14px', background: '#fff',
                marginBottom: '10px', border: '1px solid #E3EEF5',
                boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
              }}>
                <div style={{ color: '#A0AEB8', width: '24px', textAlign: 'center' }}>{index + 1}</div>
                <img src={song.coverUrl} width={46} height={46} style={{ borderRadius: '10px', objectFit: 'cover' }} alt={song.title} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#2B3A45', fontWeight: 700 }}>{song.title}</div>
                  <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
                </div>
                <div style={{ color: '#A0AEB8', fontSize: '13px' }}>{formatDuration(song.duration)}</div>
                <button
                  onClick={() => player.playSong(song, playlist.songs)}
                  style={{
                    background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff', border: 'none',
                    padding: '7px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
                  }}
                >▶</button>
                <button
                  onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                  style={{
                    background: '#FFF0F0', color: '#E05C5C', border: 'none',
                    padding: '7px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </MainLayout>
    </>
  )
}
