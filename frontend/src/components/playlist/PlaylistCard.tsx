import Link from 'next/link'
import type { Playlist } from '@/types'

interface Props {
  playlist: Playlist
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export default function PlaylistCard({ playlist, onDelete, onRename }: Props) {
  function handleRename() {
    const newName = window.prompt('نام جدید پلی‌لیست:', playlist.name)
    if (newName && newName.trim()) onRename(playlist.id, newName.trim())
  }

  return (
    <div
      style={{
        background: '#fff', borderRadius: '16px', padding: '16px',
        border: '1px solid #E3EEF5', boxShadow: '0 2px 10px rgba(135,180,210,0.1)',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}
    >
      <Link href={`/playlists/${playlist.id}`} style={{ textDecoration: 'none' }}>
        <div
          style={{
            width: '100%', aspectRatio: '1', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4FA8D8, #7EC8E3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', marginBottom: '4px', cursor: 'pointer',
          }}
        >
          🎵
        </div>
        <div style={{ color: '#2B3A45', fontWeight: 700, fontSize: '14px' }}>{playlist.name}</div>
        <div style={{ color: '#7A93A3', fontSize: '12px' }}>{playlist.songs.length} آهنگ</div>
      </Link>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleRename}
          style={{
            flex: 1, background: '#EAF4FB', color: '#4FA8D8', border: 'none',
            borderRadius: '8px', padding: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          تغییر نام
        </button>
        <button
          onClick={() => onDelete(playlist.id)}
          style={{
            flex: 1, background: '#FFF0F0', color: '#E05C5C', border: 'none',
            borderRadius: '8px', padding: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          حذف
        </button>
      </div>
    </div>
  )
}
