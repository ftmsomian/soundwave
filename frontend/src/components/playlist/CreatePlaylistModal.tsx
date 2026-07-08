import { useState } from 'react'

interface Props {
  onConfirm: (name: string) => void
  onClose: () => void
  error?: string
}

export default function CreatePlaylistModal({ onConfirm, onClose, error }: Props) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onConfirm(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] border border-[#282828] rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-white mb-4">ساختن پلی‌لیست جدید</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="نام پلی‌لیست..."
            className="input-field mb-2"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button type="submit" className="flex-1 btn-primary py-2">ایجاد</button>
            <button type="button" onClick={onClose} className="flex-1 bg-[#282828] text-white py-2 rounded-full font-bold hover:bg-[#3E3E3E] transition-colors">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
