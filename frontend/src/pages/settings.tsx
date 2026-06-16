import type { NextPage } from 'next'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { DEFAULT_SYSTEM_VOLUME, ROUTES, SETTINGS_MAX_VOLUME, SETTINGS_MIN_VOLUME, STORAGE_KEYS } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { mockUsers } from '@/mock'
import type { SubscriptionTier } from '@/types'

interface SettingsState {
  notifications: {
    newRelease: boolean
    subscription: boolean
    ticket: boolean
    marketing: boolean
  }
  systemVolume: number
  language: 'fa' | 'en'
}

const defaultSettings: SettingsState = {
  notifications: {
    newRelease: true,
    subscription: true,
    ticket: true,
    marketing: false,
  },
  systemVolume: DEFAULT_SYSTEM_VOLUME,
  language: 'fa',
}

const subscriptionLabels: Record<SubscriptionTier, string> = {
  free: 'رایگان',
  silver: 'نقره‌ای',
  gold: 'طلایی',
}

const SettingsPage: NextPage = () => {
  const { currentUser } = useAuth()
  const user = currentUser ?? mockUsers[0]
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [saveMessage, setSaveMessage] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    const rawSettings = window.localStorage.getItem(STORAGE_KEYS.settings)
    if (!rawSettings) return

    try {
      setSettings({ ...defaultSettings, ...JSON.parse(rawSettings) })
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.settings)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  }, [settings])

  function toggleNotification(key: keyof SettingsState['notifications']) {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }))
    setSaveMessage('تنظیمات اعلان ذخیره شد.')
  }

  function updateSystemVolume(value: number) {
    setSettings(prev => ({ ...prev, systemVolume: Math.min(Math.max(value, SETTINGS_MIN_VOLUME), SETTINGS_MAX_VOLUME) }))
    setSaveMessage('صدای سامانه ذخیره شد.')
  }

  function updateLanguage(language: SettingsState['language']) {
    setSettings(prev => ({ ...prev, language }))
    setSaveMessage('زبان ذخیره شد.')
  }

  return (
    <main className="min-h-screen bg-[#121212] px-5 py-8 pb-36 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#B3B3B3]">User Settings</p>
            <h1 className="text-3xl font-black md:text-5xl">تنظیمات</h1>
          </div>
          <Link className="rounded-full bg-[#282828] px-5 py-3 text-sm font-bold text-white hover:bg-[#3E3E3E]" href={ROUTES.home}>
            بازگشت به خانه
          </Link>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
            <h2 className="text-xl font-black">تنظیمات اعلان‌ها</h2>
            <p className="mt-1 text-sm text-[#B3B3B3]">مشخص کنید چه اعلان‌هایی برای شما فعال باشد.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <NotificationToggle label="انتشار آهنگ جدید" checked={settings.notifications.newRelease} onChange={() => toggleNotification('newRelease')} />
              <NotificationToggle label="یادآوری اشتراک" checked={settings.notifications.subscription} onChange={() => toggleNotification('subscription')} />
              <NotificationToggle label="پاسخ تیکت پشتیبانی" checked={settings.notifications.ticket} onChange={() => toggleNotification('ticket')} />
              <NotificationToggle label="خبرنامه و پیشنهادها" checked={settings.notifications.marketing} onChange={() => toggleNotification('marketing')} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
            <h2 className="text-xl font-black">تغییر صدای سامانه</h2>
            <p className="mt-1 text-sm text-[#B3B3B3]">این مقدار برای صدای افکت‌ها و اعلان‌های داخل سامانه استفاده می‌شود.</p>
            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                aria-label="صدای سامانه"
                className="h-2 flex-1 cursor-pointer accent-[#1DB954]"
                max={SETTINGS_MAX_VOLUME}
                min={SETTINGS_MIN_VOLUME}
                onChange={(event: any) => updateSystemVolume(Number(event.target.value))}
                type="range"
                value={settings.systemVolume}
              />
              <span className="w-16 rounded-full bg-[#282828] px-3 py-2 text-center font-bold text-white">{settings.systemVolume}٪</span>
            </div>
          </section>

          <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
            <h2 className="text-xl font-black">تغییر زبان</h2>
            <p className="mt-1 text-sm text-[#B3B3B3]">زبان رابط کاربری را انتخاب کنید.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <button
                className={`rounded-2xl p-4 text-right font-bold ${settings.language === 'fa' ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                onClick={() => updateLanguage('fa')}
                type="button"
              >
                فارسی
              </button>
              <button
                className={`rounded-2xl p-4 text-right font-bold ${settings.language === 'en' ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                onClick={() => updateLanguage('en')}
                type="button"
              >
                English
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">نوع اشتراک</h2>
                <p className="mt-1 text-sm text-[#B3B3B3]">اشتراک فعلی شما: <span className="font-bold text-white">{subscriptionLabels[user.subscription]}</span></p>
                {user.subscriptionExpiresAt && <p className="mt-1 text-xs text-[#B3B3B3]">تاریخ انقضا: {new Date(user.subscriptionExpiresAt).toLocaleDateString('fa-IR')}</p>}
              </div>
              <Link className="btn-primary text-center" href={`${ROUTES.settings}#upgrade`}>
                ارتقا اشتراک
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3" id="upgrade">
              <PlanCard title="رایگان" active={user.subscription === 'free'} description="محدودیت پخش روزانه و امکانات پایه" />
              <PlanCard title="نقره‌ای" active={user.subscription === 'silver'} description="دانلود، آپلود آواتار و پلی‌لیست بیشتر" />
              <PlanCard title="طلایی" active={user.subscription === 'gold'} description="آمار شنونده، دسترسی زودهنگام و بدون محدودیت" />
            </div>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <h2 className="text-xl font-black text-red-200">حذف حساب</h2>
            <p className="mt-1 text-sm text-[#B3B3B3]">این گزینه در نسخه mock فقط پیام تأیید نمایش می‌دهد و حذف واقعی انجام نمی‌شود.</p>
            <button className="mt-5 rounded-full bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-400" onClick={() => setIsDeleteConfirmOpen(true)} type="button">
              حذف حساب
            </button>
          </section>
        </div>

        {saveMessage && <p className="mt-5 rounded-2xl bg-[#1DB954]/15 p-4 text-sm font-bold text-[#1DB954]">{saveMessage}</p>}

        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
            <div className="w-full max-w-md rounded-2xl bg-[#181818] p-6 shadow-2xl">
              <h3 className="text-xl font-black text-white">تأیید حذف حساب</h3>
              <p className="mt-3 leading-8 text-[#B3B3B3]">در پروژه واقعی این عملیات باید با رمز عبور و درخواست API امن انجام شود. در این نسخه فقط پنجره را می‌بندیم.</p>
              <div className="mt-6 flex gap-3">
                <button className="rounded-full bg-red-500 px-5 py-3 font-bold text-white" onClick={() => setIsDeleteConfirmOpen(false)} type="button">متوجه شدم</button>
                <button className="rounded-full bg-[#282828] px-5 py-3 font-bold text-white" onClick={() => setIsDeleteConfirmOpen(false)} type="button">لغو</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function NotificationToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button className="flex items-center justify-between rounded-2xl bg-[#282828] p-4 text-right" onClick={onChange} type="button">
      <span className="font-bold text-white">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-[#1DB954]' : 'bg-[#535353]'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-1' : 'left-6'}`} />
      </span>
    </button>
  )
}

function PlanCard({ title, description, active }: { title: string; description: string; active: boolean }) {
  return (
    <article className={`rounded-2xl p-4 ${active ? 'bg-[#1DB954]/15 ring-1 ring-[#1DB954]' : 'bg-[#282828]'}`}>
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#B3B3B3]">{description}</p>
      {active && <span className="mt-3 inline-block rounded-full bg-[#1DB954] px-3 py-1 text-xs font-bold text-black">فعال</span>}
    </article>
  )
}

export default SettingsPage
