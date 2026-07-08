import React, { useMemo, useState } from 'react'
import type { Artist, ArtistStatus } from '@/types'
import { formatDate, formatNumber } from '@/utils'

interface Props { artists: Artist[] }

const statusLabels: Record<ArtistStatus, string> = {
  pending:  'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
}

const statusClasses: Record<ArtistStatus, string> = {
  pending:  'bg-yellow-500/20 text-yellow-300',
  approved: 'bg-[#1DB954]/20 text-[#1DB954]',
  rejected: 'bg-red-500/20 text-red-300',
}

export default function ArtistApprovalTable({ artists }: Props) {
  const [items, setItems] = useState<Artist[]>(artists)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(a =>
      [a.artistName, a.displayName, a.email].some(v => v?.toLowerCase().includes(q))
    )
  }, [items, query])

  function changeStatus(id: string, status: ArtistStatus) {
    if (status === 'rejected') {
      const reason = window.prompt('دلیل رد درخواست را وارد کنید:', 'مدارک ارسالی کافی نیست.')
      if (reason === null) return
      setItems(prev => prev.map(a => a.id === id
        ? { ...a, status, isVerified: false, rejectionReason: reason || 'مشخص نشده' }
        : a
      ))
      return
    }
    setItems(prev => prev.map(a => a.id === id
      ? { ...a, status, isVerified: true, rejectionReason: undefined }
      : a
    ))
  }

  return (
    <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-white">تأیید هنرمندان</h2>
          <p className="text-sm text-[#B3B3B3]">درخواست‌های ثبت‌نام هنرمندان را بررسی و تأیید یا رد کنید.</p>
        </div>
        <input
          className="input-field md:max-w-xs"
          onChange={e => setQuery(e.target.value)}
          placeholder="جست‌وجوی هنرمند..."
          type="search"
          value={query}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-right text-sm">
          <thead className="text-[#B3B3B3]">
            <tr className="border-b border-[#282828]">
              <th className="py-3 font-medium">هنرمند</th>
              <th className="py-3 font-medium">ایمیل</th>
              <th className="py-3 font-medium">نمونه کار</th>
              <th className="py-3 font-medium">تاریخ ثبت</th>
              <th className="py-3 font-medium">فالوئر</th>
              <th className="py-3 font-medium">وضعیت</th>
              <th className="py-3 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(artist => (
              <tr className="border-b border-[#282828]/70 last:border-0" key={artist.id}>
                <td className="py-4">
                  <div className="font-bold text-white">{artist.artistName}</div>
                  <div className="text-xs text-[#B3B3B3]">{artist.displayName}</div>
                </td>
                <td className="py-4 text-[#B3B3B3]">{artist.email}</td>
                <td className="py-4">
                  {artist.portfolioUrl ? (
                    <a className="text-[#1DB954] hover:underline text-xs font-bold" href={artist.portfolioUrl} rel="noreferrer" target="_blank">
                      مشاهده نمونه‌کار
                    </a>
                  ) : (
                    <span className="text-xs text-[#B3B3B3]">—</span>
                  )}
                </td>
                <td className="py-4 text-[#B3B3B3]">{formatDate(artist.createdAt)}</td>
                <td className="py-4 text-[#B3B3B3]">{formatNumber(artist.followersCount)}</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses[artist.status]}`}>
                    {statusLabels[artist.status]}
                  </span>
                  {artist.status === 'rejected' && artist.rejectionReason && (
                    <p className="mt-1 text-[11px] text-red-300">دلیل: {artist.rejectionReason}</p>
                  )}
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-[#1DB954] px-3 py-1 text-xs font-bold text-black hover:bg-[#1ed760] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      disabled={artist.status === 'approved'}
                      onClick={() => changeStatus(artist.id, 'approved')}
                      type="button"
                    >تأیید</button>
                    <button
                      className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      disabled={artist.status === 'rejected'}
                      onClick={() => changeStatus(artist.id, 'rejected')}
                      type="button"
                    >رد</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#B3B3B3]">نتیجه‌ای پیدا نشد.</div>
        )}
      </div>
    </section>
  )
}
