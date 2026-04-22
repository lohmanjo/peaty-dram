import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { fmtRating, formatDate, emailToId } from '@/lib/utils'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, setUser, clearUser } = useUserStore()

  // Email re-sync form state (for when user wants to switch accounts)
  const [showSwitch, setShowSwitch] = useState(false)
  const [switchEmail, setSwitchEmail] = useState('')
  const [switchName,  setSwitchName]  = useState('')
  const [switchError, setSwitchError] = useState('')
  const [showReset,   setShowReset]   = useState(false)

  function handleSwitch(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(switchEmail.trim())) {
      setSwitchError('Enter a valid email.')
      return
    }
    setUser({
      id: emailToId(switchEmail.trim()),
      email: switchEmail.trim().toLowerCase(),
      displayName: switchName.trim() || switchEmail.split('@')[0],
    })
    setShowSwitch(false)
    setSwitchEmail('')
    setSwitchName('')
  }

  if (!user) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-gray-500 text-sm">Loading profile…</p>
      </div>
    )
  }

  const stats       = db.stats.userStats(user.email)
  const myReviews   = db.reviews.getByUser(user.email)
  const myMeetingIds = db.meetings.getMeetingIdsForUser(user.email)
  const myMeetings  = db.meetings.getAll().filter(m => myMeetingIds.has(m.id))

  return (
    <div className="p-4 space-y-6">
      {/* ── Profile header ───────────────────────────────────────── */}
      <div className="bg-whisky-700 text-white rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-whisky-400 flex items-center justify-center text-2xl font-bold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.displayName}</h1>
            <p className="text-whisky-200 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Reviews', value: stats.reviewCount },
            { label: 'Bottles', value: stats.bottleCount },
            { label: 'Meetings', value: stats.meetingCount },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl py-2">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-whisky-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Account actions ──────────────────────────────────────── */}
      <div className="space-y-2">
        <button
          onClick={() => setShowSwitch(!showSwitch)}
          className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
        >
          <p className="font-medium text-gray-800">Switch / Re-sync Account</p>
          <p className="text-xs text-gray-400 mt-0.5">Enter a different email to load another profile</p>
        </button>

        {showSwitch && (
          <form onSubmit={handleSwitch} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 space-y-3">
            <input
              type="email" value={switchEmail}
              onChange={e => { setSwitchEmail(e.target.value); setSwitchError('') }}
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
            <input
              type="text" value={switchName}
              onChange={e => setSwitchName(e.target.value)}
              placeholder="Display name (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
            />
            {switchError && <p className="text-red-400 text-xs">{switchError}</p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-whisky-600 text-white text-sm font-semibold py-2 rounded-lg">
                Switch
              </button>
              <button type="button" onClick={() => setShowSwitch(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        )}

        <button
          onClick={() => setShowReset(!showReset)}
          className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
        >
          <p className="font-medium text-gray-800">Developer: Reset to Mock Data</p>
          <p className="text-xs text-gray-400 mt-0.5">Wipe all changes and restore sample data</p>
        </button>
        {showReset && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm space-y-2">
            <p className="text-red-700 font-medium">This will erase all your reviews and bottles.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { db.stats.resetToMockData(); clearUser(); location.reload() }}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg"
              >
                Reset
              </button>
              <button onClick={() => setShowReset(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── My meetings ──────────────────────────────────────────── */}
      {myMeetings.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">My Meetings</h2>
          <div className="space-y-1.5">
            {myMeetings.map(m => (
              <Link
                key={m.id}
                to={`/meeting/${m.id}`}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{m.type}</p>
                </div>
                <span className="text-gray-400 text-xs">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── My reviews ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">My Reviews</h2>
        {myReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-2">
            {myReviews.map(r => {
              const bottle = db.bottles.getById(r.bottleId)
              if (!bottle) return null
              return (
                <Link
                  key={r.id}
                  to={`/bottle/${bottle.id}`}
                  className="block bg-white border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-gray-900 truncate">{bottle.name}</p>
                        {r.isPrivate && (
                          <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" title="Private" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-whisky-700">{fmtRating(r.rating)}</p>
                      <p className="text-xs text-gray-400">trust: {r.trustRating}/10</p>
                    </div>
                  </div>
                  {r.comments && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{r.comments}"</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
