import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_LABELS, DEFAULT_AVATAR, ROUTES } from '@/constants'
import { apiGetPublicProfile, apiToggleFollow, ApiError } from '@/lib/api'
import MainLayout from '@/components/layout/MainLayout'
import type { User } from '@/types'

type ProfileState = (User & { isFollowedByMe: boolean }) | null

export default function ProfilePage() {
  const router = useRouter()
  const { username } = router.query
  const { user: me, updateUser, uploadAvatar, isLoading } = useAuth()

  const [profile, setProfile] = useState<ProfileState>(null)
  const [notFound, setNotFound] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const isOwnProfile = me?.username === username

  async function loadProfile() {
    if (!username || typeof username !== 'string') return
    // اگه پروفایل خودمونه، دیتای تازه‌ی خودِ context رو استفاده می‌کنیم (شامل ایمیل/تاریخ تولد هم هست)
    if (me && me.username === username) {
      setProfile({ ...me, isFollowedByMe: false })
      setEditName(me.displayName)
      setEditBio(me.bio ?? '')
      return
    }
    try {
      const data = await apiGetPublicProfile(username)
      setProfile(data)
      setEditName(data.displayName)
      setEditBio(data.bio ?? '')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true)
    }
  }

  useEffect(() => {
    setNotFound(false)
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, me])

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

  const canUploadAvatar = me ? SUBSCRIPTION_LIMITS[me.subscription].canUploadAvatar : false
  const subLabel = SUBSCRIPTION_LABELS[profile!.subscription]

  const handleSaveEdit = async () => {
    if (!profile || !isOwnProfile) return
    const result = await updateUser({ displayName: editName, bio: editBio })
    if (result.success) {
      setProfile(prev => (prev ? { ...prev, displayName: editName, bio: editBio } : prev))
      setIsEditing(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return
    setAvatarError('')
    const result = await uploadAvatar(file)
    if (!result.success) {
      setAvatarError(result.error ?? 'خطا در آپلود عکس')
      return
    }
    if (result.user) setProfile(prev => (prev ? { ...prev, avatarUrl: result.user!.avatarUrl } : prev))
  }

  const handleToggleFollow = async () => {
    if (!profile || isOwnProfile || typeof username !== 'string') return
    setIsFollowLoading(true)
    try {
      const { following } = await apiToggleFollow(username)
      setProfile(prev =>
        prev
          ? { ...prev, isFollowedByMe: following, followersCount: prev.followersCount + (following ? 1 : -1) }
          : prev
      )
    } catch {
      // اگه خطا خورد، وضعیت رو دست‌نخورده می‌ذاریم؛ کاربر می‌تونه دوباره امتحان کنه
    } finally {
      setIsFollowLoading(false)
    }
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
              {avatarError && (
                <p className="absolute top-full mt-2 w-48 text-red-400 text-xs">{avatarError}</p>
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
              { label: 'دنبال‌کننده',  value: profile!.followersCount },
              { label: 'دنبال‌شونده',  value: profile!.followingCount },
              // نکته: شمارش استریم روزانه از StreamLog می‌آد که در اپ catalog است و هنوز نوشته نشده.
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
                onClick={handleToggleFollow}
                disabled={isFollowLoading}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-60 ${
                  profile!.isFollowedByMe ? 'bg-[#282828] border border-[#535353] text-[#B3B3B3] hover:text-white' : 'btn-primary'
                }`}
              >
                {profile!.isFollowedByMe ? 'لغو دنبال کردن' : 'دنبال کردن'}
              </button>
            )}
          </div>

        </div>
      </MainLayout>
    </>
  )
}
