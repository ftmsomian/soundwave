import React, { FormEvent, useMemo, useState } from 'react'
import type { Ticket, TicketMessage, TicketStatus } from '@/types'
import { formatDate, generateId } from '@/utils'

interface Props { tickets: Ticket[] }

const statusLabels: Record<TicketStatus, string> = {
  open:     'باز',
  answered: 'پاسخ داده‌شده',
  closed:   'بسته',
}

const statusClasses: Record<TicketStatus, string> = {
  open:     'bg-yellow-500/20 text-yellow-300',
  answered: 'bg-[#1DB954]/20 text-[#1DB954]',
  closed:   'bg-gray-500/20 text-gray-300',
}

export default function TicketList({ tickets }: Props) {
  const [items, setItems]           = useState<Ticket[]>(tickets)
  const [selectedId, setSelectedId] = useState(tickets[0]?.id ?? '')
  const [reply, setReply]           = useState('')

  const selected = useMemo(() => items.find(t => t.id === selectedId) ?? items[0], [items, selectedId])

  function sendReply(e: FormEvent) {
    e.preventDefault()
    const text = reply.trim()
    if (!text || !selected) return
    const msg: TicketMessage = {
      id: generateId(), senderId: 'support-current',
      senderName: 'پشتیبان سامانه', senderRole: 'support',
      content: text, createdAt: new Date().toISOString(),
    }
    setItems(prev => prev.map(t => t.id === selected.id
      ? { ...t, status: 'answered', updatedAt: msg.createdAt, messages: [...t.messages, msg] }
      : t
    ))
    setReply('')
  }

  function closeTicket(id: string) {
    setItems(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t))
  }

  if (!selected) {
    return <div className="rounded-2xl bg-[#181818] p-6 text-[#B3B3B3]">تیکتی ثبت نشده است.</div>
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* لیست تیکت‌ها */}
      <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
        <h2 className="mb-1 text-xl font-black text-white">تیکت‌های پشتیبانی</h2>
        <p className="mb-5 text-sm text-[#B3B3B3]">برای مشاهده چت، روی هر تیکت کلیک کنید.</p>
        <div className="space-y-3">
          {items.map(ticket => (
            <button
              key={ticket.id}
              className={`w-full rounded-xl p-4 text-right transition-colors ${selected.id === ticket.id ? 'bg-[#1DB954]/15 ring-1 ring-[#1DB954]' : 'bg-[#282828] hover:bg-[#3E3E3E]'}`}
              onClick={() => setSelectedId(ticket.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-white">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-[#B3B3B3]">{ticket.userName} • {formatDate(ticket.updatedAt)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClasses[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* چت */}
      <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
        <div className="mb-5 flex flex-col gap-3 border-b border-[#282828] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-black text-white">{selected.subject}</h3>
            <p className="text-sm text-[#B3B3B3]">کاربر: {selected.userName}</p>
          </div>
          <button
            className="rounded-full bg-[#282828] px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={selected.status === 'closed'}
            onClick={() => closeTicket(selected.id)}
            type="button"
          >بستن تیکت</button>
        </div>

        <div className="max-h-[400px] space-y-4 overflow-y-auto pl-1 mb-4">
          {selected.messages.map(msg => {
            const isSupport = msg.senderRole === 'support' || msg.senderRole === 'admin'
            return (
              <div className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`} key={msg.id}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${isSupport ? 'bg-[#1DB954]/15 text-white' : 'bg-[#282828] text-white'}`}>
                  <p className="mb-1 text-xs font-bold text-[#B3B3B3]">{msg.senderName} • {formatDate(msg.createdAt)}</p>
                  <p className="leading-7">{msg.content}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form className="flex flex-col gap-3 md:flex-row" onSubmit={sendReply}>
          <input
            className="input-field"
            disabled={selected.status === 'closed'}
            onChange={e => setReply(e.target.value)}
            placeholder={selected.status === 'closed' ? 'این تیکت بسته شده است.' : 'پاسخ پشتیبانی را بنویسید...'}
            value={reply}
          />
          <button
            className="btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selected.status === 'closed' || !reply.trim()}
            type="submit"
          >ارسال</button>
        </form>
      </div>
    </section>
  )
}
