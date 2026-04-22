import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { db } from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { useMeetingStore } from '@/stores/meetingStore'
import { fmtRating, regionBadgeClass, formatDate } from '@/lib/utils'
import { LockClosedIcon, ClipboardDocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

type Tab = 'overview' | 'reviews' | 'mine'

export default function BottleDetailPage() {
  const { bottleId }    = useParams<{ bottleId: string }>()
  const navigate        = useNavigate()
  const user            = useUserStore(s => s.user)
  const { activeMeeting } = useMeetingStore()
  const [tab, setTab]   = useState<Tab>('overview')
  const [imgIdx, setImgIdx] = useState(0)
  const [urlCopied, setUrlCopied] = useState(false)

  const bottle = bottleId ? db.bottles.getById(bottleId) : undefined
  if (!bottle) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-gray-400">Bottle not found.</p>
        <Link to="/" className="text-whisky-600 text-sm underline mt-2 block">Go home</Link>
      </div>
    )
  }

  const allReviews   = db.reviews.getByBottle(bottle.id)
  const publicReviews = allReviews.filter(r =>
    !r.isPrivate || r.reviewerEmail === (user?.email ?? '')
  )
  const myReviews    = user ? allReviews.filter(r => r.reviewerEmail === user.email) : []
  const avg          = db.stats.avgRating(bottle.id)
  const reviewCount  = db.stats.reviewCount(bottle.id)

  // Aggregate characteristic tags across public reviews
  const charAgg: Record<string, { name: string; ratings: number[]; count: number }> = {}
  publicReviews.forEach(r => {
    r.characteristics.forEach(c => {
      if (!charAgg[c.tagName]) charAgg[c.tagName] = { name: c.tagName, ratings: [], count: 0 }
      charAgg[c.tagName].count++
      if (c.rating !== null) charAgg[c.tagName].ratings.push(c.rating)
    })
  })
  const charList = Object.values(charAgg)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  const reviewUrl = `/bottle/${bottle.id}/review${activeMeeting ? `?meetingId=${activeMeeting.id}` : ''}`
  const nfcTagUrl = bottle.tagId
    ? `${window.location.origin}/t/${bottle.tagId}`
    : `${window.location.origin}/bottle/${bottle.id}`

  async function copyNfcUrl() {
    await navigator.clipboard.writeText(nfcTagUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2500)
  }

  return (
    <div className="pb-6">
      {/* ── Image carousel / header ─────────────────────────────────── */}
      <div className="relative h-48 bg-whisky-100 flex items-center justify-center overflow-hidden">
        {bottle.imageUrls.length > 0 ? (
          <>
            <img
              src={bottle.imageUrls[imgIdx]}
              alt={bottle.name}
              className="h-full w-full object-cover"
            />
            {bottle.imageUrls.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {bottle.imageUrls.map((_, i) => (
                  <button
                    key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <span className="text-7xl">🥃</span>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 bg-black/30 text-white rounded-full p-1.5 text-sm"
        >
          ←
        </button>
      </div>

      <div className="px-4 pt-4">
        {/* ── Bottle title + stats ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{bottle.name}</h1>
            <p className="text-gray-500 text-sm">{bottle.distillery}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-whisky-700">{fmtRating(avg)}</p>
            <p className="text-xs text-gray-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${regionBadgeClass(bottle.region)}`}>
            {bottle.region}
          </span>
          {bottle.ageStatement !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {bottle.ageStatement} Year Old
            </span>
          )}
          {bottle.ageStatement === null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">NAS</span>
          )}
          {bottle.abv !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {bottle.abv}% ABV
            </span>
          )}
          {bottle.vintage !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {bottle.vintage} Vintage
            </span>
          )}
        </div>

        {/* ── Review CTA + Copy URL ─────────────────────────────── */}
        <div className="flex gap-2 mb-4">
          <Link
            to={reviewUrl}
            className="flex-1 text-center bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            {myReviews.length > 0 ? 'Add Another Review' : 'Leave a Review'}
          </Link>
          <button
            onClick={copyNfcUrl}
            title={`Copy NFC URL: ${nfcTagUrl}`}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              urlCopied
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {urlCopied
              ? <><CheckCircleIcon className="w-4 h-4" /> Copied!</>
              : <><ClipboardDocumentIcon className="w-4 h-4" /> NFC URL</>}
          </button>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-4 text-sm">
          {(['overview', 'reviews', 'mine'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 font-medium capitalize transition-colors ${
                tab === t ? 'bg-whisky-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'mine' ? `Mine (${myReviews.length})` : t === 'reviews' ? `Reviews (${publicReviews.length})` : 'Overview'}
            </button>
          ))}
        </div>

        {/* ── Overview tab ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {charList.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Characteristic Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {charList.map(c => {
                    const avgC = c.ratings.length > 0
                      ? (c.ratings.reduce((s, v) => s + v, 0) / c.ratings.length).toFixed(1)
                      : null
                    return (
                      <span
                        key={c.name}
                        className="bg-whisky-100 text-whisky-800 rounded-full px-3 py-1 text-xs capitalize"
                      >
                        {c.name}
                        {avgC && <span className="ml-1 font-semibold">{avgC}</span>}
                        <span className="text-whisky-500 ml-1">×{c.count}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {bottle.tagId && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
                <span className="font-medium">NFC tag: </span>
                <code className="font-mono">{bottle.tagId}</code>
              </div>
            )}
          </div>
        )}

        {/* ── All reviews tab ──────────────────────────────────────── */}
        {tab === 'reviews' && (
          <div className="space-y-3">
            {publicReviews.length === 0 && (
              <p className="text-gray-400 text-sm">No public reviews yet.</p>
            )}
            {publicReviews.map(r => <ReviewCard key={r.id} review={r} currentUserEmail={user?.email} />)}
          </div>
        )}

        {/* ── My reviews tab ───────────────────────────────────────── */}
        {tab === 'mine' && (
          <div className="space-y-3">
            {!user && <p className="text-gray-400 text-sm">Sign in to see your reviews.</p>}
            {user && myReviews.length === 0 && (
              <p className="text-gray-400 text-sm">You haven't reviewed this bottle yet.</p>
            )}
            {myReviews.map(r => <ReviewCard key={r.id} review={r} currentUserEmail={user?.email} mine />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Inline review card ────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: {
    id: string
    reviewerName: string
    reviewerEmail: string
    rating: number
    trustRating: number
    comments: string
    isPrivate: boolean
    createdAt: string
    meetingId: string | null
    characteristics: { id: string; tagName: string; rating: number | null; comments: string }[]
  }
  currentUserEmail?: string
  mine?: boolean
}

function ReviewCard({ review, currentUserEmail, mine }: ReviewCardProps) {
  const [open, setOpen] = useState(false)
  const meeting = review.meetingId ? db.meetings.getById(review.meetingId) : null
  const isOwn   = review.reviewerEmail === currentUserEmail

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-gray-800">
              {mine ? 'You' : review.reviewerName}
            </span>
            {review.isPrivate && isOwn && (
              <LockClosedIcon className="w-3.5 h-3.5 text-gray-400" title="Private" />
            )}
          </div>
          <p className="text-xs text-gray-400">
            {formatDate(review.createdAt)}
            {meeting && <> · {meeting.name}</>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-whisky-700">{review.rating}<span className="text-xs text-gray-400">/10</span></p>
          <p className="text-xs text-gray-400" title="Confidence in this review">
            trust: {review.trustRating}/10
          </p>
        </div>
      </div>

      {review.comments && (
        <p className="text-sm text-gray-600 mt-2 leading-relaxed italic">"{review.comments}"</p>
      )}

      {review.characteristics.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-whisky-600 hover:underline"
          >
            {open ? 'Hide' : 'Show'} {review.characteristics.length} characteristic{review.characteristics.length !== 1 ? 's' : ''}
          </button>
          {open && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {review.characteristics.map(c => (
                <span key={c.id} className="bg-whisky-50 text-whisky-700 text-xs rounded-full px-2.5 py-0.5 capitalize">
                  {c.tagName}{c.rating !== null && ` ${c.rating}/10`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
