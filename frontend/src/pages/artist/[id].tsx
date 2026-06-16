import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import { ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/hooks/usePlayer'
import { mockAlbums, mockArtists, mockSongs } from '@/mock'
import type { Song } from '@/types'
import { formatCompactNumber, formatDuration, formatNumber } from '@/utils'

const ArtistProfilePage: NextPage = () => {
  const router = useRouter()
  const { currentUser } = useAuth()
  const player = usePlayer()
  const artistId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id

  const artist = mockArtists.find(item => item.id === artistId)
  const [isFollowing, setIsFollowing] = useState(false)

  const artistSongs = useMemo(() => mockSongs.filter(song => song.artistId === artist?.id), [artist?.id])
  const albums = useMemo(() => mockAlbums.filter(album => album.artistId === artist?.id), [artist?.id])
  const singles = useMemo(() => artistSongs.filter(song => !song.albumId), [artistSongs])
  const canViewStats = currentUser?.subscription === 'gold'

  function play(song: Song) {
    player.playSong(song, artistSongs)
  }

  if (!router.isReady) {
    return (
      <main className="min-h-screen bg-[#121212] px-5 py-10 pb-32 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[#181818] p-8 text-center text-[#B3B3B3]">در حال بارگذاری صفحه هنرمند...</div>
      </main>
    )
  }

  if (!artist) {
    return (
      <main className="min-h-screen bg-[#121212] px-5 py-10 pb-32 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl bg-[#181818] p-8 text-center">
          <h1 className="text-2xl font-black">هنرمند پیدا نشد</h1>
          <p className="mt-2 text-[#B3B3B3]">شناسه واردشده با هیچ هنرمندی در داده‌های mock مطابقت ندارد.</p>
          <Link className="btn-primary mt-6 inline-block" href={ROUTES.home}>بازگشت به خانه</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#121212] px-5 py-8 pb-36 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#B3B3B3]">
          <Link className="hover:text-[#1DB954]" href={ROUTES.home}>خانه</Link>
          <Link className="rounded-full bg-[#282828] px-4 py-2 text-white hover:bg-[#3E3E3E]" href={ROUTES.artistManage}>
            مدیریت آثار هنرمند
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-[#282828] bg-gradient-to-br from-[#1DB954]/25 via-[#181818] to-[#121212] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <img
              alt={artist.artistName}
              className="h-36 w-36 rounded-3xl object-cover ring-4 ring-white/10 md:h-48 md:w-48"
              src={artist.avatarUrl ?? `https://picsum.photos/seed/${artist.id}/300`}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">Artist Profile</span>
                {artist.isVerified && (
                  <span className="badge-verified rounded-full bg-[#1DB954]/15 px-3 py-1 text-xs font-bold">✓ هنرمند تأییدشده</span>
                )}
              </div>
              <h1 className="text-4xl font-black md:text-6xl">{artist.artistName}</h1>
              <p className="mt-4 max-w-3xl leading-8 text-[#DADADA]">{artist.bio || 'بیوگرافی برای این هنرمند ثبت نشده است.'}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#B3B3B3]">
                <span>{formatNumber(artist.followersCount + (isFollowing ? 1 : 0))} دنبال‌کننده</span>
                <span>•</span>
                <span>{artistSongs.length} اثر منتشرشده</span>
                {artist.status === 'approved' && <><span>•</span><span>فعال و قابل پخش</span></>}
              </div>
            </div>
            <button
              className={`rounded-full px-8 py-3 font-bold transition-colors ${isFollowing ? 'bg-[#282828] text-white hover:bg-[#3E3E3E]' : 'bg-[#1DB954] text-black hover:bg-[#1ed760]'}`}
              onClick={() => setIsFollowing(prev => !prev)}
              type="button"
            >
              {isFollowing ? 'لغو دنبال کردن' : 'دنبال کردن'}
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="فالوئر" value={formatCompactNumber(artist.followersCount + (isFollowing ? 1 : 0))} />
          {canViewStats ? (
            <>
              <StatCard label="شنونده یکتا" value={formatCompactNumber(artist.uniqueListeners)} />
              <StatCard label="کل استریم" value={formatCompactNumber(artist.totalStreams)} />
            </>
          ) : (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 md:col-span-2">
              <p className="font-bold text-yellow-300">آمار کلی شنوندگان فقط برای کاربران طلایی نمایش داده می‌شود.</p>
              <p className="mt-2 text-sm text-[#B3B3B3]">برای دیدن شنونده‌های یکتا و استریم‌های هنرمند، اشتراک طلایی لازم است.</p>
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">آلبوم‌ها</h2>
            <span className="text-sm text-[#B3B3B3]">{albums.length} آلبوم</span>
          </div>
          {albums.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {albums.map(album => (
                <article className="card cursor-default" key={album.id}>
                  <img alt={album.title} className="mb-4 aspect-square w-full rounded-xl object-cover" src={album.coverUrl} />
                  <h3 className="text-lg font-black text-white">{album.title}</h3>
                  <p className="mt-1 text-sm text-[#B3B3B3]">{album.releaseYear ?? 'سال نامشخص'} • {album.genre ?? 'بدون ژانر'}</p>
                  <p className="mt-2 text-sm text-[#B3B3B3]">{album.songs.length} آهنگ • {formatCompactNumber(album.streamCount)} استریم</p>
                  <button className="mt-4 rounded-full bg-[#1DB954] px-4 py-2 text-sm font-bold text-black" onClick={() => album.songs[0] && play(album.songs[0])} type="button">
                    پخش آلبوم
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState text="آلبومی برای این هنرمند ثبت نشده است." />
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">تک‌آهنگ‌ها و آهنگ‌ها</h2>
            <span className="text-sm text-[#B3B3B3]">{artistSongs.length} آهنگ</span>
          </div>

          {artistSongs.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-[#282828] bg-[#181818]">
              {artistSongs.map((song, index) => (
                <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-[#282828] p-3 last:border-0 hover:bg-[#282828] md:grid-cols-[40px_1fr_140px_120px_auto]" key={song.id}>
                  <span className="text-center text-[#B3B3B3]">{index + 1}</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <img alt={song.title} className="h-12 w-12 rounded-lg object-cover" src={song.coverUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{song.title}</p>
                      <p className="truncate text-xs text-[#B3B3B3]">{song.albumName ?? 'تک‌آهنگ'} {song.isEarlyAccess ? '• دسترسی زودهنگام' : ''}</p>
                    </div>
                  </div>
                  <span className="hidden text-sm text-[#B3B3B3] md:block">{song.genre ?? '—'}</span>
                  <span className="hidden text-sm text-[#B3B3B3] md:block">{formatDuration(song.duration)}</span>
                  <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black" onClick={() => play(song)} type="button">
                    پخش
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="تک‌آهنگی برای این هنرمند ثبت نشده است." />
          )}
        </section>

        {singles.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-black">تک‌آهنگ‌های مستقل</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {singles.map(song => (
                <article className="card cursor-default" key={song.id}>
                  <img alt={song.title} className="mb-3 aspect-square w-full rounded-xl object-cover" src={song.coverUrl} />
                  <h3 className="font-bold text-white">{song.title}</h3>
                  <p className="text-sm text-[#B3B3B3]">{song.releaseYear ?? 'سال نامشخص'} • {song.genre ?? 'بدون ژانر'}</p>
                  <button className="mt-3 rounded-full bg-[#282828] px-4 py-2 text-sm font-bold text-white hover:bg-[#3E3E3E]" onClick={() => play(song)} type="button">
                    پخش
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <p className="text-sm text-[#B3B3B3]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-[#282828] bg-[#181818] p-6 text-[#B3B3B3]">{text}</div>
}

export default ArtistProfilePage
