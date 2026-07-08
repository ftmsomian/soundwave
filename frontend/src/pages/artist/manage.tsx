import Head from 'next/head'
import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { DEFAULT_COVER, ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/context/PlayerContext'
import MainLayout from '@/components/layout/MainLayout'
import { mockArtists, mockSongs } from '@/mock'
import type { Song } from '@/types'
import { formatCompactNumber, formatDuration, generateId } from '@/utils'

type WorkType = 'single' | 'album'
type ManagedWork = Song & { type: WorkType; collaborators?: string; coverFileName?: string }

interface WorkForm {
  title: string; type: WorkType; genre: string; releaseYear: string
  collaborators: string; coverUrl: string; coverFileName: string; lyrics: string; duration: string
}

const emptyForm: WorkForm = {
  title: '', type: 'single', genre: '', releaseYear: '',
  collaborators: '', coverUrl: '', coverFileName: '', lyrics: '', duration: '210',
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <p className="text-sm text-[#B3B3B3]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

export default function ArtistManagePage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const player = usePlayer()

  useEffect(() => {
    if (!isLoading && !currentUser) router.push(ROUTES.login)
  }, [currentUser, isLoading, router])

  const currentArtist = currentUser?.role === 'artist'
    ? mockArtists.find(a => a.id === currentUser.id) ?? mockArtists[0]
    : mockArtists[0]

  const initialWorks = useMemo<ManagedWork[]>(
    () => mockSongs
      .filter(s => s.artistId === currentArtist.id)
      .map(s => ({ ...s, type: (s.albumId ? 'album' : 'single') as WorkType })),
    [currentArtist.id]
  )

  const [works, setWorks]       = useState<ManagedWork[]>(initialWorks)
  const [form, setForm]         = useState<WorkForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage]   = useState('')

  function resetForm() { setForm(emptyForm); setEditingId(null) }

  function updateForm<K extends keyof WorkForm>(key: K, value: WorkForm[K]) {
    setMessage(''); setForm(prev => ({ ...prev, [key]: value }))
  }

  function submitWork(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setMessage('نام اثر الزامی است.'); return }
    const now = new Date().toISOString()
    const payload: ManagedWork = {
      id: editingId ?? generateId(),
      title: form.title.trim(),
      type: form.type,
      artistId: currentArtist.id,
      artistName: currentArtist.artistName,
      albumId: form.type === 'album' ? `album-${form.title}` : undefined,
      albumName: form.type === 'album' ? form.title.trim() : undefined,
      coverUrl: form.coverUrl.trim() || DEFAULT_COVER,
      coverFileName: form.coverFileName || undefined,
      duration: Number(form.duration) || 210,
      lyrics: form.lyrics.trim() || undefined,
      genre: form.genre.trim() || undefined,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      streamCount: editingId ? (works.find(w => w.id === editingId)?.streamCount ?? 0) : 0,
      uniqueListenerCount: editingId ? (works.find(w => w.id === editingId)?.uniqueListenerCount ?? 0) : 0,
      collaborators: form.collaborators.trim() || undefined,
      createdAt: editingId ? (works.find(w => w.id === editingId)?.createdAt ?? now) : now,
    }
    setWorks(prev => editingId ? prev.map(w => w.id === editingId ? payload : w) : [payload, ...prev])
    setMessage(editingId ? 'اثر با موفقیت ویرایش شد.' : 'اثر جدید منتشر شد.')
    resetForm()
  }

  function editWork(w: ManagedWork) {
    setEditingId(w.id)
    setForm({
      title: w.title, type: w.type, genre: w.genre ?? '', releaseYear: w.releaseYear ? String(w.releaseYear) : '',
      collaborators: w.collaborators ?? '', coverUrl: w.coverUrl, coverFileName: w.coverFileName ?? '',
      lyrics: w.lyrics ?? '', duration: String(w.duration),
    })
    setMessage('')
  }

  function deleteWork(id: string) {
    setWorks(prev => prev.filter(w => w.id !== id))
    if (editingId === id) resetForm()
    setMessage('اثر حذف شد.')
  }

  if (isLoading || !currentUser) return null

  const isApprovedArtist = currentUser.role === 'artist' && (currentArtist as any).status === 'approved'

  if (!isApprovedArtist) {
    return (
      <>
        <Head><title>مدیریت آثار | SoundWave</title></Head>
        <MainLayout>
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <h1 className="text-2xl font-black text-red-200">دسترسی غیرمجاز</h1>
            <p className="mt-2 text-[#B3B3B3]">
              این بخش فقط برای هنرمندانی است که حساب هنری آن‌ها تأیید شده باشد.
            </p>
            <Link className="btn-primary mt-6 inline-block" href={ROUTES.home}>بازگشت به خانه</Link>
          </div>
        </MainLayout>
      </>
    )
  }

  return (
    <>
      <Head><title>مدیریت آثار | SoundWave</title></Head>
      <MainLayout>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#B3B3B3]">داشبورد هنرمند</p>
              <h1 className="text-3xl font-black md:text-5xl">مدیریت آثار {currentArtist.artistName}</h1>
            </div>
            <Link className="rounded-full bg-[#282828] px-5 py-3 text-sm font-bold text-white hover:bg-[#3E3E3E] text-center" href={ROUTES.artist(currentArtist.id)}>
              صفحه هنرمند
            </Link>
          </div>

          {/* خلاصه آمار */}
          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <DashboardCard label="آثار منتشرشده" value={String(works.length)} />
            <DashboardCard label="استریم کل" value={formatCompactNumber(works.reduce((s, w) => s + w.streamCount, 0))} />
            <DashboardCard label="شنونده یکتا" value={formatCompactNumber(works.reduce((s, w) => s + w.uniqueListenerCount, 0))} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
            {/* فرم آپلود */}
            <form className="rounded-2xl border border-[#282828] bg-[#181818] p-5 h-fit" onSubmit={submitWork}>
              <h2 className="mb-1 text-xl font-black">{editingId ? 'ویرایش اثر' : 'آپلود اثر جدید'}</h2>
              <p className="mb-5 text-sm text-[#B3B3B3]">فایل‌ها در state ذخیره می‌شوند (نسخه آزمایشی).</p>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">نوع انتشار</span>
                  <select className="input-field" value={form.type} onChange={e => updateForm('type', e.target.value as WorkType)}>
                    <option value="single">تک‌آهنگ</option>
                    <option value="album">آلبوم</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">نام اثر *</span>
                  <input className="input-field" placeholder="مثلاً شب‌های تهران" value={form.title} onChange={e => updateForm('title', e.target.value)} />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-[#B3B3B3]">ژانر</span>
                    <input className="input-field" placeholder="پاپ، سنتی..." value={form.genre} onChange={e => updateForm('genre', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-[#B3B3B3]">سال انتشار</span>
                    <input className="input-field" type="number" value={form.releaseYear} onChange={e => updateForm('releaseYear', e.target.value)} />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">هنرمندان همکار</span>
                  <input className="input-field" placeholder="با ویرگول جدا کنید" value={form.collaborators} onChange={e => updateForm('collaborators', e.target.value)} />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">لینک کاور</span>
                  <input className="input-field" placeholder="https://..." value={form.coverUrl} onChange={e => updateForm('coverUrl', e.target.value)} />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">فایل صوتی (نمایشی)</span>
                  <input className="w-full rounded-xl bg-[#282828] p-3 text-sm text-[#B3B3B3] file:ml-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black" accept="audio/*" type="file" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">مدت زمان (ثانیه)</span>
                  <input className="input-field" type="number" min={1} value={form.duration} onChange={e => updateForm('duration', e.target.value)} />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#B3B3B3]">متن آهنگ</span>
                  <textarea className="input-field min-h-28 resize-y" placeholder="متن آهنگ را اینجا بنویسید..." value={form.lyrics} onChange={e => updateForm('lyrics', e.target.value)} />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn-primary" type="submit">{editingId ? 'ذخیره ویرایش' : 'انتشار اثر'}</button>
                {editingId && <button className="btn-outline" onClick={resetForm} type="button">لغو</button>}
              </div>
              {message && <p className="mt-4 text-sm font-bold text-[#1DB954]">{message}</p>}
            </form>

            {/* لیست آثار */}
            <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black">آثار منتشرشده</h2>
                <span className="rounded-full bg-[#282828] px-3 py-1 text-xs text-[#B3B3B3]">{works.length} اثر</span>
              </div>

              {works.length === 0 && (
                <div className="text-center text-[#B3B3B3] py-16">
                  <div className="text-5xl mb-4">🎵</div>
                  <p>هنوز اثری منتشر نکردی</p>
                </div>
              )}

              <div className="space-y-3">
                {works.map(work => (
                  <article className="rounded-2xl bg-[#282828] p-4" key={work.id}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <img alt={work.title} className="h-20 w-20 rounded-xl object-cover" src={work.coverUrl || DEFAULT_COVER} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-white">{work.title}</h3>
                          <span className="rounded-full bg-[#181818] px-2 py-0.5 text-[11px] text-[#B3B3B3]">
                            {work.type === 'album' ? 'آلبوم' : 'تک‌آهنگ'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#B3B3B3]">{work.genre ?? '—'} • {work.releaseYear ?? '—'} • {formatDuration(work.duration)}</p>
                        {work.collaborators && <p className="mt-1 text-xs text-[#B3B3B3]">همکاران: {work.collaborators}</p>}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#B3B3B3]">
                          <span>{formatCompactNumber(work.streamCount)} استریم</span>
                          <span>{formatCompactNumber(work.uniqueListenerCount)} شنونده</span>
                          {work.lyrics && <span>• متن دارد</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black hover:bg-gray-200 transition-colors" onClick={() => player.playSong(work, works)} type="button">▶</button>
                        <button className="rounded-full bg-[#181818] px-4 py-2 text-sm font-bold text-white hover:bg-[#121212] transition-colors" onClick={() => editWork(work)} type="button">ویرایش</button>
                        <button className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/30 transition-colors" onClick={() => deleteWork(work.id)} type="button">حذف</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        </div>
      </MainLayout>
    </>
  )
}
