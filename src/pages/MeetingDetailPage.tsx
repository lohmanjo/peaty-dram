import { useParams, Link, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { useMeetingStore } from '@/stores/meetingStore'
import { formatDateShort, fmtRating, regionBadgeClass } from '@/lib/utils'

export default function MeetingDetailPage() {
  const { meetingId } = useParams<{ meetingId: string }>()
  const navigate      = useNavigate()
  const user          = useUserStore(s => s.user)
  const { activeMeeting, setActiveMeeting } = useMeetingStore()

  const meeting = meetingId ? db.meetings.getById(meetingId) : undefined

  if (!meeting) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-gray-400">Meeting not found.</p>
        <Link to="/meetings" className="text-whisky-600 text-sm underline mt-2 block">Back to meetings</Link>
      </div>
    )
  }

  const bottles       = db.bottles.getByMeeting(meeting.id)
  const allReviews    = db.reviews.getByMeeting(meeting.id)
  const myReviewedIds = new Set(
    user ? allReviews.filter(r => r.reviewerEmail === user.email).map(r => r.bottleId) : []
  )
  const isActive = activeMeeting?.id === meeting.id

  // Group reviews by bottle for the reviews section
  const reviewsByBottle: Record<string, typeof allReviews> = {}
  allReviews.forEach(r => {
    if (!reviewsByBottle[r.bottleId]) reviewsByBottle[r.bottleId] = []
    reviewsByBottle[r.bottleId].push(r)
  })

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-lg mt-0.5">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{meeting.name}</h1>
          <p className="text-gray-500 text-sm">{formatDateShort(meeting.date)}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              meeting.type === 'club' ? 'bg-whisky-100 text-whisky-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {meeting.type === 'club' ? '🍾 Club Night' : '🏠 Personal'}
            </span>
            <span className="text-xs text-gray-400">{bottles.length} bottle{bottles.length !== 1 ? 's' : ''}</span>
            <span className="text-xs text-gray-400">{allReviews.length} review{allReviews.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Active session toggle */}
      {isActive ? (
        <div className="bg-whisky-50 border border-whisky-300 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-whisky-800 text-sm font-medium">✓ Active session</p>
          <button
            onClick={() => setActiveMeeting(null)}
            className="text-xs text-whisky-600 hover:underline"
          >
            Deactivate
          </button>
        </div>
      ) : (
        <button
          onClick={() => setActiveMeeting(meeting)}
          className="w-full text-sm bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-2 rounded-xl transition-colors"
        >
          Set as active session
        </button>
      )}

      {/* Bottles grid */}
      {bottles.length === 0 ? (
        <p className="text-gray-400 text-sm">No bottles recorded for this meeting.</p>
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Bottles Tasted</h2>
          <div className="space-y-2">
            {bottles.map(bottle => {
              const bottleReviews = reviewsByBottle[bottle.id] ?? []
              const publicReviews = bottleReviews.filter(r => !r.isPrivate)
              const avg = publicReviews.length > 0
                ? publicReviews.reduce((s, r) => s + r.rating, 0) / publicReviews.length
                : null
              const myR = user ? bottleReviews.find(r => r.reviewerEmail === user.email) : null

              return (
                <Link
                  key={bottle.id}
                  to={`/bottle/${bottle.id}`}
                  className="block bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{bottle.name}</p>
                      <p className="text-xs text-gray-500">{bottle.distillery}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${regionBadgeClass(bottle.region)}`}>
                          {bottle.region}
                        </span>
                        {myReviewedIds.has(bottle.id) ? (
                          <span className="text-xs text-green-600">✓ Reviewed</span>
                        ) : (
                          <Link
                            to={`/bottle/${bottle.id}/review?meetingId=${meeting.id}`}
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-whisky-600 hover:underline"
                          >
                            Add review
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-whisky-700">{fmtRating(avg)}</p>
                      {myR && (
                        <p className="text-xs text-gray-400">
                          Me: {myR.rating}/10
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
