import React from 'react'
import type { AppProps } from 'next/app'
import MusicPlayer from '@/components/player/MusicPlayer'
import { AuthProvider } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Component {...pageProps} />
        <MusicPlayer />
      </PlayerProvider>
    </AuthProvider>
  )
}
