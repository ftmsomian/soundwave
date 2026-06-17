import { createContext, useContext, useState, ReactNode } from 'react'
import type { Playlist, Song } from '@/types'
import { mockPlaylists } from '@/mock'
import { useAuth } from '@/context/AuthContext'

interface PlaylistContextType {
  playlists: Playlist[]
  createPlaylist: (name: string) => void
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  addSongToPlaylist: (playlistId: string, song: Song) => void
}

const PlaylistContext = createContext<PlaylistContextType | null>(null)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>(
    mockPlaylists.filter(p => p.ownerId === currentUser?.id)
  )

  const maxPlaylists = currentUser?.subscription === 'free' ? 6 : Infinity

  function createPlaylist(name: string) {
    if (playlists.length >= maxPlaylists) {
      alert('کاربران رایگان حداکثر ۶ پلی‌لیست می‌توانند داشته باشند')
      return
    }
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      name,
      ownerId: currentUser?.id || '',
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPlaylists(prev => [...prev, newPlaylist])
  }

  function deletePlaylist(id: string) {
    setPlaylists(prev => prev.filter(p => p.id !== id))
  }

  function renamePlaylist(id: string, name: string) {
    setPlaylists(prev => prev.map(p =>
      p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
    ))
  }

  function addSongToPlaylist(playlistId: string, song: Song) {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId && !p.songs.find(s => s.id === song.id)
        ? { ...p, songs: [...p.songs, song], updatedAt: new Date().toISOString() }
        : p
    ))
  }

  return (
    <PlaylistContext.Provider value={{ playlists, createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylistContext() {
  const ctx = useContext(PlaylistContext)
  if (!ctx) throw new Error('usePlaylistContext must be used within PlaylistProvider')
  return ctx
}