import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import type { AudioQuality, Song, PlayerState, RepeatMode } from '@/types'
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
  /** بخش امتیازی: تغییر کیفیت پخش (واقعاً منبع audio عوض می‌شه، نه فقط نمایش) */
  setQuality: (quality: AudioQuality) => void
  /** بخش امتیازی: روشن/خاموش کردن Crossfade */
  toggleCrossfade: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

// دو فایل دموی متفاوت برای کیفیت پایین/بالا (وقتی آهنگ mock فایل واقعی نداره)
// تا فاز دوم که فایل واقعی چندکیفیته از بک‌اند میاد، تغییر کیفیت واقعاً قابل شنیدن و قابل تست بمونه.
const FALLBACK_AUDIO_BY_QUALITY: Record<AudioQuality, string> = {
  low: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
  high: 'https://actions.google.com/sounds/v1/ambiences/wind_chimes.ogg',
}

const CROSSFADE_SECONDS = 5
const CROSSFADE_STEP_MS = 100
const DEFAULT_ACCENT_COLOR = '#1DB954'

function resolveSrc(song: Song, quality: AudioQuality): string {
  if (song.audioQualities) return song.audioQualities[quality]
  return song.audioUrl || FALLBACK_AUDIO_BY_QUALITY[quality]
}

/** میانگین رنگ غالب یک تصویر رو با canvas محاسبه می‌کنه (بخش امتیازی). */
function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 32
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(DEFAULT_ACCENT_COLOR)
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        resolve(`rgb(${r}, ${g}, ${b})`)
      } catch {
        // مرورگر به‌خاطر CORS نمی‌ذاره پیکسل‌های عکس‌های دامنه‌ی دیگه خونده بشه؛ رنگ پیش‌فرض برمی‌گردونیم
        resolve(DEFAULT_ACCENT_COLOR)
      }
    }
    img.onerror = () => resolve(DEFAULT_ACCENT_COLOR)
    img.src = imageUrl
  })
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  // دو عنصر audio برای Crossfade: در هر لحظه یکی «فعال» و دیگری برای پخش هم‌زمان آهنگ بعدی استفاده می‌شه
  const audioARef = useRef<HTMLAudioElement | null>(null)
  const audioBRef = useRef<HTMLAudioElement | null>(null)
  const activeSlotRef = useRef<'a' | 'b'>('a')
  const crossfadeTimerRef = useRef<number | null>(null)
  const isCrossfadingRef = useRef(false)

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
    volume: PLAYER_DEFAULT_VOLUME,
    repeatMode: 'none',
    isShuffle: false,
    quality: 'high',
    isCrossfadeEnabled: false,
    dominantColor: DEFAULT_ACCENT_COLOR,
    lastPlayedAt: 0,
  })

  const stateRef = useRef(state)
  stateRef.current = state

  function getActiveAudio() {
    return activeSlotRef.current === 'a' ? audioARef.current : audioBRef.current
  }
  function getInactiveAudio() {
    return activeSlotRef.current === 'a' ? audioBRef.current : audioARef.current
  }

  // ساخت دو عنصر audio فقط توی مرورگر
  useEffect(() => {
    const a = new Audio()
    const b = new Audio()
    a.preload = 'metadata'
    b.preload = 'metadata'
    audioARef.current = a
    audioBRef.current = b

    const handleTimeUpdate = () => {
      const active = getActiveAudio()
      if (!active) return
      setState(prev => ({ ...prev, currentTime: active.currentTime }))

      // شروع Crossfade در ۵ ثانیه‌ی پایانی آهنگ (اگه فعال باشه و آهنگ بعدی وجود داشته باشه)
      const s = stateRef.current
      if (
        s.isCrossfadeEnabled &&
        !isCrossfadingRef.current &&
        active.duration &&
        active.duration - active.currentTime <= CROSSFADE_SECONDS &&
        active.duration - active.currentTime > 0
      ) {
        const next = getUpcomingSong(s)
        if (next) startCrossfadeTo(next)
      }
    }
    const handleEnded = () => {
      if (!isCrossfadingRef.current) playNext()
    }

    a.addEventListener('timeupdate', handleTimeUpdate)
    a.addEventListener('ended', handleEnded)
    b.addEventListener('timeupdate', handleTimeUpdate)
    b.addEventListener('ended', handleEnded)

    return () => {
      a.removeEventListener('timeupdate', handleTimeUpdate)
      a.removeEventListener('ended', handleEnded)
      b.removeEventListener('timeupdate', handleTimeUpdate)
      b.removeEventListener('ended', handleEnded)
      a.pause()
      b.pause()
      audioARef.current = null
      audioBRef.current = null
      if (crossfadeTimerRef.current) window.clearInterval(crossfadeTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getUpcomingSong(s: PlayerState): Song | null {
    if (!s.currentSong || s.queue.length === 0) return null
    if (s.repeatMode === 'one') return null // پخش تکراری آهنگ فعلی، Crossfade معنی نداره
    if (s.isShuffle) {
      const available = s.queue.filter(song => song.id !== s.currentSong?.id)
      const list = available.length > 0 ? available : s.queue
      return list[Math.floor(Math.random() * list.length)] || null
    }
    const idx = s.queue.findIndex(song => song.id === s.currentSong?.id)
    if (s.queue[idx + 1]) return s.queue[idx + 1]
    if (s.repeatMode === 'all') return s.queue[0]
    return null
  }

  /** بخش امتیازی: Crossfade — ۵ ثانیه‌ی آخر آهنگ فعلی کم‌کم محو و آهنگ بعدی کم‌کم زیاد می‌شه. */
  function startCrossfadeTo(nextSong: Song) {
    const outgoing = getActiveAudio()
    const incoming = getInactiveAudio()
    if (!outgoing || !incoming) return

    isCrossfadingRef.current = true
    const targetVolume = stateRef.current.volume
    incoming.src = resolveSrc(nextSong, stateRef.current.quality)
    incoming.currentTime = 0
    incoming.volume = 0
    incoming.play().catch(() => undefined)

    const steps = Math.ceil((CROSSFADE_SECONDS * 1000) / CROSSFADE_STEP_MS)
    let step = 0

    crossfadeTimerRef.current = window.setInterval(() => {
      step += 1
      const ratio = Math.min(step / steps, 1)
      outgoing.volume = Math.max(targetVolume * (1 - ratio), 0)
      incoming.volume = Math.min(targetVolume * ratio, targetVolume)

      if (ratio >= 1) {
        if (crossfadeTimerRef.current) window.clearInterval(crossfadeTimerRef.current)
        outgoing.pause()
        outgoing.currentTime = 0
        activeSlotRef.current = activeSlotRef.current === 'a' ? 'b' : 'a'
        isCrossfadingRef.current = false
        setState(prev => ({ ...prev, currentSong: nextSong, currentTime: incoming.currentTime, isPlaying: true }))
      }
    }, CROSSFADE_STEP_MS)
  }

  // هر وقت آهنگ فعلی از بیرون (کلیک کاربر، نه Crossfade) عوض شد، منبع audio فعال رو ست کن
  const lastLoadedSongIdRef = useRef<string | null>(null)
  useEffect(() => {
    const audio = getActiveAudio()
    if (!audio || !state.currentSong) return
    if (isCrossfadingRef.current) return // این حالت رو خود startCrossfadeTo مدیریت می‌کنه

    if (lastLoadedSongIdRef.current !== state.currentSong.id) {
      lastLoadedSongIdRef.current = state.currentSong.id
      audio.src = resolveSrc(state.currentSong, state.quality)
      audio.currentTime = 0
      audio.volume = state.volume
    }

    if (state.isPlaying) {
      audio.play().catch(() => setState(prev => ({ ...prev, isPlaying: false })))
    } else {
      audio.pause()
    }

    // رنگ غالب کاور رو محاسبه کن (بخش امتیازی)
    extractDominantColor(state.currentSong.coverUrl).then(color => {
      setState(prev => (prev.currentSong?.id === state.currentSong?.id ? { ...prev, dominantColor: color } : prev))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentSong])

  // sync پخش/توقف بدون تغییر آهنگ
  useEffect(() => {
    const audio = getActiveAudio()
    if (!audio || !state.currentSong || isCrossfadingRef.current) return
    if (state.isPlaying) {
      audio.play().catch(() => setState(prev => ({ ...prev, isPlaying: false })))
    } else {
      audio.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPlaying])

  // sync حجم صدا (فقط وقتی در حال Crossfade نیستیم؛ وگرنه استارت کراس‌فید خودش حجم رو مدیریت می‌کنه)
  useEffect(() => {
    if (isCrossfadingRef.current) return
    const audio = getActiveAudio()
    if (audio) audio.volume = state.volume
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.volume])

  function playSong(song: Song, queue: Song[] = []) {
    setState(prev => ({ ...prev, currentSong: song, queue, isPlaying: true, currentTime: 0, lastPlayedAt: Date.now() }))
  }

  function togglePlay() {
    setState(prev => {
      if (!prev.currentSong) return prev
      return { ...prev, isPlaying: !prev.isPlaying }
    })
  }

  function playNext() {
    setState(prev => {
      if (!prev.currentSong || prev.queue.length === 0) return prev

      if (prev.repeatMode === 'one') {
        const audio = getActiveAudio()
        if (audio) {
          audio.currentTime = 0
          audio.play().catch(() => undefined)
        }
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
        const audio = getActiveAudio()
        if (audio) audio.currentTime = 0
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
    const audio = getActiveAudio()
    if (audio) audio.currentTime = seconds
    setState(prev => ({ ...prev, currentTime: seconds }))
  }

  function setRepeatMode(mode: RepeatMode) {
    setState(prev => ({ ...prev, repeatMode: mode }))
  }

  function toggleShuffle() {
    setState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))
  }

  /** بخش امتیازی: تغییر کیفیت — واقعاً منبع audio عوض می‌شه و از همون لحظه ادامه پیدا می‌کنه. */
  function setQuality(quality: AudioQuality) {
    setState(prev => {
      if (!prev.currentSong || prev.quality === quality) return { ...prev, quality }

      const audio = getActiveAudio()
      if (audio) {
        const resumeAt = audio.currentTime
        const wasPlaying = !audio.paused
        audio.src = resolveSrc(prev.currentSong, quality)
        audio.currentTime = resumeAt
        if (wasPlaying) audio.play().catch(() => undefined)
      }
      return { ...prev, quality }
    })
  }

  /** بخش امتیازی: روشن/خاموش کردن Crossfade */
  function toggleCrossfade() {
    setState(prev => ({ ...prev, isCrossfadeEnabled: !prev.isCrossfadeEnabled }))
  }

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        setVolume,
        seekTo,
        setRepeatMode,
        toggleShuffle,
        setQuality,
        toggleCrossfade,
      }}
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
