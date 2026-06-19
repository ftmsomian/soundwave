import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { STORAGE_KEYS, SUBSCRIPTION_LIMITS, SUBSCRIPTION_LABELS, DEFAULT_AVATAR } from '@/constants'
import { getFromStorage, setToStorage } from '@/mock'
import type { IUser } from '@/types'

export default function ProfilePage() {
  const router   = useRouter()
  const { username } = router.query
  const { user: me, updateUser, isLoading } = useAuth()

  const [profile, setProfile]     = useState<IUser | null>(null)
  const [notFound, setNotFound]   = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName]   = useState('')
  const [editBio, setEditBio]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // پیدا کردن پروفایل
  useEffect(() => {
    if (!username) return
    const users = getFromStorage<IUser>(STORAGE_KEYS.USERS)
    const found = users.find((u) => u.username === username)
    if (!found) { setNotFound(true); return }
    setProfile(found)
    setEditName(found.displayName)
    setEditBio(found.bio ?? '')
  }, [username])

  useEffect(() => {
    if (!isLoading && !me) {
      router.push('/login')
    }
  }, [me, isLoading, router])

  if (isLoading || !me) {
     return <div className="min-h-screen flex items-center justify-center text-white">در حال بررسی دسترسی...</div>
  }
  const isOwnProfile = me?.username === username
  const canUploadAvatar = me ? SUBSCRIPTION_LIMITS[me.subscription].canUploadAvatar : false

  const handleFollow = () => {
    setIsFollowing((prev) => !prev)
    // در فاز اول فقط UI تغییر می‌کند
  }

  const handleSaveEdit = () => {
    if (!profile || !isOwnProfile) return
    const updates = { displayName: editName, bio: editBio }
    updateUser(updates)
    setProfile((prev) => prev ? { ...prev, ...updates } : prev)
    setIsEditing(false)
  }

  // آپلود عکس (فقط در فاز اول base64 در localStorage)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateUser({ avatarUrl: dataUrl })
      setProfile((prev) => prev ? { ...prev, avatarUrl: dataUrl } : prev)
    }
    reader.readAsDataURL(file)
  }

  // ─── Loading / Not Found ───
  if (!profile && !notFound) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-muted">در حال بارگذاری...</div>
  }
  if (notFound) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">😕</p>
        <p className="text-white text-lg">کاربر پیدا نشد</p>
        <button onClick={() => router.back()} className="text-primary hover:underline text-sm">بازگشت</button>
      </div>
    )
  }

  const subLabel = SUBSCRIPTION_LABELS[profile!.subscription]

  return (
    <>
      <Head><title>{profile!.displayName} | SoundWave</title></Head>
      <div className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* ─── هدر پروفایل ─── */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            {/* عکس پروفایل */}
            <div className="relative flex-shrink-0">
              <img
                src={profile!.avatarUrl ?? DEFAULT_AVATAR}
                alt={profile!.displayName}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR }}
              />
              {isOwnProfile && canUploadAvatar && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 left-0 bg-primary text-white text-xs rounded-full w-7 h-7 flex items-center justify-center hover:bg-purple-700 transition-colors"
                    title="تغییر عکس"
                  >
                    ✏️
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </>
              )}
              {isOwnProfile && !canUploadAvatar && (
                <div className="absolute -bottom-1 left-0 bg-muted text-white text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
                  اشتراک بالاتر
                </div>
              )}
            </div>

            {/* اطلاعات */}
            <div className="flex-1 text-center sm:text-right">
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-surface border border-border rounded-lg px-3 py-1 text-white text-xl font-bold w-full mb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{profile!.displayName}</h1>
              )}
              <p className="text-muted text-sm">@{profile!.username}</p>

              {/* بیوگرافی */}
              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="بیوگرافی..."
                  rows={2}
                  className="mt-2 w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              ) : (
                profile!.bio && <p className="text-gray-300 text-sm mt-1">{profile!.bio}</p>
              )}

              {/* نوع اشتراک */}
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                profile!.subscription === 'gold'   ? 'bg-yellow-500/20 text-yellow-400' :
                profile!.subscription === 'silver' ? 'bg-gray-400/20 text-gray-300'    :
                                                      'bg-surface text-muted border border-border'
              }`}>
                {subLabel}
              </span>
            </div>
          </div>

          {/* ─── آمار ─── */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: 'دنبال‌کننده', value: profile!.followersCount },
              { label: 'دنبال‌شونده', value: profile!.followingCount },
              { label: 'استریم امروز', value: profile!.dailyStreams },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{item.value.toLocaleString('fa-IR')}</p>
                <p className="text-muted text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* ─── دکمه‌ها ─── */}
          <div className="flex gap-3 mt-4">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-primary hover:bg-purple-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    ذخیره
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-surface border border-border text-muted hover:text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    انصراف
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-surface border border-border text-muted hover:text-white py-2 rounded-lg transition-colors text-sm"
                >
                  ویرایش پروفایل
                </button>
              )
            ) : (
              <button
                onClick={handleFollow}
                className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isFollowing
                    ? 'bg-surface border border-border text-muted hover:text-white'
                    : 'bg-primary hover:bg-purple-700 text-white'
                }`}
              >
                {isFollowing ? 'لغو دنبال کردن' : 'دنبال کردن'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
