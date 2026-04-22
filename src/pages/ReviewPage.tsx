import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { useMeetingStore } from '@/stores/meetingStore'
import StarRating from '@/components/StarRating'
import CharacteristicTagInput from '@/components/CharacteristicTagInput'
import MeetingPrompt from '@/components/MeetingPrompt'
import type { ReviewCharacteristic } from '@/lib/types'

type DraftCharacteristic = Omit<ReviewCharacteristic, 'reviewId'> & { reviewId: string }

export default function ReviewPage() {
  const { bottleId }          = useParams<{ bottleId: string }>()
  const [params]              = useSearchParams()
  const navigate              = useNavigate()
  const user                  = useUserStore(s => s.user)
  const { activeMeeting }     = useMeetingStore()

  // Resolve the meeting: URL param takes priority, then active meeting
  const urlMeetingId   = params.get('meetingId')
  const effectiveMeeting = urlMeetingId
    ? db.meetings.getById(urlMeetingId)
    : activeMeeting ?? null

  const [showMeetingPrompt, setShowMeetingPrompt] = useState(false)
  const [rating,      setRating]      = useState<number | null>(null)
  const [trustRating, setTrustRating] = useState<number | null>(null)
  const [comments,    setComments]    = useState('')
  const [isPrivate,   setIsPrivate]   = useState(false)
  const [chars,       setChars]       = useState<DraftCharacteristic[]>([])
  const [submitted,   setSubmitted]   = useState(false)
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  const bottle = bottleId ? db.bottles.getById(bottleId) : undefined

  // Pre-load existing review for this bottle + meeting + user (if editing)
  useEffect(() => {
    if (!user || !bottleId) return
    const existing = db.reviews.getByBottleAndMeetingAndUser(
      bottleId, effectiveMeeting?.id ?? null, user.email
    )
    if (existing) {
      setRating(existing.rating)
      setTrustRating(existing.trustRating)
      setComments(existing.comments)
      setIsPrivate(existing.isPrivate)
      setChars(existing.characteristics as DraftCharacteristic[])
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!bottle) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-gray-400">Bottle not found.</p>
        <Link to="/" className="text-whisky-600 text-sm underline mt-2 block">Go home</Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-gray-500 text-sm">Please enter your email first to leave a review.</p>
        <Link to="/profile" className="mt-3 block text-whisky-600 underline text-sm">Go to profile</Link>
      </div>
    )
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!rating)      e.rating      = 'Please give an overall rating.'
    if (!trustRating) e.trustRating = 'Please rate your confidence in this review.'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    // Check if review already exists (update vs create)
    const existing = db.reviews.getByBottleAndMeetingAndUser(
      bottle!.id, effectiveMeeting?.id ?? null, user.email
    )

    const payload = {
      bottleId: bottle!.id,
      meetingId: effectiveMeeting?.id ?? null,
      reviewerEmail: user.email,
      reviewerName:  user.displayName,
      rating:        rating!,
      trustRating:   trustRating!,
      comments,
      isPrivate,
      characteristics: chars.map(c => ({ ...c, reviewId: existing?.id ?? '' })),
    }

    if (existing) {
      db.reviews.update(existing.id, payload)
    } else {
      db.reviews.create(payload)
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-4 text-center py-12 space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-gray-800">Review saved!</h2>
        {effectiveMeeting && (
          <p className="text-gray-500 text-sm">
            Filed under <strong>{effectiveMeeting.name}</strong>
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Link
            to={`/bottle/${bottle.id}`}
            className="bg-whisky-600 hover:bg-whisky-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Back to Bottle
          </Link>
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
        <div>
          <h1 className="text-lg font-bold text-whisky-700">Leave a Review</h1>
          <p className="text-xs text-gray-500">{bottle.name}</p>
        </div>
      </div>

      {/* Meeting context */}
      <div
        className={`rounded-xl px-4 py-3 mb-4 border text-sm flex items-center justify-between ${
          effectiveMeeting
            ? 'bg-whisky-50 border-whisky-200'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        {effectiveMeeting ? (
          <>
            <div>
              <p className="font-medium text-whisky-800">{effectiveMeeting.name}</p>
              <p className="text-xs text-whisky-600 capitalize">{effectiveMeeting.type} tasting</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMeetingPrompt(true)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Change
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500">No session selected</p>
            <button
              type="button"
              onClick={() => setShowMeetingPrompt(true)}
              className="text-xs text-whisky-600 font-medium hover:underline"
            >
              Set session
            </button>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall rating */}
        <div>
          <StarRating
            label="Overall Rating"
            value={rating}
            onChange={setRating}
            colorScheme="warm"
          />
          {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
        </div>

        {/* Trust rating */}
        <div>
          <StarRating
            label="Confidence in this rating (how much should future-you trust it?)"
            value={trustRating}
            onChange={setTrustRating}
            colorScheme="cool"
          />
          {errors.trustRating && <p className="text-red-400 text-xs mt-1">{errors.trustRating}</p>}
        </div>

        {/* Tasting notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tasting Notes</label>
          <textarea
            rows={4}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Describe what you taste, smell, and feel…"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-whisky-500 resize-none"
          />
        </div>

        {/* Characteristic tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Characteristic Tags
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <CharacteristicTagInput value={chars} onChange={setChars} />
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Private review</p>
            <p className="text-xs text-gray-400">Only you can see it</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPrivate}
            onClick={() => setIsPrivate(!isPrivate)}
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none ${
              isPrivate ? 'bg-whisky-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                isPrivate ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Save Review
        </button>
      </form>

      {showMeetingPrompt && (
        <MeetingPrompt onDismiss={() => setShowMeetingPrompt(false)} />
      )}
    </div>
  )
}
