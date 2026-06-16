import type { NextPage } from 'next'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import AccountingTable from '@/components/admin/AccountingTable'
import ArtistApprovalTable from '@/components/admin/ArtistApprovalTable'
import PricingPanel from '@/components/admin/PricingPanel'
import TicketList from '@/components/admin/TicketList'
import { ROUTES } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { mockArtists, mockSystemUsers, mockTickets, mockUsers } from '@/mock'
import type { ArtistAccounting, SubscriptionTier, UserRole } from '@/types'
import { formatNumber } from '@/utils'

type AdminTab = 'artists' | 'tickets' | 'accounting' | 'pricing' | 'subscriptions'

interface SidebarItem {
  id: AdminTab
  title: string
  description: string
  adminOnly?: boolean
}

const sidebarItems: SidebarItem[] = [
  { id: 'artists', title: 'تأیید هنرمندان', description: 'approve/reject' },
  { id: 'tickets', title: 'تیکت‌ها', description: 'جدول + چت' },
  { id: 'accounting', title: 'حسابرسی ماهانه', description: 'فقط مدیر', adminOnly: true },
  { id: 'pricing', title: 'قیمت اشتراک‌ها', description: 'فقط مدیر', adminOnly: true },
  { id: 'subscriptions', title: 'توزیع اشتراک‌ها', description: 'pie chart', adminOnly: true },
]

const AdminDashboardPage: NextPage = () => {
  const { currentUser } = useAuth()
  const viewer = currentUser ?? mockSystemUsers.find(user => user.role === 'admin') ?? mockSystemUsers[0]
  const isAdmin = viewer.role === 'admin'
  const canUseDashboard = viewer.role === 'admin' || viewer.role === 'support'
  const visibleTabs = sidebarItems.filter(item => !item.adminOnly || isAdmin)
  const [activeTab, setActiveTab] = useState<AdminTab>(visibleTabs[0]?.id ?? 'artists')

  const accountingRows = useMemo<ArtistAccounting[]>(
    () => mockArtists
      .filter(artist => artist.status === 'approved')
      .flatMap((artist, index) => [
        {
          artistId: artist.id,
          artistName: artist.artistName,
          month: '1405-03',
          uniqueListeners: Math.round(artist.uniqueListeners * 0.35),
          totalStreams: Math.round(artist.totalStreams * 0.38),
          earnings: artist.monthlyEarnings,
          paymentStatus: index % 2 === 0 ? 'pending' : 'settled',
        },
        {
          artistId: artist.id,
          artistName: artist.artistName,
          month: '1405-02',
          uniqueListeners: Math.round(artist.uniqueListeners * 0.28),
          totalStreams: Math.round(artist.totalStreams * 0.31),
          earnings: Math.round(artist.monthlyEarnings * 0.82),
          paymentStatus: 'settled',
        },
      ]),
    []
  )

  const subscriptionCounts = useMemo(
    () => mockUsers.reduce<Record<SubscriptionTier, number>>(
      (acc, user) => ({ ...acc, [user.subscription]: acc[user.subscription] + 1 }),
      { free: 0, silver: 0, gold: 0 }
    ),
    []
  )

  if (!canUseDashboard) {
    return (
      <main className="min-h-screen bg-[#121212] px-5 py-10 pb-32 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-black text-red-200">دسترسی غیرمجاز</h1>
          <p className="mt-2 text-[#B3B3B3]">داشبورد مدیریت فقط برای پشتیبان و مدیر سامانه فعال است.</p>
          <Link className="btn-primary mt-6 inline-block" href={ROUTES.home}>بازگشت</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#121212] px-5 py-8 pb-36 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#B3B3B3]">Admin / Support Dashboard</p>
            <h1 className="text-3xl font-black md:text-5xl">داشبورد پشتیبان و مدیر</h1>
          </div>
          <div className="rounded-2xl bg-[#181818] px-4 py-3 text-sm text-[#B3B3B3]">
            نقش فعال: <RoleBadge role={viewer.role} />
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[#282828] bg-[#181818] p-4 lg:sticky lg:top-6 lg:self-start">
            <div className="mb-4 border-b border-[#282828] pb-4">
              <p className="font-black text-white">SoundWave Admin</p>
              <p className="text-sm text-[#B3B3B3]">Sidebar اختصاصی مدیریت</p>
            </div>
            <nav className="space-y-2">
              {visibleTabs.map(item => (
                <button
                  className={`w-full rounded-xl p-4 text-right transition-colors ${activeTab === item.id ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                >
                  <span className="block font-black">{item.title}</span>
                  <span className={`block text-xs ${activeTab === item.id ? 'text-black/70' : 'text-[#B3B3B3]'}`}>{item.description}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <DashboardSummary isAdmin={isAdmin} pendingArtists={mockArtists.filter(artist => artist.status === 'pending').length} ticketCount={mockTickets.length} />

            {activeTab === 'artists' && <ArtistApprovalTable artists={mockArtists} />}
            {activeTab === 'tickets' && <TicketList tickets={mockTickets} />}
            {activeTab === 'accounting' && isAdmin && <AccountingTable rows={accountingRows} />}
            {activeTab === 'pricing' && isAdmin && <PricingPanel />}
            {activeTab === 'subscriptions' && isAdmin && <SubscriptionPieChart counts={subscriptionCounts} />}
          </div>
        </section>
      </div>
    </main>
  )
}

function DashboardSummary({ pendingArtists, ticketCount, isAdmin }: { pendingArtists: number; ticketCount: number; isAdmin: boolean }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <SummaryCard label="درخواست هنرمند" value={formatNumber(pendingArtists)} />
      <SummaryCard label="تیکت فعال" value={formatNumber(ticketCount)} />
      <SummaryCard label="سطح دسترسی" value={isAdmin ? 'مدیر' : 'پشتیبان'} />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <p className="text-sm text-[#B3B3B3]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const className = role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
  return <span className={`mr-2 rounded-full px-2 py-1 text-xs font-bold ${className}`}>{role === 'admin' ? 'مدیر' : 'پشتیبان'}</span>
}

function SubscriptionPieChart({ counts }: { counts: Record<SubscriptionTier, number> }) {
  const labels: Record<SubscriptionTier, string> = { free: 'رایگان', silver: 'نقره‌ای', gold: 'طلایی' }
  const total = counts.free + counts.silver + counts.gold || 1
  const freePercent = (counts.free / total) * 100
  const silverPercent = (counts.silver / total) * 100
  const goldPercent = (counts.gold / total) * 100

  return (
    <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <div className="mb-6">
        <h2 className="text-xl font-black text-white">نمودار توزیع اشتراک‌ها</h2>
        <p className="text-sm text-[#B3B3B3]">pie chart فقط برای مدیر سامانه</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[280px_minmax(0,1fr)] md:items-center">
        <div className="mx-auto aspect-square w-64 rounded-full" style={{ background: `conic-gradient(#535353 0 ${freePercent}%, #C0C0C0 ${freePercent}% ${freePercent + silverPercent}%, #FACC15 ${freePercent + silverPercent}% 100%)` }} />
        <div className="space-y-3">
          {(['free', 'silver', 'gold'] as SubscriptionTier[]).map(tier => {
            const percent = Math.round((counts[tier] / total) * 100)
            return (
              <div className="rounded-xl bg-[#282828] p-4" key={tier}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-white">{labels[tier]}</span>
                  <span className="text-[#B3B3B3]">{counts[tier]} کاربر • {percent}٪</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#181818]">
                  <div className="h-full rounded-full bg-[#1DB954]" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default AdminDashboardPage
