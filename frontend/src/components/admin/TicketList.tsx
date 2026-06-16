import React, { FormEvent, useMemo, useState } from 'react'
import type { Ticket, TicketMessage, TicketStatus } from '@/types'
import { formatDate, generateId } from '@/utils'

interface Props {
  tickets: Ticket[]
}

const statusLabels: Record<TicketStatus, string> = {
  open: 'باز',
  answered: 'پاسخ داده‌شده',
  closed: 'بسته',
}

const statusClassNames: Record<TicketStatus, string> = {
  open: 'bg-yellow-500/20 text-yellow-300',
  answered: 'bg-[#1DB954]/20 text-[#1DB954]',
  closed: 'bg-gray-500/20 text-gray-300',
}

export default function TicketList({ tickets }: Props) {
  const [items, setItems] = useState<Ticket[]>(tickets)
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id ?? '')
  const [reply, setReply] = useState('')

  const selectedTicket = useMemo(
    () => items.find(ticket => ticket.id === selectedTicketId) ?? items[0],
    [items, selectedTicketId]
  )

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedReply = reply.trim()
    if (!trimmedReply || !selectedTicket) return

    const newMessage: TicketMessage = {
      id: generateId(),
      senderId: 'support-current',
      senderName: 'پشتیبان سامانه',
      senderRole: 'support',
      content: trimmedReply,
      createdAt: new Date().toISOString(),
    }

    setItems(prev =>
      prev.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              status: 'answered',
              updatedAt: newMessage.createdAt,
              messages: [...ticket.messages, newMessage],
            }
          : ticket
      )
    )
    setReply('')
  }

  function closeTicket(ticketId: string) {
    setItems(prev => prev.map(ticket => (ticket.id === ticketId ? { ...ticket, status: 'closed' } : ticket)))
  }

  if (!selectedTicket) {
    return <div className="rounded-2xl bg-[#181818] p-6 text-[#B3B3B3]">تیکتی ثبت نشده است.</div>
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
        <h2 className="mb-1 text-xl font-black text-white">تیکت‌های پشتیبانی</h2>
        <p className="mb-5 text-sm text-[#B3B3B3]">هر تیکت را انتخاب کنید تا صفحه چت آن نمایش داده شود.</p>

        <div className="space-y-3">
          {items.map(ticket => (
            <button
              className={`w-full rounded-xl p-4 text-right transition-colors ${selectedTicket.id === ticket.id ? 'bg-[#1DB954]/15 ring-1 ring-[#1DB954]' : 'bg-[#282828] hover:bg-[#3E3E3E]'}`}
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-white">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-[#B3B3B3]">{ticket.userName} • {formatDate(ticket.updatedAt)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClassNames[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#282828] bg-[#181818] p-5">
        <div className="mb-5 flex flex-col gap-3 border-b border-[#282828] pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-black text-white">{selectedTicket.subject}</h3>
            <p className="text-sm text-[#B3B3B3]">کاربر: {selectedTicket.userName}</p>
          </div>
          <button
            className="rounded-full bg-[#282828] px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectedTicket.status === 'closed'}
            onClick={() => closeTicket(selectedTicket.id)}
            type="button"
          >
            بستن تیکت
          </button>
        </div>

        <div className="max-h-[420px] space-y-4 overflow-y-auto pl-1">
          {selectedTicket.messages.map(message => {
            const isSupport = message.senderRole === 'support' || message.senderRole === 'admin'
            return (
              <div className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`} key={message.id}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${isSupport ? 'bg-[#1DB954]/15 text-white' : 'bg-[#282828] text-white'}`}>
                  <p className="mb-1 text-xs font-bold text-[#B3B3B3]">{message.senderName} • {formatDate(message.createdAt)}</p>
                  <p className="leading-8">{message.content}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form className="mt-5 flex flex-col gap-3 md:flex-row" onSubmit={sendReply}>
          <input
            className="input-field"
            disabled={selectedTicket.status === 'closed'}
            onChange={(event: any) => setReply(event.target.value)}
            placeholder="پاسخ پشتیبانی را بنویسید..."
            value={reply}
          />
          <button className="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-50" disabled={selectedTicket.status === 'closed'} type="submit">
            ارسال
          </button>
        </form>
      </div>
    </section>
  )
}
