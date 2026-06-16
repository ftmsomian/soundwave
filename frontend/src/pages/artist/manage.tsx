import type { NextPage } from 'next'
import Link from 'next/link'
import React, { FormEvent, useMemo, useState } from 'react'
import { DEFAULT_COVER, ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/hooks/usePlayer'
import { mockArtists, mockSongs } from '@/mock'
import type { Song } from '@/types'
import { formatCompactNumber, formatDuration, generateId } from '@/utils'

type WorkType = 'single' | 'album'

type ManagedWork = Song & {
  type: WorkType
  collaborators?: string
  coverFileName?: string
}

interface WorkFormState {
  title: string
  type: WorkType
  genre: string
  releaseYear: string
  collaborators: string
  coverUrl: string
  coverFileName: string
  lyrics: string
  duration: string
}

const emptyForm: WorkFormState = {
  title: '',
  type: 'single',
  genre: '',
  releaseYear: '',
  collaborators: '',
  coverUrl: '',
  coverFileName: '',
  lyrics: '',
  duration: '210',
}

const ArtistManagePage: NextPage = () => {
  const { currentUser } = useAuth()
  const player = usePlayer()
  const currentArtist = currentUser?.role === 'artist'
    ? mockArtists.find(artist => artist.id === currentUser.id) ?? mockArtists[0]
    : mockArtists[0]

  const initialWorks = useMemo<ManagedWork[]>(
    () => mockSongs
      .filter(song => song.artistId === currentArtist.id)
      .map(song => ({ ...song, type: song.albumId ? 'album' : 'single' })),
    [currentArtist.id]
  )

  const [works, setWorks] = useState<ManagedWork[]>(initialWorks)
  const [form, setForm] = useState<WorkFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function submitWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setMessage('نام اثر الزامی است.')
      return
    }

    const now = new Date().toISOString()
    const payload: ManagedWork = {
      id: editingId ?? generateId(),
      title,
      type: form.type,
      artistId: currentArtist.id,
      artistName: currentArtist.artistName,
      albumId: form.type === 'album' ? `album-${editingId ?? title}` : undefined,
      albumName: form.type === 'album' ? title : undefined,
      coverUrl: form.coverUrl.trim() || DEFAULT_COVER,
      coverFileName: form.coverFileName || undefined,
      duration: Number(form.duration) || 210,
      lyrics: form.lyrics.trim() || undefined,
      genre: form.genre.trim() || undefined,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      streamCount: editingId ? works.find(work => work.id === editingId)?.streamCount ?? 0 : 0,
      uniqueListenerCount: editingId ? works.find(work => work.id === editingId)?.uniqueListenerCount ?? 0 : 0,
      collaborators: form.collaborators.trim() || undefined,
      createdAt: editingId ? works.find(work => work.id === editingId)?.createdAt ?? now : now,
    }

    setWorks(prev => (editingId ? prev.map(work => (work.id === editingId ? payload : work)) : [payload, ...prev]))
    setMessage(editingId ? 'اثر با موفقیت ویرایش شد.' : 'اثر جدید به فهرست منتشرشده اضافه شد.')
    resetForm()
  }

  function editWork(work: ManagedWork) {
    setEditingId(work.id)
    setForm({
      title: work.title,
      type: work.type,
      genre: work.genre ?? '',
      releaseYear: work.releaseYear ? String(work.releaseYear) : '',
      collaborators: work.collaborators ?? '',
      coverUrl: work.coverUrl,
      coverFileName: work.coverFileName ?? '',
      lyrics: work.lyrics ?? '',
      duration: String(work.duration),
    })
    setMessage('')
  }

  function deleteWork(workId: string) {
    setWorks(prev => prev.filter(work => work.id !== workId))
    if (editingId === workId) resetForm()
    setMessage('اثر حذف شد.')
  }

  function updateForm<K extends keyof WorkFormState>(key: K, value: WorkFormState[K]) {
    setMessage('')
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function play(work: ManagedWork) {
    player.playSong(work, works)
  }

  return (
    <main className="min-h-screen bg-[#121212] px-5 py-8 pb-36 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#B3B3B3]">داشبورد هنرمند</p>
            <h1 className="text-3xl font-black md:text-5xl">مدیریت آثار {currentArtist.artistName}</h1>
          </div>
          <Link className="rounded-full bg-[#282828] px-5 py-3 text-sm font-bold text-white hover:bg-[#3E3E3E]" href={ROUTES.artist(currentArtist.id)}>
            مشاهده صفحه هنرمند
          </Link>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <DashboardCard label="آثار منتشرشده" value={String(works.length)} />
          <DashboardCard label="استریم کل" value={formatCompactNumber(works.reduce((sum, work) => sum + work.streamCount, 0))} />
          <DashboardCard label="شنونده یکتا" value={formatCompactNumber(works.reduce((sum, work) => sum + work.uniqueListenerCount, 0))} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form className="rounded-2xl border border-[#282828] bg-[#181818] p-5" onSubmit={submitWork}>
            <h2 className="mb-1 text-xl font-black">{editingId ? 'ویرایش اثر' : 'آپلود تک‌آهنگ یا آلبوم'}</h2>
            <p className="mb-5 text-sm text-[#B3B3B3]">در این نسخه فایل‌ها به‌صورت نمایشی انتخاب می‌شوند و داده‌ها در state صفحه ذخیره می‌شوند.</p>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">نوع انتشار</span>
                <select className="input-field" onChange={(event: any) => updateForm('type', event.target.value as WorkType)} value={form.type}>
                  <option value="single">تک‌آهنگ</option>
                  <option value="album">آلبوم</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">نام اثر</span>
                <input className="input-field" onChange={(event: any) => updateForm('title', event.target.value)} placeholder="مثلاً شب‌های تهران" value={form.title} />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">ژانر</span>
                  <input className="input-field" onChange={(event: any) => updateForm('genre', event.target.value)} placeholder="پاپ، سنتی..." value={form.genre} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">سال انتشار</span>
                  <input className="input-field" onChange={(event: any) => updateForm('releaseYear', event.target.value)} type="number" value={form.releaseYear} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">هنرمندان همکار</span>
                <input className="input-field" onChange={(event: any) => updateForm('collaborators', event.target.value)} placeholder="نام‌ها را با ویرگول جدا کنید" value={form.collaborators} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">لینک کاور یا آپلود کاور</span>
                <input className="input-field mb-3" onChange={(event: any) => updateForm('coverUrl', event.target.value)} placeholder="https://..." value={form.coverUrl} />
                <input
                  className="w-full rounded-xl bg-[#282828] p-3 text-sm text-[#B3B3B3] file:ml-4 file:rounded-full file:border-0 file:bg-[#1DB954] file:px-4 file:py-2 file:font-bold file:text-black"
                  accept="image/*"
                  onChange={(event: any) => updateForm('coverFileName', event.target.files?.[0]?.name ?? '')}
                  type="file"
                />
                {form.coverFileName && <p className="mt-2 text-xs text-[#1DB954]">فایل انتخاب‌شده: {form.coverFileName}</p>}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">فایل صوتی</span>
                <input className="w-full rounded-xl bg-[#282828] p-3 text-sm text-[#B3B3B3] file:ml-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black" accept="audio/*" type="file" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">مدت زمان / ثانیه</span>
                <input className="input-field" min={1} onChange={(event: any) => updateForm('duration', event.target.value)} type="number" value={form.duration} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#B3B3B3]">متن آهنگ</span>
                <textarea className="input-field min-h-32 resize-y" onChange={(event: any) => updateForm('lyrics', event.target.value)} placeholder="متن آهنگ را وارد کنید..." value={form.lyrics} />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">{editingId ? 'ذخیره ویرایش' : 'انتشار اثر'}</button>
              {editingId && <button className="btn-outline" onClick={resetForm} type="button">لغو</button>}
            </div>
            {message && <p className="mt-4 text-sm font-bold text-[#1DB954]">{message}</p>}
          </form>

          <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">لیست آثار منتشرشده با آمار</h2>
                <p className="text-sm text-[#B3B3B3]">ویرایش، حذف و پخش آثار منتشرشده</p>
              </div>
              <span className="rounded-full bg-[#282828] px-3 py-1 text-xs text-[#B3B3B3]">{works.length} اثر</span>
            </div>

            <div className="space-y-3">
              {works.map(work => (
                <article className="rounded-2xl bg-[#282828] p-4" key={work.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <img alt={work.title} className="h-20 w-20 rounded-xl object-cover" src={work.coverUrl || DEFAULT_COVER} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-white">{work.title}</h3>
                        <span className="rounded-full bg-[#181818] px-2 py-1 text-[11px] text-[#B3B3B3]">{work.type === 'album' ? 'آلبوم' : 'تک‌آهنگ'}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#B3B3B3]">{work.genre ?? 'بدون ژانر'} • {work.releaseYear ?? 'سال نامشخص'} • {formatDuration(work.duration)}</p>
                      {work.collaborators && <p className="mt-1 text-xs text-[#B3B3B3]">همکاران: {work.collaborators}</p>}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#B3B3B3]">
                        <span>{formatCompactNumber(work.streamCount)} استریم</span>
                        <span>{formatCompactNumber(work.uniqueListenerCount)} شنونده</span>
                        {work.lyrics && <span>متن آهنگ دارد</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black" onClick={() => play(work)} type="button">پخش</button>
                      <button className="rounded-full bg-[#181818] px-4 py-2 text-sm font-bold text-white" onClick={() => editWork(work)} type="button">ویرایش</button>
                      <button className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300" onClick={() => deleteWork(work.id)} type="button">حذف</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <p className="text-sm text-[#B3B3B3]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

export default ArtistManagePage
