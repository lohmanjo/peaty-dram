import { Link } from 'react-router-dom'
import type { Bottle } from '@/lib/types'
import { db } from '@/lib/db'
import { fmtRating, regionBadgeClass } from '@/lib/utils'

interface Props {
  bottle: Bottle
  /** If provided, shown as a badge in the card corner */
  userReviewed?: boolean
  /** Optional action button label + handler */
  actionLabel?: string
  onAction?: () => void
}

export default function BottleCard({ bottle, userReviewed, actionLabel, onAction }: Props) {
  const avg = db.stats.avgRating(bottle.id)
  const count = db.stats.reviewCount(bottle.id)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Bottle image or placeholder */}
      <div className="h-24 bg-whisky-50 flex items-center justify-center relative">
        {bottle.imageUrls.length > 0 ? (
          <img src={bottle.imageUrls[0]} alt={bottle.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🥃</span>
        )}
        {userReviewed !== undefined && (
          <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            userReviewed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {userReviewed ? 'Reviewed' : 'Not reviewed'}
          </span>
        )}
      </div>

      <div className="p-3">
        <Link to={`/bottle/${bottle.id}`} className="block">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-whisky-700">
            {bottle.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{bottle.distillery}</p>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${regionBadgeClass(bottle.region)}`}>
            {bottle.region}
          </span>
          <div className="text-right">
            <p className="text-sm font-bold text-whisky-700">{fmtRating(avg)}</p>
            <p className="text-xs text-gray-400">{count} review{count !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {bottle.ageStatement !== null && (
          <p className="text-xs text-gray-400 mt-1">
            {bottle.ageStatement}yr
            {bottle.abv !== null ? ` · ${bottle.abv}% ABV` : ''}
          </p>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-2 w-full text-sm bg-whisky-600 hover:bg-whisky-700 text-white py-1.5 rounded-lg font-medium transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
