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
      padding: '12px 18px', borderRadius: '14px',
      background: '#fff', marginBottom: '10px',
      border: '1px solid #E3EEF5',
      boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
    }}>
      <img src={song.coverUrl} alt={song.title} width={50} height={50}
        style={{ borderRadius: '10px', objectFit: 'cover' }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: '#2B3A45', fontWeight: 700 }}>{song.title}</div>
        <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
      </div>
      <div style={{
        color: '#4FA8D8', fontSize: '13px', fontWeight: 600,
        background: '#EAF4FB', padding: '4px 12px', borderRadius: '20px',
      }}>
        {song.streamCount.toLocaleString()} پخش
      </div>
      <div style={{ color: '#A0AEB8', fontSize: '13px', minWidth: '40px', textAlign: 'left' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </div>
    </div>
  )
}

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '16px', width: '170px', cursor: 'pointer',
        border: '1px solid #E3EEF5',
        boxShadow: '0 2px 10px rgba(135,180,210,0.1)',
      }}>
        <img src={album.coverUrl} alt={album.title} width={138} height={138}
          style={{ borderRadius: '12px', objectFit: 'cover', width: '100%' }} />
        <div style={{ color: '#2B3A45', fontWeight: 700, marginTop: '12px', fontSize: '14px' }}>
          {album.title}
        </div>
        <div style={{ color: '#7A93A3', fontSize: '12px' }}>{album.artistName}</div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { currentUser } = useAuth()
  const topSongs = [...mockSongs].sort((a, b) => b.streamCount - a.streamCount).slice(0, 5)
  const isGold = currentUser?.subscription === 'gold'

  return (
    <MainLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px',
        }}>
          {currentUser?.avatarUrl
            ? <img src={currentUser.avatarUrl} width={60} height={60} style={{ borderRadius: '50%' }} />
            : '👤'}
        </div>
        <div>
          <div style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800 }}>
            سلام، {currentUser?.displayName} 👋
          </div>
          <div style={{ color: '#7A93A3', fontSize: '14px' }}>به SoundWave خوش آمدی</div>
        </div>
      </div>

      <section style={{ marginBottom: '44px' }}>
        <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>
          آهنگ‌های پرطرفدار
        </h2>
        {topSongs.map(song => <SongRow key={song.id} song={song} />)}
      </section>

      <section style={{ marginBottom: '44px' }}>
        <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>
          آخرین آلبوم‌های منتشر شده
        </h2>
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
          {mockAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
        </div>
      </section>

      {isGold && (
        <section style={{
          background: 'linear-gradient(135deg, #FFF8E7, #FFF0CC)',
          border: '1px solid #F0D898',
          borderRadius: '18px', padding: '28px', marginBottom: '40px',
        }}>
          <h2 style={{ color: '#B8860B', marginBottom: '8px', fontSize: '20px', fontWeight: 800 }}>
            دسترسی زودهنگام
          </h2>
          <p style={{ color: '#8A7548' }}>آهنگ‌های اختصاصی برای اشتراک طلایی</p>
          <div style={{ marginTop: '18px' }}>
            {mockSongs.filter(s => s.isEarlyAccess).map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  )
}