import React from 'react'
import type { Song } from '@/types'
import { formatDuration } from '@/utils'

interface Props {
  currentSongId?: string
  onSelectSong: (song: Song) => void
  queue: Song[]
}

export default function Queue({ currentSongId, onSelectSong, queue }: Props) {
  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-[#282828] bg-[#181818] p-4 text-sm text-[#B3B3B3]">
        صف پخش خالی است.
      </div>
    )
  }

  return (
    <div className="max-h-80 overflow-y-auto rounded-xl border border-[#282828] bg-[#181818] p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-white">صف پخش</h3>
        <span className="text-xs text-[#B3B3B3]">{queue.length} آهنگ</span>
      </div>

      <div className="space-y-2">
        {queue.map(song => {
          const isCurrentSong = song.id === currentSongId

          return (
            <button
              className={`flex w-full items-center gap-3 rounded-lg p-2 text-right transition-colors ${
                isCurrentSong ? 'bg-[#1DB954]/20' : 'hover:bg-[#282828]'
              }`}
              key={song.id}
              onClick={() => onSelectSong(song)}
              type="button"
            >
              <img
                alt={song.title}
                className="h-10 w-10 rounded object-cover"
                src={song.coverUrl}
              />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-medium ${isCurrentSong ? 'text-[#1DB954]' : 'text-white'}`}>
                  {song.title}
                </span>
                <span className="block truncate text-xs text-[#B3B3B3]">{song.artistName}</span>
              </span>
              <span className="text-xs text-[#B3B3B3]">{formatDuration(song.duration)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
