import React, { ChangeEvent } from 'react'

interface Props {
  volume: number
  onVolumeChange: (volume: number) => void
}

export default function VolumeControl({ volume, onVolumeChange }: Props) {
  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    onVolumeChange(Number(event.target.value))
  }

  return (
    <label className="hidden items-center gap-2 text-sm text-[#B3B3B3] md:flex">
      <span aria-hidden="true">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
      <input
        aria-label="کنترل صدا"
        className="w-24 cursor-pointer accent-[#1DB954]"
        max={1}
        min={0}
        onChange={handleVolumeChange}
        step={0.01}
        type="range"
        value={volume}
      />
      <span className="w-9 text-xs tabular-nums">{Math.round(volume * 100)}٪</span>
    </label>
  )
}
