import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { db } from '@/lib/db'
import { useMeetingStore } from '@/stores/meetingStore'
import { fmtRating, regionBadgeClass } from '@/lib/utils'

type Scope = 'all' | 'tonight'

export default function SearchPage() {
  const [query, setQuery]   = useState('')
  const [scope, setScope]   = useState<Scope>('all')
  const { activeMeeting }   = useMeetingStore()
  const navigate            = useNavigate()

  const tonightIds = useMemo(
    () => new Set(activeMeeting ? db.bottles.getByMeeting(activeMeeting.id).map(b => b.id) : []),
    [activeMeeting]
  )

  const results = useMemo(() => {
    const base = query.trim() ? db.bottles.search(query) : db.bottles.getAll()
    if (scope === 'tonight') return base.filter(b => tonightIds.has(b.id))
    return base
  }, [query, scope, tonightIds])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-whisky-700">Search Bottles</h1>

      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Name, distillery, region…"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-whisky-500"
        />
      </div>

      {/* Scope toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
        {(['all', 'tonight'] as Scope[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            disabled={s === 'tonight' && !activeMeeting}
            className={`flex-1 py-2 font-medium transition-colors disabled:opacity-40 ${
              scope === s
                ? 'bg-whisky-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All bottles' : "Tonight's bottles"}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-xs text-gray-400">{results.length} result{results.length !== 1 ? 's' : ''}</p>

      <div className="space-y-2">
        {results.map(bottle => {
          const avg   = db.stats.avgRating(bottle.id)
          const count = db.stats.reviewCount(bottle.id)
          return (
            <button
              key={bottle.id}
              onClick={() => navigate(`/bottle/${bottle.id}`)}
              className="w-full text-left bg-white rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{bottle.name}</p>
                  <p className="text-xs text-gray-500">{bottle.distillery}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${regionBadgeClass(bottle.region)}`}>
                      {bottle.region}
                    </span>
                    {bottle.ageStatement !== null && (
                      <span className="text-xs text-gray-400">{bottle.ageStatement}yr</span>
                    )}
                    {bottle.abv !== null && (
                      <span className="text-xs text-gray-400">{bottle.abv}% ABV</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-whisky-700">{fmtRating(avg)}</p>
                  <p className="text-xs text-gray-400">{count} review{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </button>
          )
        })}

        {results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No bottles found.</p>
            {query && (
              <button
                onClick={() => navigate('/bottle/new')}
                className="mt-3 text-whisky-600 text-sm underline"
              >
                Add "{query}" as a new bottle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
