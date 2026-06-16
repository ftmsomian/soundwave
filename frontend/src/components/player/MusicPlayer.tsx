import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { PLAYER_TICK_MS, ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/hooks/usePlayer'
import type { RepeatMode, Song } from '@/types'
import { formatCompactNumber } from '@/utils'
import ProgressBar from './ProgressBar'
import Queue from './Queue'
import VolumeControl from './VolumeControl'

const repeatLabels: Record<RepeatMode, string> = {
  none: 'بدون تکرار',
  all: 'تکرار لیست',
  one: 'تکرار آهنگ',
}

function getNextRepeatMode(repeatMode: RepeatMode): RepeatMode {
  if (repeatMode === 'none') return 'all'
  if (repeatMode === 'all') return 'one'
  return 'none'
}

function getRepeatButtonLabel(repeatMode: RepeatMode): string {
  if (repeatMode === 'one') return '🔂'
  return '🔁'
}

export default function MusicPlayer() {
  const player = usePlayer()
  const { currentUser } = useAuth()
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)

  const currentSong = player.currentSong
  const canViewStats = currentUser?.subscription === 'gold'
  const duration = currentSong?.duration ?? 0

  useEffect(() => {
    if (!player.isPlaying || !currentSong) return undefined

    const timerId = window.setTimeout(() => {
      const nextTime = player.currentTime + 1

      if (nextTime >= currentSong.duration) {
        player.playNext()
      } else {
        player.seekTo(nextTime)
      }
    }, PLAYER_TICK_MS)

    return () => window.clearTimeout(timerId)
  }, [currentSong, player])

  function handleSelectSong(song: Song) {
    player.playSong(song, player.queue)
  }

  function handleRepeatClick() {
    player.setRepeatMode(getNextRepeatMode(player.repeatMode))
  }

  function renderSongInfo(isCompact = false) {
    if (!currentSong) {
      return (
        <div className="min-w-0">
          <p className="truncate font-bold text-white">آهنگی انتخاب نشده</p>
          <p className="truncate text-sm text-[#B3B3B3]">از صفحه Player یک آهنگ mock را پخش کنید.</p>
        </div>
      )
    }

    return (
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt={currentSong.title}
          className={`${isCompact ? 'h-12 w-12' : 'h-14 w-14'} rounded-lg object-cover`}
          src={currentSong.coverUrl}
        />
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{currentSong.title}</p>
          <div className="flex flex-wrap items-center gap-1 text-sm text-[#B3B3B3]">
            <Link className="hover:text-[#1DB954]" href={ROUTES.artist(currentSong.artistId)}>
              {currentSong.artistName}
            </Link>
            {currentSong.albumId && currentSong.albumName && (
              <>
                <span>•</span>
                <Link className="hover:text-[#1DB954]" href={ROUTES.album(currentSong.albumId)}>
                  {currentSong.albumName}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-[#282828] bg-[#181818]/95 px-4 py-3 backdrop-blur md:block">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_minmax(320px,2fr)_minmax(220px,1fr)] items-center gap-4">
          {renderSongInfo()}

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                aria-label="شافل"
                className={`rounded-full px-3 py-2 text-sm transition-colors ${player.isShuffle ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                onClick={player.toggleShuffle}
                type="button"
              >
                🔀
              </button>
              <button className="rounded-full bg-[#282828] px-3 py-2 text-white hover:bg-[#3E3E3E]" onClick={player.playPrev} type="button">
                ⏮
              </button>
              <button
                className="h-11 w-11 rounded-full bg-white text-lg font-black text-black hover:scale-105"
                onClick={player.togglePlay}
                type="button"
              >
                {player.isPlaying ? '⏸' : '▶'}
              </button>
              <button className="rounded-full bg-[#282828] px-3 py-2 text-white hover:bg-[#3E3E3E]" onClick={player.playNext} type="button">
                ⏭
              </button>
              <button
                aria-label={repeatLabels[player.repeatMode]}
                className={`rounded-full px-3 py-2 text-sm transition-colors ${player.repeatMode !== 'none' ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                onClick={handleRepeatClick}
                title={repeatLabels[player.repeatMode]}
                type="button"
              >
                {getRepeatButtonLabel(player.repeatMode)}
              </button>
            </div>
            <ProgressBar currentTime={player.currentTime} duration={duration} onSeek={player.seekTo} />
          </div>

          <div className="flex items-center justify-end gap-3">
            {currentSong && canViewStats && (
              <div className="hidden text-left text-xs text-[#B3B3B3] lg:block">
                <p>{formatCompactNumber(currentSong.streamCount)} استریم</p>
                <p>{formatCompactNumber(currentSong.uniqueListenerCount)} شنونده</p>
              </div>
            )}
            <button
              className="rounded-full bg-[#282828] px-3 py-2 text-sm text-white hover:bg-[#3E3E3E]"
              onClick={() => setIsQueueOpen(prev => !prev)}
              type="button"
            >
              Queue
            </button>
            <VolumeControl onVolumeChange={player.setVolume} volume={player.volume} />
          </div>
        </div>

        {isQueueOpen && (
          <div className="absolute bottom-24 left-4 w-96 max-w-[calc(100vw-2rem)]">
            <Queue currentSongId={currentSong?.id} onSelectSong={handleSelectSong} queue={player.queue} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#282828] bg-[#181818]/95 p-3 backdrop-blur md:hidden">
        <button
          className="flex w-full items-center justify-between gap-3 text-right"
          onClick={() => setIsMobileExpanded(true)}
          type="button"
        >
          <div className="min-w-0 flex-1">{renderSongInfo(true)}</div>
          <span
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-black"
            onClick={event => {
              event.stopPropagation()
              player.togglePlay()
            }}
            role="button"
            tabIndex={0}
          >
            {player.isPlaying ? '⏸' : '▶'}
          </span>
        </button>
      </div>

      {isMobileExpanded && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#121212] p-5 md:hidden">
          <div className="mb-6 flex items-center justify-between">
            <button className="text-[#B3B3B3]" onClick={() => setIsMobileExpanded(false)} type="button">
              بستن
            </button>
            <span className="text-sm text-[#B3B3B3]">Mini Player</span>
          </div>

          {currentSong ? (
            <>
              <img alt={currentSong.title} className="mx-auto mb-6 aspect-square w-full max-w-sm rounded-3xl object-cover" src={currentSong.coverUrl} />
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-black text-white">{currentSong.title}</h2>
                <Link className="text-[#B3B3B3] hover:text-[#1DB954]" href={ROUTES.artist(currentSong.artistId)}>
                  {currentSong.artistName}
                </Link>
              </div>
              <ProgressBar currentTime={player.currentTime} duration={duration} onSeek={player.seekTo} />

              <div className="mt-6 flex items-center justify-center gap-3">
                <button className={`rounded-full px-4 py-3 ${player.isShuffle ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white'}`} onClick={player.toggleShuffle} type="button">🔀</button>
                <button className="rounded-full bg-[#282828] px-4 py-3 text-white" onClick={player.playPrev} type="button">⏮</button>
                <button className="h-14 w-14 rounded-full bg-white text-xl font-black text-black" onClick={player.togglePlay} type="button">{player.isPlaying ? '⏸' : '▶'}</button>
                <button className="rounded-full bg-[#282828] px-4 py-3 text-white" onClick={player.playNext} type="button">⏭</button>
                <button className={`rounded-full px-4 py-3 ${player.repeatMode !== 'none' ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white'}`} onClick={handleRepeatClick} type="button">{getRepeatButtonLabel(player.repeatMode)}</button>
              </div>

              {currentSong.lyrics && (
                <section className="mt-8 rounded-2xl bg-[#181818] p-4">
                  <h3 className="mb-3 font-bold text-white">متن آهنگ</h3>
                  <p className="whitespace-pre-line leading-8 text-[#B3B3B3]">{currentSong.lyrics}</p>
                </section>
              )}

              <section className="mt-4">
                <Queue currentSongId={currentSong.id} onSelectSong={handleSelectSong} queue={player.queue} />
              </section>
            </>
          ) : (
            <div className="rounded-2xl bg-[#181818] p-6 text-center text-[#B3B3B3]">هنوز آهنگی انتخاب نشده است.</div>
          )}
        </div>
      )}
    </>
  )
}
