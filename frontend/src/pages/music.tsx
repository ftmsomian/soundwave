import MainLayout from '@/components/layout/MainLayout'
import { mockSongs, mockAlbums } from '@/mock'
import { useState } from 'react'
import { usePlaylistContext } from '@/context/PlaylistContext'
import Link from 'next/link'

export default function MusicPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'songs' | 'albums'>('all')
  const [sortBy, setSortBy] = useState<'streams' | 'date'>('streams')
  const [menuSongId, setMenuSongId] = useState<string | null>(null)
  const { playlists, addSongToPlaylist } = usePlaylistContext()

  const filteredSongs = mockSongs
    .filter(s => s.title.includes(search) || s.artistName.includes(search))
    .sort((a, b) => sortBy === 'streams' ? b.streamCount - a.streamCount : b.createdAt.localeCompare(a.createdAt))

  const filteredAlbums = mockAlbums
    .filter(a => a.title.includes(search) || a.artistName.includes(search))

  return (
    <MainLayout>
      <h1 style={{ color: '#2B3A45', fontSize: '24px', fontWeight: 800, marginBottom: '28px' }}>موسیقی</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام اثر یا هنرمند..."
          style={{
            background: '#fff', border: '1px solid #DCE8F0', color: '#2B3A45',
            padding: '11px 18px', borderRadius: '12px', width: '280px',
            boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
          }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{
          background: '#fff', border: '1px solid #DCE8F0', color: '#2B3A45',
          padding: '11px 18px', borderRadius: '12px', cursor: 'pointer'
        }}>
          <option value="all">همه</option>
          <option value="songs">تک‌آهنگ‌ها</option>
          <option value="albums">آلبوم‌ها</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{
          background: '#fff', border: '1px solid #DCE8F0', color: '#2B3A45',
          padding: '11px 18px', borderRadius: '12px', cursor: 'pointer'
        }}>
          <option value="streams">تعداد شنونده</option>
          <option value="date">تاریخ انتشار</option>
        </select>
      </div>

      {(filter === 'all' || filter === 'songs') && (
        <section style={{ marginBottom: '44px' }}>
          <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>تک‌آهنگ‌ها</h2>
          {filteredSongs.map(song => (
            <div key={song.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 18px', borderRadius: '14px',
              background: '#fff', marginBottom: '10px', position: 'relative',
              border: '1px solid #E3EEF5',
              boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
            }}>
              <img src={song.coverUrl} width={50} height={50}
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
              <button onClick={() => setMenuSongId(menuSongId === song.id ? null : song.id)} style={{
                background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff', border: 'none',
                padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
              }}>+ افزودن</button>

              {menuSongId === song.id && (
                <div style={{
                  position: 'absolute', left: '18px', top: '64px',
                  background: '#fff', borderRadius: '12px', padding: '8px',
                  zIndex: 10, minWidth: '180px', boxShadow: '0 8px 24px rgba(135,180,210,0.25)',
                  border: '1px solid #E3EEF5',
                }}>
                  {playlists.length === 0
                    ? <div style={{ color: '#7A93A3', padding: '8px' }}>پلی‌لیستی نداری</div>
                    : playlists.map(pl => (
                      <div key={pl.id} onClick={() => { addSongToPlaylist(pl.id, song); setMenuSongId(null) }}
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
        </section>
      )}

      {(filter === 'all' || filter === 'albums') && (
        <section>
          <h2 style={{ color: '#2B3A45', marginBottom: '18px', fontSize: '20px', fontWeight: 800 }}>آلبوم‌ها</h2>
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            {filteredAlbums.map(album => (
              <Link key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: '16px',
                  padding: '16px', width: '170px', cursor: 'pointer',
                  border: '1px solid #E3EEF5',
                  boxShadow: '0 2px 10px rgba(135,180,210,0.1)',
                }}>
                  <img src={album.coverUrl} width={138} height={138}
                    style={{ borderRadius: '12px', objectFit: 'cover', width: '100%' }} />
                  <div style={{ color: '#2B3A45', fontWeight: 700, marginTop: '12px', fontSize: '14px' }}>
                    {album.title}
                  </div>
                  <div style={{ color: '#7A93A3', fontSize: '12px' }}>{album.artistName}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  )
}