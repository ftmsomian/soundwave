import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/context/PlayerContext'
import type { AudioQuality, RepeatMode, Song } from '@/types'
import { formatCompactNumber } from '@/utils'
import ProgressBar from './ProgressBar'
import Queue from './Queue'
import VolumeControl from './VolumeControl'

const repeatLabels: Record<RepeatMode, string> = {
  none: 'بدون تکرار',
  all:  'تکرار لیست',
  one:  'تکرار آهنگ',
}

const qualityLabels: Record<AudioQuality, string> = {
  low: 'کیفیت پایین',
  high: 'کیفیت بالا',
}

function getNextRepeatMode(mode: RepeatMode): RepeatMode {
  if (mode === 'none') return 'all'
  if (mode === 'all')  return 'one'
  return 'none'
}

export default function MusicPlayer() {
  const player = usePlayer()
  const { currentUser } = useAuth()
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  // بخش درخواستی: امکان بستن نوار پخش‌کننده با دکمه‌ی × — با پخش دوباره‌ی هر آهنگی (حتی همون آهنگ قبلی) دوباره ظاهر می‌شه
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (player.lastPlayedAt > 0) setIsDismissed(false)
  }, [player.lastPlayedAt])

  // پخش‌کننده فقط باید وقتی کاربر لاگین کرده نمایش داده بشه.
  // قبلاً این کامپوننت در _app.tsx بدون هیچ شرطی رندر می‌شد و در صفحه‌ی لاگین/ثبت‌نام هم دیده می‌شد.
  if (!currentUser) return null
  // اگه کاربر با دکمه‌ی × نوار رو بسته، تا وقتی آهنگ جدیدی پخش نشه چیزی رندر نمی‌شه
  // (خود صدا در PlayerContext مستقل از این UI ادامه پیدا می‌کنه، فقط نوار مخفیه)
  if (isDismissed) return null

  const currentSong = player.currentSong
  const canViewStats = currentUser?.subscription === 'gold'
  const duration = currentSong?.duration ?? 0
  // بخش امتیازی: رنگ غالب کاور آهنگ فعلی، برای هماهنگی رنگ دکمه‌ها/نوار پیشرفت با کاور
  const accentColor = currentSong ? player.dominantColor : '#1DB954'

  function nextQuality(q: AudioQuality): AudioQuality {
    return q === 'low' ? 'high' : 'low'
  }

  function QualityAndCrossfadeControls({ compact = false }: { compact?: boolean }) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'justify-center' : ''}`}>
        <button
          className="rounded-full bg-[#282828] px-3 py-2 text-xs text-white transition-colors hover:bg-[#3E3E3E]"
          onClick={() => player.setQuality(nextQuality(player.quality))}
          title="کیفیت پخش"
          type="button"
        >
          🎚 {qualityLabels[player.quality]}
        </button>
        <button
          className="rounded-full px-3 py-2 text-xs transition-colors"
          onClick={player.toggleCrossfade}
          style={
            player.isCrossfadeEnabled
              ? { background: accentColor, color: '#000' }
              : { background: '#282828', color: '#fff' }
          }
          title="محو تدریجی بین دو آهنگ (Crossfade)"
          type="button"
        >
          🎧 Crossfade {player.isCrossfadeEnabled ? 'روشن' : 'خاموش'}
        </button>
      </div>
    )
  }

  // پخش واقعی صدا (عنصر <audio>) داخل PlayerContext مدیریت می‌شود؛
  // اینجا فقط از currentTime/isPlaying که از همون audio واقعی sync می‌شن استفاده می‌کنیم.

  function handleSelectSong(song: Song) {
    player.playSong(song, player.queue)
  }

  function SongInfo({ compact = false }: { compact?: boolean }) {
    if (!currentSong) {
      return (
        <div className="min-w-0">
          <p className="truncate font-bold text-white">آهنگی انتخاب نشده</p>
          <p className="truncate text-sm text-[#B3B3B3]">از صفحه موسیقی یک آهنگ پخش کنید.</p>
        </div>
      )
    }
    return (
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt={currentSong.title}
          className={`${compact ? 'h-12 w-12' : 'h-14 w-14'} rounded-lg object-cover`}
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
      {/* ── دسکتاپ ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-[#282828] bg-[#181818]/95 px-4 py-3 backdrop-blur md:block">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_minmax(320px,2fr)_minmax(220px,1fr)] items-center gap-4">
          <SongInfo />

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                aria-label="شافل"
                className={`rounded-full px-3 py-2 text-sm transition-colors ${player.isShuffle ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                onClick={player.toggleShuffle}
                type="button"
                title="پخش تصادفی"
              >🔀</button>
              <button className="rounded-full bg-[#282828] px-3 py-2 text-white hover:bg-[#3E3E3E]" onClick={player.playPrev} type="button">⏮</button>
              <button
                className="h-11 w-11 rounded-full bg-white text-lg font-black text-black hover:scale-105 transition-transform"
                onClick={player.togglePlay}
                type="button"
              >
                {player.isPlaying ? '⏸' : '▶'}
              </button>
              <button className="rounded-full bg-[#282828] px-3 py-2 text-white hover:bg-[#3E3E3E]" onClick={player.playNext} type="button">⏭</button>
              <button
                aria-label={repeatLabels[player.repeatMode]}
                className={`rounded-full px-3 py-2 text-sm transition-colors ${player.repeatMode !== 'none' ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                onClick={() => player.setRepeatMode(getNextRepeatMode(player.repeatMode))}
                title={repeatLabels[player.repeatMode]}
                type="button"
              >
                {player.repeatMode === 'one' ? '🔂' : '🔁'}
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
            <div className="hidden md:block">
              <QualityAndCrossfadeControls />
            </div>
            <button
              className={`rounded-full px-3 py-2 text-sm transition-colors ${isQueueOpen ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
              onClick={() => setIsQueueOpen(prev => !prev)}
              type="button"
            >
              صف پخش
            </button>
            <VolumeControl onVolumeChange={player.setVolume} volume={player.volume} />
            <button
              aria-label="بستن نوار پخش‌کننده"
              className="rounded-full bg-[#282828] px-3 py-2 text-sm text-white transition-colors hover:bg-[#3E3E3E]"
              onClick={() => setIsDismissed(true)}
              title="بستن (پخش صدا ادامه پیدا می‌کنه؛ با پخش دوباره‌ی آهنگی، این نوار برمی‌گرده)"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {isQueueOpen && (
          <div className="absolute bottom-24 left-4 w-96 max-w-[calc(100vw-2rem)]">
            <Queue currentSongId={currentSong?.id} onSelectSong={handleSelectSong} queue={player.queue} />
          </div>
        )}
      </div>

      {/* ── موبایل - نوار پایین ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2 border-t border-[#282828] bg-[#181818]/95 p-3 backdrop-blur md:hidden">
        <button
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-right"
          onClick={() => setIsMobileExpanded(true)}
          type="button"
        >
          <div className="min-w-0 flex-1"><SongInfo compact /></div>
          <span
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-black"
            onClick={e => { e.stopPropagation(); player.togglePlay() }}
            role="button"
            tabIndex={0}
          >
            {player.isPlaying ? '⏸' : '▶'}
          </span>
        </button>
        <button
          aria-label="بستن نوار پخش‌کننده"
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#282828] text-white"
          onClick={() => setIsDismissed(true)}
          type="button"
        >
          ✕
        </button>
      </div>

      {/* ── موبایل - تمام صفحه ── */}
      {isMobileExpanded && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#121212] p-5 md:hidden">
          <div className="mb-6 flex items-center justify-between">
            <button className="text-[#B3B3B3]" onClick={() => setIsMobileExpanded(false)} type="button">✕ بستن</button>
            <span className="text-sm text-[#B3B3B3]">پخش موسیقی</span>
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
                <button className={`rounded-full px-4 py-3 ${player.repeatMode !== 'none' ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white'}`} onClick={() => player.setRepeatMode(getNextRepeatMode(player.repeatMode))} type="button">
                  {player.repeatMode === 'one' ? '🔂' : '🔁'}
                </button>
              </div>

              <div className="mt-4 flex justify-center">
                <VolumeControl onVolumeChange={player.setVolume} volume={player.volume} />
              </div>

              <div className="mt-4 flex justify-center">
                <QualityAndCrossfadeControls compact />
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
