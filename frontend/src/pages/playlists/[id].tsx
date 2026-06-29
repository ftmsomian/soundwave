import MainLayout from '@/components/layout/MainLayout'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function PlaylistDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { playlists } = usePlaylistContext()
  const playlist = playlists.find(p => p.id === id)

  if (!playlist) return (
    <MainLayout>
      <div style={{ color: '#7A93A3', textAlign: 'center', marginTop: '80px' }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <p>پلی‌لیست پیدا نشد</p>
        <Link href="/playlists" style={{ color: '#4FA8D8' }}>بازگشت به پلی‌لیست‌ها</Link>
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <div style={{ display: 'flex', gap: '32px', marginBottom: '44px', alignItems: 'flex-end' }}>
        <div style={{
          width: '200px', height: '200px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '64px', boxShadow: '0 8px 24px rgba(135,180,210,0.25)',
        }}>🎵</div>
        <div>
          <div style={{ color: '#7A93A3', fontSize: '14px', fontWeight: 600 }}>پلی‌لیست</div>
          <h1 style={{ color: '#2B3A45', fontSize: '36px', margin: '8px 0', fontWeight: 800 }}>
            {playlist.name}
          </h1>
          <div style={{ color: '#7A93A3' }}>{playlist.songs.length} آهنگ</div>
        </div>
      </div>

      {playlist.songs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#7A93A3', marginTop: '60px' }}>
          <div style={{ fontSize: '48px' }}>🎶</div>
          <p>این پلی‌لیست هنوز آهنگی ندارد.</p>
          <Link href="/music" style={{ color: '#4FA8D8' }}>برو به موسیقی</Link>
        </div>
      ) : (
        <div>
          {playlist.songs.map((song, index) => (
            <div key={song.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 18px', borderRadius: '14px',
              background: '#fff', marginBottom: '10px',
              border: '1px solid #E3EEF5',
              boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
            }}>
              <div style={{ color: '#A0AEB8', width: '24px', textAlign: 'center', fontWeight: 600 }}>
                {index + 1}
              </div>
              <img src={song.coverUrl} width={46} height={46}
                style={{ borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#2B3A45', fontWeight: 700 }}>{song.title}</div>
                <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
              </div>
              <div style={{ color: '#A0AEB8', fontSize: '13px' }}>
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  )
}