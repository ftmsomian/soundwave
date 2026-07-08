import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { Song, PlayerState, RepeatMode } from '@/types'
import { PLAYER_DEFAULT_VOLUME, PLAYER_PREVIOUS_THRESHOLD_SECONDS } from '@/constants'

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  playNext: () => void
  playPrev: () => void
  setVolume: (v: number) => void
  seekTo: (seconds: number) => void
  setRepeatMode: (mode: RepeatMode) => void
  toggleShuffle: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    volume: PLAYER_DEFAULT_VOLUME,
    repeatMode: 'none',
    isShuffle: false,
  })

  function playSong(song: Song, queue: Song[] = []) {
    setState(prev => ({ ...prev, currentSong: song, queue, isPlaying: true, currentTime: 0 }))
  }

  function togglePlay() {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  function playNext() {
    setState(prev => {
      if (!prev.currentSong || prev.queue.length === 0) return prev

      if (prev.repeatMode === 'one') {
        return { ...prev, isPlaying: true, currentTime: 0 }
      }

      if (prev.isShuffle) {
        const available = prev.queue.filter(s => s.id !== prev.currentSong?.id)
        const list = available.length > 0 ? available : prev.queue
        const next = list[Math.floor(Math.random() * list.length)]
        return { ...prev, currentSong: next, isPlaying: true, currentTime: 0 }
      }

      const idx = prev.queue.findIndex(s => s.id === prev.currentSong?.id)
      const next = prev.queue[idx + 1]

      if (next) {
        return { ...prev, currentSong: next, isPlaying: true, currentTime: 0 }
      }

      if (prev.repeatMode === 'all') {
        return { ...prev, currentSong: prev.queue[0], isPlaying: true, currentTime: 0 }
      }

      return { ...prev, isPlaying: false, currentTime: 0 }
    })
  }

  function playPrev() {
    setState(prev => {
      if (!prev.currentSong || prev.queue.length === 0) return prev

      if (prev.currentTime > PLAYER_PREVIOUS_THRESHOLD_SECONDS) {
        return { ...prev, currentTime: 0 }
      }

      if (prev.repeatMode === 'one') {
        return { ...prev, isPlaying: true, currentTime: 0 }
      }

      if (prev.isShuffle) {
        const available = prev.queue.filter(s => s.id !== prev.currentSong?.id)
        const list = available.length > 0 ? available : prev.queue
        const prevSong = list[Math.floor(Math.random() * list.length)]
        return { ...prev, currentSong: prevSong, isPlaying: true, currentTime: 0 }
      }

      const idx = prev.queue.findIndex(s => s.id === prev.currentSong?.id)
      const prevSong = prev.queue[idx - 1]

      if (prevSong) {
        return { ...prev, currentSong: prevSong, isPlaying: true, currentTime: 0 }
      }

      if (prev.repeatMode === 'all') {
        return { ...prev, currentSong: prev.queue[prev.queue.length - 1], isPlaying: true, currentTime: 0 }
      }

      return { ...prev, currentTime: 0 }
    })
  }

  function setVolume(v: number) {
    setState(prev => ({ ...prev, volume: v }))
  }

  function seekTo(seconds: number) {
    setState(prev => ({ ...prev, currentTime: seconds }))
  }

  function setRepeatMode(mode: RepeatMode) {
    setState(prev => ({ ...prev, repeatMode: mode }))
  }

  function toggleShuffle() {
    setState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))
  }

  return (
    <PlayerContext.Provider
      value={{ ...state, playSong, togglePlay, playNext, playPrev, setVolume, seekTo, setRepeatMode, toggleShuffle }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider')
  return context
}
