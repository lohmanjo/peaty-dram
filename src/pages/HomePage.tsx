import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { useMeetingStore } from '@/stores/meetingStore'
import { formatDateShort, fmtRating, formatDate } from '@/lib/utils'
import MeetingPrompt from '@/components/MeetingPrompt'
import BottleCard from '@/components/BottleCard'

export default function HomePage() {
  const user           = useUserStore(s => s.user)
  const { activeMeeting, setActiveMeeting } = useMeetingStore()
  const [showMeetingPrompt, setShowMeetingPrompt] = useState(false)
  const navigate = useNavigate()

  const tonightBottles   = activeMeeting ? db.bottles.getByMeeting(activeMeeting.id) : []
  const reviewedIds      = new Set(
    user ? db.reviews.getByUser(user.email).map(r => r.bottleId) : []
  )
  const recentReviews    = db.reviews.getAll()
    .filter(r => !r.isPrivate || r.reviewerEmail === (user?.email ?? ''))
    .slice(0, 8)

  return (
    <div className="p-4 space-y-6">
      {/* ── Tonight's session banner ───────────────────────────────────── */}
      {activeMeeting ? (
        <div className="bg-whisky-700 text-white rounded-2xl p-4 shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-whisky-200 font-medium uppercase tracking-wide">
                {activeMeeting.type === 'club' ? '🍾 Club Night' : '🏠 Personal Tasting'}
              </p>
              <h2 className="text-lg font-bold mt-0.5">{activeMeeting.name}</h2>
              <p className="text-whisky-200 text-sm">{formatDateShort(activeMeeting.date)}</p>
            </div>
            <button
              onClick={() => setActiveMeeting(null)}
              className="text-whisky-300 hover:text-white text-xs mt-1"
            >
              Change
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              to={`/meeting/${activeMeeting.id}`}
              className="flex-1 text-center bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
            >
              View All Bottles ({tonightBottles.length})
            </Link>
            <Link
              to="/bottle/new"
              className="flex-1 text-center bg-whisky-500 hover:bg-whisky-400 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
            >
              + Add Bottle
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-whisky-300 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🥃</p>
          <h2 className="text-base font-semibold text-gray-800">No active session</h2>
          <p className="text-gray-500 text-sm mt-1 mb-3">
            Start a session to associate your reviews with tonight's tasting.
          </p>
          <button
            onClick={() => setShowMeetingPrompt(true)}
            className="bg-whisky-600 hover:bg-whisky-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            Start Tonight's Session
          </button>
        </div>
      )}

      {/* ── Tonight's bottles grid ─────────────────────────────────────── */}
      {activeMeeting && tonightBottles.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tonight's Bottles</h2>
          <div className="grid grid-cols-2 gap-3">
            {tonightBottles.map(bottle => (
              <BottleCard
                key={bottle.id}
                bottle={bottle}
                userReviewed={reviewedIds.has(bottle.id)}
                actionLabel="Review"
                onAction={() => navigate(`/bottle/${bottle.id}/review?meetingId=${activeMeeting.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Recent activity feed ───────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Recent Activity</h2>
        {recentReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Start tasting!</p>
        ) : (
          <div className="space-y-2">
            {recentReviews.map(review => {
              const bottle = db.bottles.getById(review.bottleId)
              if (!bottle) return null
              return (
                <Link
                  key={review.id}
                  to={`/bottle/${bottle.id}`}
                  className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{bottle.name}</p>
                      <p className="text-xs text-gray-500">
                        {review.reviewerName} · {formatDate(review.createdAt)}
                        {review.isPrivate && (
                          <span className="ml-2 bg-gray-100 text-gray-500 rounded px-1">private</span>
                        )}
                      </p>
                    </div>
                    <span className="text-whisky-700 font-bold text-sm ml-3">{fmtRating(review.rating)}</span>
                  </div>
                  {review.comments && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">"{review.comments}"</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {showMeetingPrompt && (
        <MeetingPrompt onDismiss={() => setShowMeetingPrompt(false)} />
      )}
    </div>
  )
}
