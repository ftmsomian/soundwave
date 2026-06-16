import MainLayout from '@/components/layout/MainLayout'
import { mockSongs, mockAlbums } from '@/mock'
import { useState } from 'react'
import { usePlaylistContext } from '@/context/PlaylistContext'
import type { Song } from '@/types'
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
      <h1 style={{ color: '#fff', marginBottom: '24px' }}>🎵 موسیقی</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو بر اساس نام اثر یا هنرمند..."
          style={{
            background: '#333', border: 'none', color: '#fff',
            padding: '10px 16px', borderRadius: '8px', width: '280px'
          }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{
          background: '#333', border: 'none', color: '#fff',
          padding: '10px 16px', borderRadius: '8px', cursor: 'pointer'
        }}>
          <option value="all">همه</option>
          <option value="songs">تک‌آهنگ‌ها</option>
          <option value="albums">آلبوم‌ها</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{
          background: '#333', border: 'none', color: '#fff',
          padding: '10px 16px', borderRadius: '8px', cursor: 'pointer'
        }}>
          <option value="streams">تعداد شنونده</option>
          <option value="date">تاریخ انتشار</option>
        </select>
      </div>

      {(filter === 'all' || filter === 'songs') && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#fff', marginBottom: '16px' }}>تک‌آهنگ‌ها</h2>
          {filteredSongs.map(song => (
            <div key={song.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '10px 16px', borderRadius: '8px',
              background: '#1e1e1e', marginBottom: '8px', position: 'relative'
            }}>
              <img src={song.coverUrl} width={48} height={48}
                style={{ borderRadius: '6px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{song.title}</div>
                <div style={{ color: '#b3b3b3', fontSize: '13px' }}>{song.artistName}</div>
              </div>
              <div style={{ color: '#b3b3b3', fontSize: '13px' }}>
                {song.streamCount.toLocaleString()} پخش
              </div>
              <button onClick={() => setMenuSongId(menuSongId === song.id ? null : song.id)} style={{
                background: '#333', color: '#fff', border: 'none',
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
              }}>+ افزودن به پلی‌لیست</button>

              {menuSongId === song.id && (
                <div style={{
                  position: 'absolute', left: '16px', top: '56px',
                  background: '#282828', borderRadius: '8px', padding: '8px',
                  zIndex: 10, minWidth: '180px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {playlists.length === 0
                    ? <div style={{ color: '#b3b3b3', padding: '8px' }}>پلی‌لیستی نداری</div>
                    : playlists.map(pl => (
                      <div key={pl.id} onClick={() => { addSongToPlaylist(pl.id, song); setMenuSongId(null) }}
                        style={{
                          color: '#fff', padding: '8px 12px', cursor: 'pointer',
                          borderRadius: '6px', fontSize: '14px'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#333')}
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
          <h2 style={{ color: '#fff', marginBottom: '16px' }}>آلبوم‌ها</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {filteredAlbums.map(album => (
              <Link key={album.id} href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#1e1e1e', borderRadius: '10px',
                  padding: '16px', width: '160px', cursor: 'pointer'
                }}>
                  <img src={album.coverUrl} width={128} height={128}
                    style={{ borderRadius: '8px', objectFit: 'cover', width: '100%' }} />
                  <div style={{ color: '#fff', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>
                    {album.title}
                  </div>
                  <div style={{ color: '#b3b3b3', fontSize: '12px' }}>{album.artistName}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </MainLayout>
  )
}