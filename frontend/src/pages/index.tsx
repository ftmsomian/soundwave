import type { NextPage } from 'next'
import { allMockUsers } from '@/mock'

// صفحه اول — فقط برای نمایش حساب‌های تست
// این صفحه بعداً به صفحه خانه تبدیل می‌شه

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-8">
      {/* لوگو */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black text-[#1DB954] mb-2">🎵 SoundWave</h1>
        <p className="text-[#B3B3B3]">سرویس استریم موسیقی</p>
      </div>

      {/* کارت حساب‌های تست */}
      <div className="bg-[#181818] rounded-2xl p-6 w-full max-w-2xl">
        <h2 className="text-white font-bold text-lg mb-1">حساب‌های تست</h2>
        <p className="text-[#B3B3B3] text-sm mb-5">رمز همه حساب‌ها: <code className="bg-[#282828] px-2 py-0.5 rounded text-[#1DB954]">test123</code></p>

        <div className="space-y-2">
          {allMockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-[#282828] rounded-lg px-4 py-3 hover:bg-[#3E3E3E] transition-colors"
            >
              <div>
                <p className="text-white font-medium">{user.displayName}</p>
                <p className="text-[#B3B3B3] text-sm">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={user.role} />
                {user.role === 'user' && <SubscriptionBadge tier={user.subscription} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-[#535353] text-sm text-center">
        پروژه درس برنامه‌سازی وب — دانشگاه صنعتی شریف — بهار ۱۴۰۵
      </p>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const labels: Record<string, { label: string; color: string }> = {
    user:    { label: 'کاربر',    color: 'bg-blue-500/20 text-blue-300' },
    artist:  { label: 'هنرمند',   color: 'bg-purple-500/20 text-purple-300' },
    support: { label: 'پشتیبان',  color: 'bg-orange-500/20 text-orange-300' },
    admin:   { label: 'مدیر',     color: 'bg-red-500/20 text-red-300' },
  }
  const { label, color } = labels[role] ?? { label: role, color: 'bg-gray-500/20 text-gray-300' }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}

function SubscriptionBadge({ tier }: { tier: string }) {
  const labels: Record<string, { label: string; color: string }> = {
    free:   { label: 'رایگان',   color: 'bg-gray-500/20 text-gray-400' },
    silver: { label: 'نقره‌ای',  color: 'bg-gray-300/20 text-gray-200' },
    gold:   { label: 'طلایی',    color: 'bg-yellow-500/20 text-yellow-400' },
  }
  const { label, color } = labels[tier] ?? { label: tier, color: '' }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  )
}

export default Home
