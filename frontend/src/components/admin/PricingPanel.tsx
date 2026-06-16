import React, { FormEvent, useEffect, useState } from 'react'
import { DEFAULT_SUBSCRIPTION_PRICES, STORAGE_KEYS } from '@/constants'
import type { SubscriptionPricing } from '@/types'
import { formatNumber } from '@/utils'

export default function PricingPanel() {
  const [prices, setPrices] = useState<SubscriptionPricing>(DEFAULT_SUBSCRIPTION_PRICES)
  const [draft, setDraft] = useState<SubscriptionPricing>(DEFAULT_SUBSCRIPTION_PRICES)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    const rawPrices = window.localStorage.getItem(STORAGE_KEYS.subscriptionPrices)
    if (!rawPrices) return

    try {
      const parsedPrices = JSON.parse(rawPrices) as SubscriptionPricing
      setPrices(parsedPrices)
      setDraft(parsedPrices)
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.subscriptionPrices)
    }
  }, [])

  function savePrices(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPrices(draft)
    window.localStorage.setItem(STORAGE_KEYS.subscriptionPrices, JSON.stringify(draft))
    setSavedMessage('قیمت‌ها ذخیره شدند.')
  }

  function updateDraft(key: keyof SubscriptionPricing, value: number) {
    setSavedMessage('')
    setDraft(prev => ({ ...prev, [key]: Math.max(0, value) }))
  }

  return (
    <section className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white">پنل تغییر قیمت اشتراک‌ها</h2>
        <p className="text-sm text-[#B3B3B3]">این بخش فقط برای مدیر سامانه فعال است و مقدارها در localStorage ذخیره می‌شوند.</p>
      </div>

      <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={savePrices}>
        <label className="block">
          <span className="mb-2 block text-sm text-[#B3B3B3]">قیمت نقره‌ای / تومان</span>
          <input
            className="input-field"
            min={0}
            onChange={(event: any) => updateDraft('silver', Number(event.target.value))}
            type="number"
            value={draft.silver}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-[#B3B3B3]">قیمت طلایی / تومان</span>
          <input
            className="input-field"
            min={0}
            onChange={(event: any) => updateDraft('gold', Number(event.target.value))}
            type="number"
            value={draft.gold}
          />
        </label>
        <button className="btn-primary" type="submit">ذخیره قیمت</button>
      </form>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-[#282828] p-4">
          <p className="text-sm text-[#B3B3B3]">قیمت فعلی نقره‌ای</p>
          <p className="mt-1 text-2xl font-black text-white">{formatNumber(prices.silver)} تومان</p>
        </div>
        <div className="rounded-xl bg-[#282828] p-4">
          <p className="text-sm text-[#B3B3B3]">قیمت فعلی طلایی</p>
          <p className="mt-1 text-2xl font-black text-yellow-300">{formatNumber(prices.gold)} تومان</p>
        </div>
      </div>

      {savedMessage && <p className="mt-4 text-sm font-bold text-[#1DB954]">{savedMessage}</p>}
    </section>
  )
}
