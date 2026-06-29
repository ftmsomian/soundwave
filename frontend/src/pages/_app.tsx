import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { PlaylistProvider } from '@/context/PlaylistContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <PlaylistProvider>
        <Component {...pageProps} />
      </PlaylistProvider>
    </AuthProvider>
  )
}