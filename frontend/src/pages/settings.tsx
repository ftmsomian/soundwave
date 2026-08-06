import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { DEFAULT_SYSTEM_VOLUME, ROUTES, SETTINGS_MAX_VOLUME, SETTINGS_MIN_VOLUME, SUBSCRIPTION_LABELS } from '@/constants'
import { useAuth } from '@/context/AuthContext'
import { apiGetSettings, apiPatchSettings } from '@/lib/api'
import MainLayout from '@/components/layout/MainLayout'
import type { SubscriptionTier } from '@/types'

interface NotificationPrefs {
  newRelease: boolean
  subscription: boolean
  ticket: boolean
  marketing: boolean
  [key: string]: boolean
}

const defaultNotificationPrefs: NotificationPrefs = {
  newRelease: true,
  subscription: true,
  ticket: true,
  marketing: false,
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      className="flex items-center justify-between rounded-2xl bg-[#282828] p-4 text-right w-full"
      onClick={onChange}
      type="button"
    >
      <span className="font-bold text-white">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-[#1DB954]' : 'bg-[#535353]'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
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

export default function SettingsPage() {
  const { currentUser, isLoading, deleteAccount } = useAuth()
  const router = useRouter()

  const [notifications, setNotifications] = useState<NotificationPrefs>(defaultNotificationPrefs)
  const [systemVolume, setSystemVolume] = useState(DEFAULT_SYSTEM_VOLUME) // مقیاس نمایشی ۰..۱۰۰
  const [language, setLanguage] = useState<'fa' | 'en'>('fa')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!isLoading && !currentUser) router.push(ROUTES.login)
  }, [currentUser, isLoading, router])

  // بارگذاری تنظیمات واقعی از بک‌اند (UserSettings متعلق به accounts)
  useEffect(() => {
    if (!currentUser) return
    apiGetSettings()
      .then(data => {
        setNotifications({ ...defaultNotificationPrefs, ...data.notificationPrefs })
        setLanguage(data.language)
        setSystemVolume(Math.round(data.soundVolume * 100))
      })
      .catch(() => { /* اگه بک‌اند در دسترس نبود، مقادیر پیش‌فرض محلی می‌مونه */ })
      .finally(() => setSettingsLoaded(true))
  }, [currentUser])

  function showSaved(msg: string) {
    setSaveMessage(msg)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  async function persistSettings(updates: {
    notificationPrefs?: NotificationPrefs
    language?: 'fa' | 'en'
    soundVolume?: number // 0..1
  }) {
    try {
      await apiPatchSettings(updates)
      return true
    } catch {
      return false
    }
  }

  async function toggleNotif(key: keyof NotificationPrefs) {
    const next = { ...notifications, [key]: !notifications[key] }
    setNotifications(next)
    const ok = await persistSettings({ notificationPrefs: next })
    showSaved(ok ? 'تنظیمات اعلان ذخیره شد.' : 'ذخیره‌سازی ناموفق بود؛ دوباره تلاش کنید.')
  }

  async function handleVolumeChange(value: number) {
    setSystemVolume(value)
    const ok = await persistSettings({ soundVolume: value / 100 })
    showSaved(ok ? 'صدای سامانه ذخیره شد.' : 'ذخیره‌سازی ناموفق بود؛ دوباره تلاش کنید.')
  }

  async function handleLanguageChange(lang: 'fa' | 'en') {
    setLanguage(lang)
    const ok = await persistSettings({ language: lang })
    showSaved(ok ? 'زبان ذخیره شد.' : 'ذخیره‌سازی ناموفق بود؛ دوباره تلاش کنید.')
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    const result = await deleteAccount()
    if (!result.success) {
      setDeleteError(result.error ?? 'حذف حساب با خطا مواجه شد.')
      return
    }
    setShowDeleteConfirm(false)
    router.push(ROUTES.login)
  }

  if (isLoading || !currentUser || !settingsLoaded) return null

  return (
    <>
      <Head><title>تنظیمات | SoundWave</title></Head>
      <MainLayout>
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#B3B3B3]">تنظیمات حساب</p>
              <h1 className="text-3xl font-black md:text-5xl">تنظیمات</h1>
            </div>
            <Link className="rounded-full bg-[#282828] px-5 py-3 text-sm font-bold text-white hover:bg-[#3E3E3E] text-center" href={ROUTES.home}>
              بازگشت به خانه
            </Link>
          </div>

          <div className="space-y-6">
            {/* اعلانات */}
            <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
              <h2 className="text-xl font-black mb-1">تنظیمات اعلان‌ها</h2>
              <p className="mt-1 text-sm text-[#B3B3B3] mb-5">مشخص کنید چه اعلان‌هایی برای شما فعال باشد.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Toggle label="انتشار آهنگ جدید"           checked={notifications.newRelease}   onChange={() => toggleNotif('newRelease')} />
                <Toggle label="یادآوری اشتراک"             checked={notifications.subscription} onChange={() => toggleNotif('subscription')} />
                <Toggle label="پاسخ تیکت پشتیبانی"         checked={notifications.ticket}       onChange={() => toggleNotif('ticket')} />
                <Toggle label="خبرنامه و پیشنهادها"        checked={notifications.marketing}    onChange={() => toggleNotif('marketing')} />
              </div>
            </section>

            {/* صدا */}
            <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
              <h2 className="text-xl font-black mb-1">صدای سامانه</h2>
              <p className="mt-1 text-sm text-[#B3B3B3] mb-5">صدای افکت‌ها و اعلان‌های داخل سامانه.</p>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  aria-label="صدای سامانه"
                  className="h-2 flex-1 cursor-pointer accent-[#1DB954]"
                  max={SETTINGS_MAX_VOLUME} min={SETTINGS_MIN_VOLUME}
                  onChange={e => handleVolumeChange(Number(e.target.value))}
                  type="range"
                  value={systemVolume}
                />
                <span className="w-16 rounded-full bg-[#282828] px-3 py-2 text-center font-bold text-white">
                  {systemVolume}٪
                </span>
              </div>
            </section>

            {/* زبان */}
            <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
              <h2 className="text-xl font-black mb-1">زبان رابط کاربری</h2>
              <p className="mt-1 text-sm text-[#B3B3B3] mb-5">در نسخه فعلی فقط فارسی پشتیبانی می‌شود.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {(['fa', 'en'] as const).map(lang => (
                  <button
                    key={lang}
                    className={`rounded-2xl p-4 text-right font-bold transition-colors ${language === lang ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'}`}
                    onClick={() => handleLanguageChange(lang)}
                    type="button"
                  >
                    {lang === 'fa' ? 'فارسی' : 'English'}
                  </button>
                ))}
              </div>
            </section>

            {/* اشتراک */}
            <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5" id="upgrade">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black">نوع اشتراک</h2>
                  <p className="mt-1 text-sm text-[#B3B3B3]">
                    اشتراک فعلی: <span className="font-bold text-white">{SUBSCRIPTION_LABELS[currentUser.subscription as SubscriptionTier]}</span>
                  </p>
                  {currentUser.subscriptionExpiresAt && (
                    <p className="mt-1 text-xs text-[#B3B3B3]">
                      انقضا: {new Date(currentUser.subscriptionExpiresAt).toLocaleDateString('fa-IR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <PlanCard title="رایگان"   active={currentUser.subscription === 'free'}   description="محدودیت ۶۰ استریم روزانه، ۶ پلی‌لیست" />
                <PlanCard title="نقره‌ای"  active={currentUser.subscription === 'silver'} description="استریم نامحدود، ۱۰۰ پلی‌لیست، دانلود" />
                <PlanCard title="طلایی"   active={currentUser.subscription === 'gold'}   description="همه امکانات + دسترسی زودهنگام + آمار" />
              </div>
              <p className="mt-4 text-xs text-[#B3B3B3]">
                پرداخت و ارتقای آنی اشتراک هنوز وصل نشده (بخش پرداخت قبلاً از پروژه حذف شد و باید از نو نوشته شود).
              </p>
            </section>

            {/* حذف حساب */}
            <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
              <h2 className="text-xl font-black text-red-200 mb-1">حذف حساب</h2>
              <p className="mt-1 text-sm text-[#B3B3B3] mb-5">این عملیات واقعی است و حساب شما را برای همیشه از سامانه حذف می‌کند.</p>
              <button
                className="rounded-full bg-red-500 px-6 py-3 font-bold text-white hover:bg-red-400 transition-colors"
                onClick={() => setShowDeleteConfirm(true)}
                type="button"
              >حذف حساب</button>
            </section>
          </div>

          {saveMessage && (
            <p className="mt-5 rounded-2xl bg-[#1DB954]/15 p-4 text-sm font-bold text-[#1DB954]">{saveMessage}</p>
          )}

          {/* مودال تأیید حذف */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5">
              <div className="w-full max-w-md rounded-2xl bg-[#181818] p-6 shadow-2xl">
                <h3 className="text-xl font-black text-white">تأیید حذف حساب</h3>
                <p className="mt-3 leading-8 text-[#B3B3B3]">
                  با تأیید این عملیات، حساب شما و تمام اطلاعات آن به‌صورت دائمی از سامانه حذف می‌شود و امکان بازگشت وجود ندارد.
                </p>
                {deleteError && <p className="mt-3 text-sm text-red-400">{deleteError}</p>}
                <div className="mt-6 flex gap-3">
                  <button
                    className="rounded-full bg-red-500 px-5 py-3 font-bold text-white hover:bg-red-400 transition-colors"
                    onClick={handleDeleteAccount}
                    type="button"
                  >بله، حساب حذف شود</button>
                  <button
                    className="rounded-full bg-[#282828] px-5 py-3 font-bold text-white hover:bg-[#3E3E3E] transition-colors"
                    onClick={() => setShowDeleteConfirm(false)}
                    type="button"
                  >لغو</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  )
}
