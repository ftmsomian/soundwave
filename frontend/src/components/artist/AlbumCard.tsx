import Link from 'next/link'
import type { Album } from '@/types'
import { ROUTES } from '@/constants'

interface Props {
  album: Album
}

export default function AlbumCard({ album }: Props) {
  return (
    <Link href={ROUTES.album(album.id)} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff', borderRadius: '16px', padding: '16px',
          width: '170px', cursor: 'pointer', border: '1px solid #E3EEF5',
          boxShadow: '0 2px 10px rgba(135,180,210,0.1)',
        }}
      >
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
