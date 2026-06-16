import React, { ChangeEvent } from 'react'
import { formatDuration } from '@/utils'

interface Props {
  currentTime: number
  duration: number
  onSeek: (seconds: number) => void
}

export default function ProgressBar({ currentTime, duration, onSeek }: Props) {
  function handleSeek(event: ChangeEvent<HTMLInputElement>) {
    onSeek(Number(event.target.value))
  }

  return (
    <div className="flex w-full items-center gap-3 text-xs text-[#B3B3B3]">
      <span className="w-10 text-left tabular-nums">{formatDuration(Math.floor(currentTime))}</span>
      <input
        aria-label="جابجایی در زمان آهنگ"
        className="h-1 flex-1 cursor-pointer accent-[#1DB954]"
        disabled={duration <= 0}
        max={duration}
        min={0}
        onChange={handleSeek}
        step={1}
        type="range"
        value={Math.min(currentTime, duration)}
      />
      <span className="w-10 text-right tabular-nums">{formatDuration(duration)}</span>
    </div>
  )
}
