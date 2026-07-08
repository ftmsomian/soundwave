import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import { PlaylistProvider } from '@/context/PlaylistContext'
import MusicPlayer from '@/components/player/MusicPlayer'
import { seedMockData } from '@/mock'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    seedMockData()
  }, [])

  return (
    <AuthProvider>
      <PlayerProvider>
        <PlaylistProvider>
          <Component {...pageProps} />
          <MusicPlayer />
        </PlaylistProvider>
      </PlayerProvider>
    </AuthProvider>
  )
}
