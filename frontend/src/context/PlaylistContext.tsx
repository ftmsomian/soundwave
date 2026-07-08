import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import type { Playlist, Song } from '@/types'
import { STORAGE_KEYS, SUBSCRIPTION_LIMITS } from '@/constants'
import { getFromStorage, setToStorage, mockPlaylists } from '@/mock'
import { useAuth } from '@/context/AuthContext'

interface PlaylistContextType {
  playlists: Playlist[]
  createPlaylist: (name: string) => { success: boolean; error?: string }
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  addSongToPlaylist: (playlistId: string, song: Song) => void
  removeSongFromPlaylist: (playlistId: string, songId: string) => void
}

const PlaylistContext = createContext<PlaylistContextType | null>(null)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  // وقتی کاربر مشخص شد، پلی‌لیست‌هاش رو از localStorage (یا mock پیش‌فرض) بخون
  useEffect(() => {
    if (!user) {
      setPlaylists([])
      return
    }
    const stored = getFromStorage<Playlist>(STORAGE_KEYS.PLAYLISTS)
    const source = stored.length > 0 ? stored : mockPlaylists
    setPlaylists(source.filter(p => p.ownerId === user.id))
  }, [user])

  function persist(updated: Playlist[]) {
    setPlaylists(updated)
    // باقی پلی‌لیست‌های بقیه‌ی کاربران رو دست‌نخورده نگه می‌داریم
    const others = getFromStorage<Playlist>(STORAGE_KEYS.PLAYLISTS).filter(p => p.ownerId !== user?.id)
    setToStorage(STORAGE_KEYS.PLAYLISTS, [...others, ...updated])
  }

  const maxPlaylists = user ? SUBSCRIPTION_LIMITS[user.subscription].maxPlaylists : 0

  function createPlaylist(name: string): { success: boolean; error?: string } {
    if (!user) return { success: false, error: 'ابتدا وارد حساب کاربری شوید' }
    if (maxPlaylists !== null && playlists.length >= maxPlaylists) {
      return { success: false, error: `حداکثر تعداد پلی‌لیست برای اشتراک شما ${maxPlaylists} عدد است` }
    }
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      name,
      ownerId: user.id,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    persist([...playlists, newPlaylist])
    return { success: true }
  }

  function deletePlaylist(id: string) {
    persist(playlists.filter(p => p.id !== id))
  }

  function renamePlaylist(id: string, name: string) {
    persist(playlists.map(p => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)))
  }

  function addSongToPlaylist(playlistId: string, song: Song) {
    persist(
      playlists.map(p =>
        p.id === playlistId && !p.songs.find(s => s.id === song.id)
          ? { ...p, songs: [...p.songs, song], updatedAt: new Date().toISOString() }
          : p
      )
    )
  }

  function removeSongFromPlaylist(playlistId: string, songId: string) {
    persist(
      playlists.map(p =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter(s => s.id !== songId), updatedAt: new Date().toISOString() }
          : p
      )
    )
  }

  return (
    <PlaylistContext.Provider
      value={{ playlists, createPlaylist, deletePlaylist, renamePlaylist, addSongToPlaylist, removeSongFromPlaylist }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylistContext() {
  const ctx = useContext(PlaylistContext)
  if (!ctx) throw new Error('usePlaylistContext must be used within PlaylistProvider')
  return ctx
}
