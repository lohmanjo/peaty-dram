import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { useMeetingStore } from '@/stores/meetingStore'
import { formatDateShort } from '@/lib/utils'
import type { Meeting } from '@/lib/types'

type Filter = 'all' | 'club' | 'mine'

export default function MeetingsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const user                = useUserStore(s => s.user)
  const { activeMeeting, setActiveMeeting } = useMeetingStore()

  const myMeetingIds = user ? db.meetings.getMeetingIdsForUser(user.email) : new Set<string>()

  const allMeetings = db.meetings.getAll()

  const visible = allMeetings.filter(m => {
    if (filter === 'club')  return m.type === 'club'
    if (filter === 'mine')  return myMeetingIds.has(m.id)
    return true
  })

  function meetingBadge(type: Meeting['type']) {
    if (type === 'club')     return 'bg-whisky-100 text-whisky-800'
    if (type === 'personal') return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-600'
  }

  function meetingLabel(type: Meeting['type']) {
    if (type === 'club')     return 'Club night'
    if (type === 'personal') return 'Personal'
    return 'Standalone'
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-whisky-700">Meetings</h1>

      {/* Filter tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
        {(['all', 'club', 'mine'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            disabled={f === 'mine' && !user}
            className={`flex-1 py-2 font-medium capitalize transition-colors disabled:opacity-40 ${
              filter === f ? 'bg-whisky-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'mine' ? 'My meetings' : f === 'all' ? 'All' : 'Club nights'}
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No meetings found.</p>
      ) : (
        <div className="space-y-2">
          {visible.map(m => {
            const bottles = db.bottles.getByMeeting(m.id)
            const reviews = db.reviews.getByMeeting(m.id)
            const isActive = activeMeeting?.id === m.id

            return (
              <div key={m.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isActive ? 'border-whisky-400' : 'border-gray-100'}`}>
                <Link to={`/meeting/${m.id}`} className="block px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm truncate">{m.name}</p>
                        {isActive && (
                          <span className="text-xs bg-whisky-600 text-white px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDateShort(m.date)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${meetingBadge(m.type)}`}>
                      {meetingLabel(m.type)}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>{bottles.length} bottle{bottles.length !== 1 ? 's' : ''}</span>
                    <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    {user && myMeetingIds.has(m.id) && (
                      <span className="text-green-600">✓ You participated</span>
                    )}
                  </div>
                </Link>
                {!isActive && (
                  <div className="border-t border-gray-50 px-4 py-2">
                    <button
                      onClick={() => setActiveMeeting(m)}
                      className="text-xs text-whisky-600 font-medium hover:underline"
                    >
                      Set as active session
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
