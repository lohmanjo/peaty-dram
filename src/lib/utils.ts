/** Utilities shared across pages and components. */

/** Format an ISO date string to a friendly display string, e.g. "March 8, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** Format YYYY-MM-DD to a friendly date */
export function formatDateShort(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** Today's date as YYYY-MM-DD in local time */
export function todayYMD(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Render a rating as "8.0 / 10" or "—" */
export function fmtRating(r: number | null): string {
  if (r === null) return '—'
  return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)} / 10`
}

/** Tailwind badge color for a Scotch region */
export function regionBadgeClass(region: string): string {
  const map: Record<string, string> = {
    Islay:          'bg-teal-100 text-teal-800',
    Speyside:       'bg-amber-100 text-amber-800',
    Highlands:      'bg-blue-100 text-blue-800',
    Islands:        'bg-indigo-100 text-indigo-800',
    Campbeltown:    'bg-pink-100 text-pink-800',
    Lowlands:       'bg-green-100 text-green-800',
    'West Highlands': 'bg-sky-100 text-sky-800',
    Other:          'bg-gray-100 text-gray-700',
  }
  return map[region] ?? 'bg-gray-100 text-gray-700'
}

/** Generate a short random NFC tag slug */
export function generateTagSlug(): string {
  return `tag-${Math.random().toString(36).slice(2, 10)}`
}

/** Derive a stable user ID from an email address */
export function emailToId(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
}
