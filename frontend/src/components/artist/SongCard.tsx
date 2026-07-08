import type { Song } from '@/types'
import { formatDuration } from '@/utils'
import { usePlayer } from '@/context/PlayerContext'

interface Props {
  song: Song
  queue?: Song[]
  onAddToPlaylist?: (song: Song) => void
}

export default function SongCard({ song, queue = [], onAddToPlaylist }: Props) {
  const player = usePlayer()

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '12px 18px', borderRadius: '14px',
        background: '#fff', marginBottom: '10px',
        border: '1px solid #E3EEF5', boxShadow: '0 2px 8px rgba(135,180,210,0.08)',
      }}
    >
      <img src={song.coverUrl} alt={song.title} width={50} height={50}
        style={{ borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#2B3A45', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
        <div style={{ color: '#7A93A3', fontSize: '13px' }}>{song.artistName}</div>
      </div>
      <div style={{ color: '#A0AEB8', fontSize: '13px', flexShrink: 0 }}>{formatDuration(song.duration)}</div>
      <button
        onClick={() => player.playSong(song, queue.length > 0 ? queue : [song])}
        style={{
          background: 'linear-gradient(90deg, #4FA8D8, #7EC8E3)', color: '#fff',
          border: 'none', padding: '7px 14px', borderRadius: '10px',
          cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit', flexShrink: 0,
        }}
      >
        ▶ پخش
      </button>
      {onAddToPlaylist && (
        <button
          onClick={() => onAddToPlaylist(song)}
          style={{
            background: '#EAF4FB', color: '#4FA8D8', border: 'none',
            padding: '7px 14px', borderRadius: '10px', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px', fontFamily: 'inherit', flexShrink: 0,
          }}
        >
          + پلی‌لیست
        </button>
      )}
    </div>
  )
}
