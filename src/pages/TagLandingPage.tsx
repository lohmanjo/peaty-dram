import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { db } from '@/lib/db'

/**
 * Entry point for NFC taps — /t/:tagId
 *
 * • If the tag is registered → redirect immediately to the bottle page.
 * • If unknown → show "register this bottle" prompt.
 */
export default function TagLandingPage() {
  const { tagId } = useParams<{ tagId: string }>()
  const navigate   = useNavigate()

  useEffect(() => {
    if (!tagId) return
    const bottle = db.bottles.getByTagId(tagId)
    if (bottle) {
      navigate(`/bottle/${bottle.id}`, { replace: true })
    }
    // If not found, stay on this page to show the register prompt
  }, [tagId, navigate])

  if (!tagId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-500">Invalid tag link.</p>
      </div>
    )
  }

  // If registered, we already navigated — this only renders for unknown tags
  return (
    <div className="min-h-screen bg-whisky-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="text-5xl mb-4">🏷️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Unknown Tag</h1>
        <p className="text-gray-500 text-sm mb-1">
          This NFC sticker isn't registered yet.
        </p>
        <code className="block text-xs text-gray-400 bg-gray-50 border rounded px-3 py-1.5 mb-5">
          {tagId}
        </code>
        <Link
          to={`/bottle/new?tagId=${encodeURIComponent(tagId)}`}
          className="block w-full bg-whisky-600 hover:bg-whisky-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mb-3"
        >
          Register this bottle
        </Link>
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">
          Go home
        </Link>
      </div>
    </div>
  )
}
