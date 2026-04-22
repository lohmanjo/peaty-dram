import { useState, useRef, useEffect } from 'react'
import { db } from '@/lib/db'
import type { ReviewCharacteristic } from '@/lib/types'
import StarRating from './StarRating'

interface DraftCharacteristic extends Omit<ReviewCharacteristic, 'reviewId'> {
  reviewId: string
}

interface Props {
  value: DraftCharacteristic[]
  onChange: (chars: DraftCharacteristic[]) => void
}

/**
 * Search-as-you-type characteristic tag picker.
 * Existing tags from the db are suggested; unknown text creates a new tag on confirm.
 */
export default function CharacteristicTagInput({ value, onChange }: Props) {
  const [query, setQuery]           = useState('')
  const [suggestions, setSuggestions] = useState(db.charTags.getAll())
  const [open, setOpen]             = useState(false)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSuggestions(db.charTags.search(query))
  }, [query])

  const alreadyAdded = new Set(value.map(c => c.tagId))

  function addTag(tagId: string, tagName: string) {
    if (alreadyAdded.has(tagId)) return
    const char: DraftCharacteristic = {
      id: `rc-${Date.now()}`,
      reviewId: '',
      tagId, tagName,
      rating: null,
      comments: '',
    }
    onChange([...value, char])
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  function createAndAdd() {
    const name = query.trim().toLowerCase()
    if (!name) return
    const existing = db.charTags.getAll().find(t => t.name === name)
    if (existing) { addTag(existing.id, existing.name); return }
    const newTag = db.charTags.create(name)
    addTag(newTag.id, newTag.name)
  }

  function removeChar(id: string) {
    onChange(value.filter(c => c.id !== id))
  }

  function updateChar(id: string, patch: Partial<DraftCharacteristic>) {
    onChange(value.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  const showCreate = query.trim() &&
    !suggestions.some(s => s.name === query.trim().toLowerCase())

  return (
    <div>
      {/* Tag chips */}
      {value.length > 0 && (
        <div className="mb-3 space-y-2">
          {value.map(char => (
            <div key={char.id} className="bg-whisky-50 border border-whisky-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === char.id ? null : char.id)}
                  className="font-medium text-whisky-800 text-sm capitalize hover:underline"
                >
                  {char.tagName}
                  {char.rating !== null && (
                    <span className="ml-2 text-xs bg-whisky-200 text-whisky-800 px-2 py-0.5 rounded-full">
                      {char.rating}/10
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeChar(char.id)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none ml-2"
                  aria-label="Remove tag"
                >
                  ×
                </button>
              </div>

              {expanded === char.id && (
                <div className="mt-3 space-y-2">
                  <StarRating
                    label="Rating for this characteristic (optional)"
                    value={char.rating}
                    onChange={v => updateChar(char.id, { rating: v })}
                    colorScheme="warm"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={char.comments}
                      onChange={e => updateChar(char.id, { comments: e.target.value })}
                      placeholder="Any notes about this characteristic…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-whisky-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search or add a characteristic tag…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-whisky-500"
        />

        {open && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {suggestions
              .filter(s => !alreadyAdded.has(s.id))
              .map(s => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={() => addTag(s.id, s.name)}
                  className="w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-whisky-50 transition-colors"
                >
                  {s.name}
                </button>
              ))}

            {showCreate && (
              <button
                type="button"
                onMouseDown={createAndAdd}
                className="w-full text-left px-4 py-2.5 text-sm text-whisky-700 font-medium hover:bg-whisky-50 transition-colors border-t border-gray-100"
              >
                + Add "{query.trim()}" as a new tag
              </button>
            )}

            {suggestions.filter(s => !alreadyAdded.has(s.id)).length === 0 && !showCreate && (
              <p className="px-4 py-3 text-sm text-gray-400">All tags already added.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
