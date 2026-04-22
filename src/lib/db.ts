/**
 * db.ts — in-memory data layer backed by localStorage.
 *
 * On first load the store is seeded from mock data.
 * All mutations persist immediately to localStorage so data
 * survives page refreshes during local development.
 *
 * When Supabase is wired up later, these calls get swapped for
 * async Supabase equivalents — the API shape stays the same.
 */

import type { Bottle, Meeting, Review, CharTag } from './types'
import {
  MOCK_BOTTLES, MOCK_MEETINGS, MOCK_REVIEWS, MOCK_CHAR_TAGS, MOCK_NFC_TAGS,
} from './mockData'

const STORAGE_KEY = 'msms_db_v1'

interface DBState {
  bottles: Bottle[]
  meetings: Meeting[]
  reviews: Review[]
  charTags: CharTag[]
  nfcTags: Record<string, string>  // tagSlug → bottleId
  seeded: boolean
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function load(): DBState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DBState
      if (parsed.seeded) return parsed
    }
  } catch { /* ignore parse errors */ }

  const initial: DBState = {
    bottles: MOCK_BOTTLES,
    meetings: MOCK_MEETINGS,
    reviews: MOCK_REVIEWS,
    charTags: MOCK_CHAR_TAGS,
    nfcTags: MOCK_NFC_TAGS,
    seeded: true,
  }
  save(initial)
  return initial
}

function save(s: DBState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

let state = load()

// ─── Bottles ─────────────────────────────────────────────────────────────────

const bottles = {
  getAll(): Bottle[] {
    return [...state.bottles]
  },

  getById(id: string): Bottle | undefined {
    return state.bottles.find(b => b.id === id)
  },

  getByTagId(tagId: string): Bottle | undefined {
    const bottleId = state.nfcTags[tagId]
    if (!bottleId) return undefined
    return state.bottles.find(b => b.id === bottleId)
  },

  /** Returns unique bottles that have at least one review in a given meeting */
  getByMeeting(meetingId: string): Bottle[] {
    const ids = new Set(
      state.reviews.filter(r => r.meetingId === meetingId).map(r => r.bottleId)
    )
    return state.bottles.filter(b => ids.has(b.id))
  },

  search(query: string): Bottle[] {
    const q = query.toLowerCase()
    return state.bottles.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.distillery.toLowerCase().includes(q) ||
      b.region.toLowerCase().includes(q)
    )
  },

  create(data: Omit<Bottle, 'id' | 'createdAt'>): Bottle {
    const bottle: Bottle = {
      ...data,
      id: generateId('b'),
      createdAt: new Date().toISOString(),
    }
    const newNfcTags = bottle.tagId
      ? { ...state.nfcTags, [bottle.tagId]: bottle.id }
      : state.nfcTags
    state = { ...state, bottles: [...state.bottles, bottle], nfcTags: newNfcTags }
    save(state)
    return bottle
  },

  update(id: string, data: Partial<Bottle>): Bottle | undefined {
    const idx = state.bottles.findIndex(b => b.id === id)
    if (idx === -1) return undefined
    const updated: Bottle = { ...state.bottles[idx], ...data }
    const newBottles = [...state.bottles]
    newBottles[idx] = updated
    const newNfcTags = data.tagId
      ? { ...state.nfcTags, [data.tagId]: id }
      : state.nfcTags
    state = { ...state, bottles: newBottles, nfcTags: newNfcTags }
    save(state)
    return updated
  },
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

const meetings = {
  getAll(): Meeting[] {
    return [...state.meetings].sort((a, b) => b.date.localeCompare(a.date))
  },

  getById(id: string): Meeting | undefined {
    return state.meetings.find(m => m.id === id)
  },

  getByDate(date: string): Meeting | undefined {
    return state.meetings.find(m => m.date === date)
  },

  /** Sorted unique dates (desc) that have at least one review */
  getDatesWithReviews(): string[] {
    const dates = [...new Set(state.reviews.map(r => r.createdAt.slice(0, 10)))]
    return dates.sort((a, b) => b.localeCompare(a))
  },

  /** Meeting IDs where the user has at least one review */
  getMeetingIdsForUser(email: string): Set<string> {
    return new Set(
      state.reviews
        .filter(r => r.reviewerEmail === email && r.meetingId != null)
        .map(r => r.meetingId as string)
    )
  },

  create(data: Omit<Meeting, 'id'>): Meeting {
    const meeting: Meeting = { ...data, id: generateId('m') }
    state = { ...state, meetings: [...state.meetings, meeting] }
    save(state)
    return meeting
  },
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

const reviews = {
  getAll(): Review[] {
    return [...state.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getByBottle(bottleId: string): Review[] {
    return state.reviews
      .filter(r => r.bottleId === bottleId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getByMeeting(meetingId: string): Review[] {
    return state.reviews.filter(r => r.meetingId === meetingId)
  },

  getByUser(email: string): Review[] {
    return state.reviews
      .filter(r => r.reviewerEmail === email)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getByBottleAndMeetingAndUser(
    bottleId: string,
    meetingId: string | null,
    email: string,
  ): Review | undefined {
    return state.reviews.find(
      r => r.bottleId === bottleId && r.meetingId === meetingId && r.reviewerEmail === email
    )
  },

  create(data: Omit<Review, 'id' | 'createdAt'>): Review {
    const review: Review = {
      ...data,
      id: generateId('r'),
      createdAt: new Date().toISOString(),
    }
    state = { ...state, reviews: [...state.reviews, review] }
    save(state)
    return review
  },

  update(id: string, data: Partial<Omit<Review, 'id' | 'createdAt'>>): Review | undefined {
    const idx = state.reviews.findIndex(r => r.id === id)
    if (idx === -1) return undefined
    const updated: Review = { ...state.reviews[idx], ...data }
    const newReviews = [...state.reviews]
    newReviews[idx] = updated
    state = { ...state, reviews: newReviews }
    save(state)
    return updated
  },
}

// ─── Characteristic tags ──────────────────────────────────────────────────────

const charTags = {
  getAll(): CharTag[] {
    return [...state.charTags].sort((a, b) => a.name.localeCompare(b.name))
  },

  search(query: string): CharTag[] {
    const q = query.toLowerCase().trim()
    if (!q) return charTags.getAll()
    return state.charTags.filter(t => t.name.toLowerCase().includes(q))
  },

  getById(id: string): CharTag | undefined {
    return state.charTags.find(t => t.id === id)
  },

  create(name: string): CharTag {
    const tag: CharTag = { id: generateId('ct'), name: name.toLowerCase().trim() }
    state = { ...state, charTags: [...state.charTags, tag] }
    save(state)
    return tag
  },
}

// ─── NFC tags ─────────────────────────────────────────────────────────────────

const nfcTags = {
  getBottleId(tagId: string): string | undefined {
    return state.nfcTags[tagId]
  },

  isRegistered(tagId: string): boolean {
    return tagId in state.nfcTags
  },

  register(tagId: string, bottleId: string): void {
    state = { ...state, nfcTags: { ...state.nfcTags, [tagId]: bottleId } }
    // Keep the bottle's own tagId field in sync
    const bottle = state.bottles.find(b => b.id === bottleId)
    if (bottle && !bottle.tagId) {
      bottles.update(bottleId, { tagId })
    }
    save(state)
  },
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

const stats = {
  /** Average public rating for a bottle, or null if none. */
  avgRating(bottleId: string): number | null {
    const pub = state.reviews.filter(r => r.bottleId === bottleId && !r.isPrivate)
    if (pub.length === 0) return null
    return pub.reduce((s, r) => s + r.rating, 0) / pub.length
  },

  /** Count of public reviews for a bottle. */
  reviewCount(bottleId: string): number {
    return state.reviews.filter(r => r.bottleId === bottleId && !r.isPrivate).length
  },

  /** Summary stats for a user's profile. */
  userStats(email: string) {
    const mine = state.reviews.filter(r => r.reviewerEmail === email)
    return {
      reviewCount: mine.length,
      bottleCount: new Set(mine.map(r => r.bottleId)).size,
      meetingCount: new Set(mine.filter(r => r.meetingId).map(r => r.meetingId)).size,
    }
  },

  /** Wipe all data and re-seed from mock data (dev helper). */
  resetToMockData(): void {
    state = {
      bottles: MOCK_BOTTLES,
      meetings: MOCK_MEETINGS,
      reviews: MOCK_REVIEWS,
      charTags: MOCK_CHAR_TAGS,
      nfcTags: MOCK_NFC_TAGS,
      seeded: true,
    }
    save(state)
  },
}

export const db = { bottles, meetings, reviews, charTags, nfcTags, stats }
