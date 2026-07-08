import Head from 'next/head'
import MainLayout from '@/components/layout/MainLayout'
import { mockSongs, mockAlbums } from '@/mock'
import { useState } from 'react'
import { usePlaylistContext } from '@/context/PlaylistContext'
import { usePlayer } from '@/context/PlayerContext'
import AlbumCard from '@/components/artist/AlbumCard'
import type { Song } from '@/types'

export default function MusicPage() {
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'all' | 'songs' | 'albums'>('all')
  const [sortBy, setSortBy]     = useState<'streams' | 'date'>('streams')
  const [menuSongId, setMenuSongId] = useState<string | null>(null)
  const { playlists, addSongToPlaylist } = usePlaylistContext()
  const player = usePlayer()

  const filteredSongs = mockSongs
    .filter(s => s.title.includes(search) || s.artistName.includes(search))
    .sort((a, b) => sortBy === 'streams'
      ? b.streamCount - a.streamCount
      : b.createdAt.localeCompare(a.createdAt))

  const filteredAlbums = mockAlbums
    .filter(a => a.title.includes(search) || a.artistName.includes(search))

  function playSong(song: Song) {
    player.playSong(song, filteredSongs)
    setMenuSongId(null)
  }

  const inputStyle: React.CSSProperties = {
    background: '#fff', border: '1px solid #DCE8F0', color: '#2B3A45',
    padding: '11px 18px', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(135,180,210,0.08)', fontFamily: 'inherit',
  }

  return (
    <>
      <Head><title>موسیقی | SoundWave</title></Head>
      <MainLayout>
        <h1 style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800, marginBottom: '28px' }}>موسیقی</h1>

        {/* فیلترها */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام اثر یا هنرمند..."
            style={{ ...inputStyle, width: '280px' }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value as any)} style={inputStyle}>
            <option value="all">همه</option>
            <option value="songs">تک‌آهنگ‌ها</option>
            <option value="albums">آلبوم‌ها</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={inputStyle}>
            <option value="streams">تعداد پخش</option>
            <option value="date">تاریخ انتشار</option>
          </select>
        </div>

        {/* آهنگ‌ها */}
        {(filter === 'all' || filter === 'songs') && (
          <section style={{ marginBottom: '44px' }}>
            <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>تک‌آهنگ‌ها</h2>
            {filteredSongs.length === 0 && (
              <div style={{ color: '#7A93A3', textAlign: 'center', padding: '40px' }}>نتیجه‌ای پیدا نشد</div>
            )}
            {filteredSongs.map(song => (
              <div key={song.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 18px', borderRadius: '14px', background: '#fff',
                marginBottom: '10px', position: 'relative', border: '1px solid #E3EEF5',
                boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
              }}>
                <img src={song.coverUrl} width={50} height={50} style={{ borderRadius: '10px', objectFit: 'cover' }} alt={song.title} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#2B3A45', fontWeight: 700 }}>{song.title}</div>
                  <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
                </div>
                <div style={{
                  color: '#4FA8D8', fontSize: '13px', fontWeight: 600,
                  background: '#EAF4FB', padding: '4px 12px', borderRadius: '20px',
                }}>
                  {song.streamCount.toLocaleString('fa-IR')} پخش
                </div>
                <button
                  onClick={() => playSong(song)}
                  style={{
                    background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff',
                    border: 'none', padding: '7px 12px', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
                  }}
                >▶ پخش</button>
                <button
                  onClick={() => setMenuSongId(menuSongId === song.id ? null : song.id)}
                  style={{
                    background: '#EAF4FB', color: '#4FA8D8', border: 'none',
                    padding: '7px 12px', borderRadius: '10px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
                  }}
                >+ پلی‌لیست</button>

                {menuSongId === song.id && (
                  <div style={{
                    position: 'absolute', left: '18px', top: '64px',
                    background: '#fff', borderRadius: '12px', padding: '8px',
                    zIndex: 10, minWidth: '180px', boxShadow: '0 8px 24px rgba(135,180,210,0.25)',
                    border: '1px solid #E3EEF5',
                  }}>
                    {playlists.length === 0
                      ? <div style={{ color: '#7A93A3', padding: '8px', fontSize: '13px' }}>پلی‌لیستی نداری</div>
                      : playlists.map(pl => (
                        <div
                          key={pl.id}
                          onClick={() => { addSongToPlaylist(pl.id, song); setMenuSongId(null) }}
                          style={{
                            color: '#2B3A45', padding: '9px 12px', cursor: 'pointer',
                            borderRadius: '8px', fontSize: '14px',
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
          </section>
        )}

        {/* آلبوم‌ها */}
        {(filter === 'all' || filter === 'albums') && (
          <section>
            <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>آلبوم‌ها</h2>
            {filteredAlbums.length === 0
              ? <div style={{ color: '#7A93A3', textAlign: 'center', padding: '40px' }}>آلبومی پیدا نشد</div>
              : (
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {filteredAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
                </div>
              )
            }
          </section>
        )}
      </MainLayout>
    </>
  )
}
