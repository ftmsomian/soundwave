import MainLayout from '@/components/layout/MainLayout'
import { mockSongs, mockAlbums } from '@/mock'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import type { Song, Album } from '@/types'

function SongRow({ song }: { song: Song }) {
  const mins = Math.floor(song.duration / 60)
  const secs = song.duration % 60
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '10px 16px', borderRadius: '8px',
      background: '#1e1e1e', marginBottom: '8px',
    }}>
      <img src={song.coverUrl} alt={song.title} width={48} height={48}
        style={{ borderRadius: '6px', objectFit: 'cover' }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 'bold' }}>{song.title}</div>
        <div style={{ color: '#b3b3b3', fontSize: '13px' }}>{song.artistName}</div>
      </div>
      <div style={{ color: '#b3b3b3', fontSize: '13px' }}>
        {song.streamCount.toLocaleString()} پخش
      </div>
      <div style={{ color: '#b3b3b3', fontSize: '13px' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </div>
    </div>
  )
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#1e1e1e', borderRadius: '10px',
        padding: '16px', width: '160px', cursor: 'pointer',
      }}>
        <img src={album.coverUrl} alt={album.title} width={128} height={128}
          style={{ borderRadius: '8px', objectFit: 'cover', width: '100%' }} />
        <div style={{ color: '#fff', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>
          {album.title}
        </div>
        <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{album.artistName}</div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const topSongs = [...mockSongs].sort((a, b) => b.streamCount - a.streamCount).slice(0, 5)
  const isGold = user?.subscription === 'gold'

  return (
    <MainLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: '#333', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px',
        }}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} width={56} height={56} style={{ borderRadius: '50%' }} />
            : '👤'}
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }}>
            سلام، {user?.displayName} 👋
          </div>
          <div style={{ color: '#b3b3b3', fontSize: '14px' }}>به SoundWave خوش آمدی</div>
        </div>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>🔥 آهنگ‌های پرطرفدار</h2>
        {topSongs.map(song => <SongRow key={song.id} song={song} />)}
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>💿 آخرین آلبوم‌های منتشر شده</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {mockAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
        </div>
      </section>

      {isGold && (
        <section style={{
          background: 'linear-gradient(135deg, #2a1f00, #3d2e00)',
          border: '1px solid #FFD700',
          borderRadius: '12px', padding: '24px', marginBottom: '40px',
        }}>
          <h2 style={{ color: '#FFD700', marginBottom: '8px' }}>⭐ دسترسی زودهنگام</h2>
          <p style={{ color: '#b3b3b3' }}>آهنگ‌های اختصاصی برای اشتراک طلایی</p>
          <div style={{ marginTop: '16px' }}>
            {mockSongs.filter(s => s.isEarlyAccess).map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  )
}