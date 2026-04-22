export interface Bottle {
  id: string
  name: string
  distillery: string
  region: string
  ageStatement: number | null   // years; null = NAS
  abv: number | null
  vintage: number | null
  imageUrls: string[]
  createdAt: string             // ISO 8601
  tagId: string | null          // linked NFC tag slug
}

export interface Meeting {
  id: string
  name: string
  date: string   // YYYY-MM-DD
  type: 'club' | 'personal' | 'none'
}

export interface CharTag {
  id: string
  name: string
}

export interface ReviewCharacteristic {
  id: string
  reviewId: string
  tagId: string
  tagName: string   // denormalized for display
  rating: number | null  // 1–10, optional
  comments: string
}

export interface Review {
  id: string
  bottleId: string
  meetingId: string | null
  reviewerEmail: string
  reviewerName: string
  rating: number        // 1–10
  trustRating: number   // 1–10  "how much should future-me trust this?"
  comments: string
  isPrivate: boolean
  characteristics: ReviewCharacteristic[]
  createdAt: string
}

export type RegionName =
  | 'Speyside'
  | 'Highlands'
  | 'Islay'
  | 'Campbeltown'
  | 'Lowlands'
  | 'Islands'
  | 'West Highlands'
  | 'Other'

export const REGIONS: RegionName[] = [
  'Speyside', 'Highlands', 'Islay', 'Campbeltown',
  'Lowlands', 'Islands', 'West Highlands', 'Other',
]
