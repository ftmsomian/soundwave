import React, { useMemo, useState } from 'react'
import type { ArtistAccounting, PaymentStatus } from '@/types'
import { formatNumber } from '@/utils'

interface Props { rows: ArtistAccounting[] }

const paymentLabels: Record<PaymentStatus, string> = {
  pending:  'در انتظار تسویه',
  settled:  'تسویه شده',
}

const paymentClasses: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  settled: 'bg-[#1DB954]/20 text-[#1DB954]',
}

export default function AccountingTable({ rows }: Props) {
  const [items, setItems] = useState(rows)
  const [month, setMonth] = useState('all')

  const months = useMemo(() => Array.from(new Set(items.map(r => r.month))), [items])
  const filtered = month === 'all' ? items : items.filter(r => r.month === month)

  const totals = filtered.reduce(
    (acc, r) => ({ totalStreams: acc.totalStreams + r.totalStreams, uniqueListeners: acc.uniqueListeners + r.uniqueListeners, earnings: acc.earnings + r.earnings }),
    { totalStreams: 0, uniqueListeners: 0, earnings: 0 }
  )

  function settle(artistId: string, rowMonth: string) {
    setItems(prev => prev.map(r => r.artistId === artistId && r.month === rowMonth ? { ...r, paymentStatus: 'settled' } : r))
  }

  return (
    <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-white">حسابرسی ماهانه هنرمندان</h2>
          <p className="text-sm text-[#B3B3B3]">فقط برای مدیر سامانه.</p>
        </div>
        <select className="input-field md:max-w-xs" onChange={e => setMonth(e.target.value)} value={month}>
          <option value="all">همه ماه‌ها</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-[#282828] p-4">
          <p className="text-sm text-[#B3B3B3]">کل استریم</p>
          <p className="mt-1 text-2xl font-black text-white">{formatNumber(totals.totalStreams)}</p>
        </div>
        <div className="rounded-xl bg-[#282828] p-4">
          <p className="text-sm text-[#B3B3B3]">شنونده یکتا</p>
          <p className="mt-1 text-2xl font-black text-white">{formatNumber(totals.uniqueListeners)}</p>
        </div>
        <div className="rounded-xl bg-[#282828] p-4">
          <p className="text-sm text-[#B3B3B3]">مبلغ قابل پرداخت</p>
          <p className="mt-1 text-2xl font-black text-[#1DB954]">{formatNumber(totals.earnings)} تومان</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-right text-sm">
          <thead className="text-[#B3B3B3]">
            <tr className="border-b border-[#282828]">
              <th className="py-3 font-medium">ماه</th>
              <th className="py-3 font-medium">هنرمند</th>
              <th className="py-3 font-medium">شنونده یکتا</th>
              <th className="py-3 font-medium">استریم</th>
              <th className="py-3 font-medium">درآمد</th>
              <th className="py-3 font-medium">وضعیت</th>
              <th className="py-3 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr className="border-b border-[#282828]/70 last:border-0" key={`${row.artistId}-${row.month}`}>
                <td className="py-4 text-white">{row.month}</td>
                <td className="py-4 font-bold text-white">{row.artistName}</td>
                <td className="py-4 text-[#B3B3B3]">{formatNumber(row.uniqueListeners)}</td>
                <td className="py-4 text-[#B3B3B3]">{formatNumber(row.totalStreams)}</td>
                <td className="py-4 text-[#B3B3B3]">{formatNumber(row.earnings)} تومان</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentClasses[row.paymentStatus]}`}>
                    {paymentLabels[row.paymentStatus]}
                  </span>
                </td>
                <td className="py-4">
                  <button
                    className="rounded-full bg-[#282828] px-3 py-1 text-xs font-bold text-white hover:bg-[#3E3E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    disabled={row.paymentStatus === 'settled'}
                    onClick={() => settle(row.artistId, row.month)}
                    type="button"
                  >ثبت تسویه</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
