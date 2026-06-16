import { usePlayer as usePlayerContext } from '@/context/PlayerContext'

export function usePlayer() {
  return usePlayerContext()
}