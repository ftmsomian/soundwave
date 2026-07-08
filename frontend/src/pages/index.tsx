import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '@/components/layout/MainLayout'
import AlbumCard from '@/components/artist/AlbumCard'
import SongCard from '@/components/artist/SongCard'
import { mockSongs, mockAlbums } from '@/mock'
import { useAuth } from '@/context/AuthContext'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { ROUTES } from '@/constants'
import Link from 'next/link'

export default function HomePage() {
  const { currentUser, isLoading } = useAuth()
  const { playlists } = usePlaylistContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push(ROUTES.login)
    }
  }, [currentUser, isLoading, router])

  if (isLoading || !currentUser) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">در حال بارگذاری...</div>
  }

  const topSongs = [...mockSongs].sort((a, b) => b.streamCount - a.streamCount).slice(0, 5)
  const isGold = currentUser.subscription === 'gold'

  return (
    <>
      <Head><title>خانه | SoundWave</title></Head>
      <MainLayout>
        {/* خوشامدگویی */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', overflow: 'hidden', flexShrink: 0,
          }}>
            {currentUser.avatarUrl
              ? <img src={currentUser.avatarUrl} width={60} height={60} style={{ borderRadius: '50%', objectFit: 'cover' }} alt="" />
              : '👤'}
          </div>
          <div>
            <div style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800 }}>
              سلام، {currentUser.displayName} 👋
            </div>
            <div style={{ color: '#7A93A3', fontSize: '14px' }}>به SoundWave خوش آمدی</div>
          </div>
        </div>

        {/* پلی‌لیست‌های اخیر */}
        {playlists.length > 0 && (
          <section style={{ marginBottom: '44px' }}>
            <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>
              پلی‌لیست‌های شما
            </h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {playlists.slice(0, 4).map(pl => (
                <Link key={pl.id} href={`/playlists/${pl.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', borderRadius: '16px', padding: '16px',
                    width: '160px', cursor: 'pointer', border: '1px solid #E3EEF5',
                    boxShadow: '0 2px 10px rgba(135,180,210,0.1)',
                  }}>
                    <div style={{
                      width: '128px', height: '128px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '40px', marginBottom: '10px',
                    }}>🎵</div>
                    <div style={{ color: '#2B3A45', fontWeight: 700, fontSize: '14px' }}>{pl.name}</div>
                    <div style={{ color: '#7A93A3', fontSize: '12px' }}>{pl.songs.length} آهنگ</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* آهنگ‌های پرطرفدار */}
        <section style={{ marginBottom: '44px' }}>
          <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>
            آهنگ‌های پرطرفدار
          </h2>
          {topSongs.map(song => (
            <SongCard key={song.id} song={song} queue={topSongs} />
          ))}
        </section>

        {/* آخرین آلبوم‌ها */}
        <section style={{ marginBottom: '44px' }}>
          <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>
            آخرین آلبوم‌های منتشر شده
          </h2>
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            {mockAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
          </div>
        </section>

        {/* دسترسی زودهنگام - فقط طلایی */}
        {isGold && (
          <section style={{
            background: 'linear-gradient(135deg, #FFF8E7, #FFF0CC)',
            border: '1px solid #F0D898', borderRadius: '18px', padding: '28px', marginBottom: '40px',
          }}>
            <h2 style={{ color: '#B8860B', marginBottom: '8px', fontSize: '20px', fontWeight: 800 }}>
              ⭐ دسترسی زودهنگام
            </h2>
            <p style={{ color: '#8A7548', marginBottom: '18px' }}>آهنگ‌های اختصاصی برای اشتراک طلایی</p>
            {mockSongs.filter(s => s.isEarlyAccess).map(song => (
              <SongCard key={song.id} song={song} queue={mockSongs.filter(s => s.isEarlyAccess)} />
            ))}
          </section>
        )}
      </MainLayout>
    </>
  )
}
