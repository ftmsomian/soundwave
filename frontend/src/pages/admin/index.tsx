import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AccountingTable from '@/components/admin/AccountingTable'
import ArtistApprovalTable from '@/components/admin/ArtistApprovalTable'
import PricingPanel from '@/components/admin/PricingPanel'
import TicketList from '@/components/admin/TicketList'
import { ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import { mockArtists, mockTickets, mockUsers } from '@/mock'
import type { ArtistAccounting, SubscriptionTier, UserRole } from '@/types'
import { formatNumber } from '@/utils'

type AdminTab = 'artists' | 'tickets' | 'accounting' | 'pricing' | 'subscriptions'

const sidebarItems: { id: AdminTab; title: string; desc: string; adminOnly?: boolean }[] = [
  { id: 'artists',       title: 'تأیید هنرمندان',  desc: 'approve / reject' },
  { id: 'tickets',       title: 'تیکت‌ها',          desc: 'جدول + چت' },
  { id: 'accounting',    title: 'حسابرسی ماهانه',  desc: 'فقط مدیر', adminOnly: true },
  { id: 'pricing',       title: 'قیمت اشتراک‌ها',  desc: 'فقط مدیر', adminOnly: true },
  { id: 'subscriptions', title: 'توزیع اشتراک‌ها', desc: 'نمودار',    adminOnly: true },
]

function RoleBadge({ role }: { role: UserRole }) {
  const cls = role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
  return <span className={`mr-2 rounded-full px-2 py-1 text-xs font-bold ${cls}`}>{role === 'admin' ? 'مدیر' : 'پشتیبان'}</span>
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <p className="text-sm text-[#B3B3B3]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function SubscriptionPieChart({ counts }: { counts: Record<SubscriptionTier, number> }) {
  const total = counts.free + counts.silver + counts.gold || 1
  const freeP   = (counts.free   / total) * 100
  const silverP = (counts.silver / total) * 100
  const goldP   = (counts.gold   / total) * 100

  return (
    <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <h2 className="text-xl font-black text-white mb-1">نمودار توزیع اشتراک‌ها</h2>
      <p className="text-sm text-[#B3B3B3] mb-6">فقط برای مدیر سامانه</p>
      <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
        <div
          className="mx-auto aspect-square w-56 rounded-full"
          style={{ background: `conic-gradient(#535353 0 ${freeP}%, #C0C0C0 ${freeP}% ${freeP + silverP}%, #FACC15 ${freeP + silverP}% 100%)` }}
        />
        <div className="space-y-3">
          {([['free', 'رایگان', '#535353'], ['silver', 'نقره‌ای', '#C0C0C0'], ['gold', 'طلایی', '#FACC15']] as const).map(([tier, label, color]) => (
            <div className="rounded-xl bg-[#282828] p-4" key={tier}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full inline-block" style={{ background: color }} />
                  <span className="font-bold text-white">{label}</span>
                </div>
                <span className="text-[#B3B3B3]">{counts[tier]} کاربر • {Math.round((counts[tier] / total) * 100)}٪</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#181818]">
                <div className="h-full rounded-full bg-[#1DB954]" style={{ width: `${Math.round((counts[tier] / total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AdminDashboardPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !currentUser) router.push(ROUTES.login)
  }, [currentUser, isLoading, router])

  const isAdmin        = currentUser?.role === 'admin'
  const canUseDashboard = currentUser?.role === 'admin' || currentUser?.role === 'support'
  const visibleTabs    = sidebarItems.filter(i => !i.adminOnly || isAdmin)

  const [activeTab, setActiveTab] = useState<AdminTab>(visibleTabs[0]?.id ?? 'artists')

  const accountingRows = useMemo<ArtistAccounting[]>(() =>
    mockArtists.filter(a => a.status === 'approved').flatMap((a, i) => [
      { artistId: a.id, artistName: a.artistName, month: '1403-03', uniqueListeners: Math.round(a.uniqueListeners * 0.35), totalStreams: Math.round(a.totalStreams * 0.38), earnings: a.monthlyEarnings, paymentStatus: i % 2 === 0 ? 'pending' : 'settled' },
      { artistId: a.id, artistName: a.artistName, month: '1403-02', uniqueListeners: Math.round(a.uniqueListeners * 0.28), totalStreams: Math.round(a.totalStreams * 0.31), earnings: Math.round(a.monthlyEarnings * 0.82), paymentStatus: 'settled' },
    ] as ArtistAccounting[]),
  [])

  const subscriptionCounts = useMemo(() =>
    mockUsers.reduce<Record<SubscriptionTier, number>>(
      (acc, u) => ({ ...acc, [u.subscription]: acc[u.subscription] + 1 }),
      { free: 0, silver: 0, gold: 0 }
    ), []
  )

  if (isLoading) return null

  if (!canUseDashboard) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-black text-red-200">دسترسی غیرمجاز</h1>
          <p className="mt-2 text-[#B3B3B3]">داشبورد مدیریت فقط برای پشتیبان و مدیر سامانه فعال است.</p>
          <Link className="btn-primary mt-6 inline-block" href={ROUTES.home}>بازگشت به خانه</Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <>
      <Head><title>داشبورد مدیریت | SoundWave</title></Head>
      <MainLayout>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#B3B3B3]">Admin / Support Dashboard</p>
              <h1 className="text-3xl font-black md:text-5xl">داشبورد مدیریت</h1>
            </div>
            <div className="rounded-2xl bg-[#181818] px-4 py-3 text-sm text-[#B3B3B3]">
              نقش فعال: <RoleBadge role={currentUser!.role} />
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* سایدبار */}
            <aside className="rounded-2xl border border-[#282828] bg-[#181818] p-4 lg:sticky lg:top-6 lg:self-start">
              <div className="mb-4 border-b border-[#282828] pb-4">
                <p className="font-black text-white">SoundWave Admin</p>
                <p className="text-sm text-[#B3B3B3]">پنل مدیریت</p>
              </div>
              <nav className="space-y-2">
                {visibleTabs.map(item => (
                  <button
                    key={item.id}
                    className={`w-full rounded-xl p-4 text-right transition-colors ${activeTab === item.id ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                    onClick={() => setActiveTab(item.id)}
                    type="button"
                  >
                    <span className="block font-black">{item.title}</span>
                    <span className={`block text-xs ${activeTab === item.id ? 'text-black/70' : 'text-[#B3B3B3]'}`}>{item.desc}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* محتوا */}
            <div className="min-w-0 space-y-6">
              {/* خلاصه */}
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label="درخواست هنرمند" value={formatNumber(mockArtists.filter(a => a.status === 'pending').length)} />
                <SummaryCard label="تیکت فعال"      value={formatNumber(mockTickets.length)} />
                <SummaryCard label="سطح دسترسی"    value={isAdmin ? 'مدیر' : 'پشتیبان'} />
              </div>

              {activeTab === 'artists'       && <ArtistApprovalTable artists={mockArtists} />}
              {activeTab === 'tickets'       && <TicketList tickets={mockTickets} />}
              {activeTab === 'accounting'    && isAdmin && <AccountingTable rows={accountingRows} />}
              {activeTab === 'pricing'       && isAdmin && <PricingPanel />}
              {activeTab === 'subscriptions' && isAdmin && <SubscriptionPieChart counts={subscriptionCounts} />}
            </div>
          </section>
        </div>
      </MainLayout>
    </>
  )
}
