import { useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { emailToId } from '@/lib/utils'

/**
 * Modal overlaid on first load when no user email is stored.
 * Soft identification — no password, just remembers email in localStorage.
 */
export default function EmailPrompt() {
  const setUser = useUserStore(s => s.setUser)
  const [email, setEmail]   = useState('')
  const [name, setName]     = useState('')
  const [error, setError]   = useState('')

  function validate(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate(email)) { setError('Please enter a valid email address.'); return }
    const displayName = name.trim() || email.split('@')[0]
    setUser({ id: emailToId(email.trim()), email: email.trim().toLowerCase(), displayName })
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">🥃</div>
          <h2 className="text-xl font-bold text-whisky-700">Welcome to MSMS</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email to link your tasting notes to your profile.
            No password required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="How should we greet you?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Let's taste
          </button>
        </form>
      </div>
    </div>
  )
}
