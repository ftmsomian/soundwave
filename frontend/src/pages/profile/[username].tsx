import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { STORAGE_KEYS, SUBSCRIPTION_LIMITS, SUBSCRIPTION_LABELS, DEFAULT_AVATAR, ROUTES } from '@/constants'
import { getFromStorage } from '@/mock'
import MainLayout from '@/components/layout/MainLayout'
import type { User } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const { username } = router.query
  const { user: me, updateUser, isLoading } = useAuth()

  const [profile, setProfile]       = useState<User | null>(null)
  const [notFound, setNotFound]     = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditing, setIsEditing]   = useState(false)
  const [editName, setEditName]     = useState('')
  const [editBio, setEditBio]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!username) return
    const users = getFromStorage<User>(STORAGE_KEYS.USERS)
    const found = users.find(u => u.username === username)
    if (!found) { setNotFound(true); return }
    setProfile(found)
    setEditName(found.displayName)
    setEditBio(found.bio ?? '')
  }, [username])

  useEffect(() => {
    if (!isLoading && !me) router.push(ROUTES.login)
  }, [me, isLoading, router])

  if (isLoading || !me) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">در حال بررسی دسترسی...</div>
  }

  if (!profile && !notFound) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-[#B3B3B3]">در حال بارگذاری...</div>
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">😕</p>
        <p className="text-white text-lg">کاربر پیدا نشد</p>
        <button onClick={() => router.back()} className="text-[#1DB954] hover:underline text-sm">بازگشت</button>
      </div>
    )
  }

  const isOwnProfile  = me?.username === username
  const canUploadAvatar = me ? SUBSCRIPTION_LIMITS[me.subscription].canUploadAvatar : false
  const subLabel = SUBSCRIPTION_LABELS[profile!.subscription]

  const handleSaveEdit = () => {
    if (!profile || !isOwnProfile) return
    const updates = { displayName: editName, bio: editBio }
    updateUser(updates)
    setProfile(prev => prev ? { ...prev, ...updates } : prev)
    setIsEditing(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      updateUser({ avatarUrl: dataUrl })
      setProfile(prev => prev ? { ...prev, avatarUrl: dataUrl } : prev)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Head><title>{profile!.displayName} | SoundWave</title></Head>
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* هدر پروفایل */}
          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={profile!.avatarUrl ?? DEFAULT_AVATAR}
                alt={profile!.displayName}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#1DB954]"
                onError={e => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR }}
              />
              {isOwnProfile && canUploadAvatar && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 left-0 bg-[#1DB954] text-black text-xs rounded-full w-7 h-7 flex items-center justify-center hover:bg-[#1ed760] transition-colors"
                    title="تغییر عکس"
                  >✏️</button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </>
              )}
              {isOwnProfile && !canUploadAvatar && (
                <div className="absolute -bottom-6 left-0 text-[#B3B3B3] text-xs whitespace-nowrap">
                  (اشتراک نقره‌ای به بالا)
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-right">
              {isEditing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-[#282828] border border-[#535353] rounded-lg px-3 py-1 text-white text-xl font-bold w-full mb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{profile!.displayName}</h1>
              )}
              <p className="text-[#B3B3B3] text-sm">@{profile!.username}</p>

              {isEditing ? (
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="بیوگرافی..."
                  rows={2}
                  className="mt-2 w-full bg-[#282828] border border-[#535353] rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              ) : (
                profile!.bio && <p className="text-[#B3B3B3] text-sm mt-1">{profile!.bio}</p>
              )}

              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                profile!.subscription === 'gold'   ? 'bg-yellow-500/20 text-yellow-400' :
                profile!.subscription === 'silver' ? 'bg-gray-400/20 text-gray-300'    :
                                                      'bg-[#282828] text-[#B3B3B3] border border-[#535353]'
              }`}>
                {subLabel}
              </span>
            </div>
          </div>

          {/* آمار */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: 'دنبال‌کننده',  value: profile!.followersCount + (isFollowing ? 1 : 0) },
              { label: 'دنبال‌شونده',  value: profile!.followingCount },
              { label: 'استریم امروز', value: profile!.dailyStreamCount },
            ].map(item => (
              <div key={item.label} className="bg-[#181818] border border-[#282828] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{item.value.toLocaleString('fa-IR')}</p>
                <p className="text-[#B3B3B3] text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-3 mt-4">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <button onClick={handleSaveEdit} className="flex-1 btn-primary py-2 text-sm">ذخیره</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-[#282828] border border-[#535353] text-[#B3B3B3] hover:text-white py-2 rounded-full text-sm font-bold transition-colors">
                    انصراف
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-[#282828] border border-[#535353] text-[#B3B3B3] hover:text-white py-2 rounded-full text-sm font-bold transition-colors">
                  ویرایش پروفایل
                </button>
              )
            ) : (
              <button
                onClick={() => setIsFollowing(prev => !prev)}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${
                  isFollowing ? 'bg-[#282828] border border-[#535353] text-[#B3B3B3] hover:text-white' : 'btn-primary'
                }`}
              >
                {isFollowing ? 'لغو دنبال کردن' : 'دنبال کردن'}
              </button>
            )}
          </div>

        </div>
      </MainLayout>
    </>
  )
}
