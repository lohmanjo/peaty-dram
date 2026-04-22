import type { Bottle, Meeting, Review, CharTag } from './types'

export const MOCK_CHAR_TAGS: CharTag[] = [
  { id: 'ct-1',  name: 'smoky' },
  { id: 'ct-2',  name: 'peaty' },
  { id: 'ct-3',  name: 'fruity' },
  { id: 'ct-4',  name: 'floral' },
  { id: 'ct-5',  name: 'honeyed' },
  { id: 'ct-6',  name: 'spicy' },
  { id: 'ct-7',  name: 'oaky' },
  { id: 'ct-8',  name: 'citrus' },
  { id: 'ct-9',  name: 'vanilla' },
  { id: 'ct-10', name: 'caramel' },
  { id: 'ct-11', name: 'maritime' },
  { id: 'ct-12', name: 'briny' },
  { id: 'ct-13', name: 'dried fruit' },
  { id: 'ct-14', name: 'sherry' },
  { id: 'ct-15', name: 'nutty' },
  { id: 'ct-16', name: 'heathery' },
  { id: 'ct-17', name: 'grassy' },
  { id: 'ct-18', name: 'medicinal' },
  { id: 'ct-19', name: 'chocolate' },
  { id: 'ct-20', name: 'leather' },
]

export const MOCK_MEETINGS: Meeting[] = [
  { id: 'm-1', name: 'March 2026 Club Night',    date: '2026-03-08', type: 'club'     },
  { id: 'm-2', name: 'January 2026 Club Night',  date: '2026-01-11', type: 'club'     },
  { id: 'm-3', name: 'November 2025 Club Night', date: '2025-11-09', type: 'club'     },
  { id: 'm-4', name: 'Islay Night',              date: '2026-02-14', type: 'personal' },
]

export const MOCK_BOTTLES: Bottle[] = [
  {
    id: 'b-1', name: 'Laphroaig 10 Year Old', distillery: 'Laphroaig',
    region: 'Islay', ageStatement: 10, abv: 43.0, vintage: null,
    imageUrls: [], createdAt: '2025-11-09T18:00:00Z', tagId: 'tag-laph-10',
  },
  {
    id: 'b-2', name: 'Glenfiddich 12 Year Old', distillery: 'Glenfiddich',
    region: 'Speyside', ageStatement: 12, abv: 40.0, vintage: null,
    imageUrls: [], createdAt: '2025-11-09T18:05:00Z', tagId: 'tag-glf-12',
  },
  {
    id: 'b-3', name: 'Macallan 18 Year Old', distillery: 'The Macallan',
    region: 'Speyside', ageStatement: 18, abv: 43.0, vintage: null,
    imageUrls: [], createdAt: '2026-01-11T18:00:00Z', tagId: 'tag-mac-18',
  },
  {
    id: 'b-4', name: 'Highland Park 12 Year Old', distillery: 'Highland Park',
    region: 'Islands', ageStatement: 12, abv: 40.0, vintage: null,
    imageUrls: [], createdAt: '2026-01-11T18:05:00Z', tagId: 'tag-hp-12',
  },
  {
    id: 'b-5', name: 'Oban 14 Year Old', distillery: 'Oban',
    region: 'West Highlands', ageStatement: 14, abv: 43.0, vintage: null,
    imageUrls: [], createdAt: '2026-01-11T18:10:00Z', tagId: 'tag-oban-14',
  },
  {
    id: 'b-6', name: 'Talisker 10 Year Old', distillery: 'Talisker',
    region: 'Islands', ageStatement: 10, abv: 45.8, vintage: null,
    imageUrls: [], createdAt: '2026-02-14T18:00:00Z', tagId: 'tag-tal-10',
  },
  {
    id: 'b-7', name: "Aberlour A'bunadh", distillery: 'Aberlour',
    region: 'Speyside', ageStatement: null, abv: 60.9, vintage: null,
    imageUrls: [], createdAt: '2026-02-14T18:05:00Z', tagId: 'tag-abl-ab',
  },
  {
    id: 'b-8', name: 'Balvenie 14 DoubleWood', distillery: 'Balvenie',
    region: 'Speyside', ageStatement: 14, abv: 43.0, vintage: null,
    imageUrls: [], createdAt: '2026-03-08T18:00:00Z', tagId: 'tag-bal-14',
  },
  {
    id: 'b-9', name: 'Bruichladdich Classic Laddie', distillery: 'Bruichladdich',
    region: 'Islay', ageStatement: null, abv: 50.0, vintage: null,
    imageUrls: [], createdAt: '2026-03-08T18:05:00Z', tagId: 'tag-bru-cl',
  },
  {
    id: 'b-10', name: 'Bunnahabhain 12 Year Old', distillery: 'Bunnahabhain',
    region: 'Islay', ageStatement: 12, abv: 46.3, vintage: null,
    imageUrls: [], createdAt: '2026-03-08T18:10:00Z', tagId: 'tag-bun-12',
  },
]

export const MOCK_NFC_TAGS: Record<string, string> = {
  'tag-laph-10': 'b-1',
  'tag-glf-12':  'b-2',
  'tag-mac-18':  'b-3',
  'tag-hp-12':   'b-4',
  'tag-oban-14': 'b-5',
  'tag-tal-10':  'b-6',
  'tag-abl-ab':  'b-7',
  'tag-bal-14':  'b-8',
  'tag-bru-cl':  'b-9',
  'tag-bun-12':  'b-10',
}

export const MOCK_REVIEWS: Review[] = [
  // ── Nov 2025 club night ─────────────────────────────────────────────────
  {
    id: 'r-1', bottleId: 'b-1', meetingId: 'm-3',
    reviewerEmail: 'james@example.com', reviewerName: 'James',
    rating: 8, trustRating: 9,
    comments: 'Classic Islay medicine chest. The peat is bold but the sweetness underneath is beautiful.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-1', reviewId: 'r-1', tagId: 'ct-2',  tagName: 'peaty',     rating: 10, comments: 'Defining characteristic — full-on peat bog.' },
      { id: 'rc-2', reviewId: 'r-1', tagId: 'ct-18', tagName: 'medicinal', rating: 9,  comments: 'Iodine and seaweed notes throughout.' },
      { id: 'rc-3', reviewId: 'r-1', tagId: 'ct-11', tagName: 'maritime',  rating: 8,  comments: '' },
    ],
    createdAt: '2025-11-09T19:30:00Z',
  },
  {
    id: 'r-2', bottleId: 'b-1', meetingId: 'm-3',
    reviewerEmail: 'sarah@example.com', reviewerName: 'Sarah',
    rating: 6, trustRating: 7,
    comments: 'A bit much for me honestly. Love the complexity but the peat is overwhelming.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-4', reviewId: 'r-2', tagId: 'ct-2',  tagName: 'peaty',     rating: 10, comments: '' },
      { id: 'rc-5', reviewId: 'r-2', tagId: 'ct-18', tagName: 'medicinal', rating: 8,  comments: 'Bandage notes quite strong.' },
    ],
    createdAt: '2025-11-09T19:45:00Z',
  },
  {
    id: 'r-3', bottleId: 'b-2', meetingId: 'm-3',
    reviewerEmail: 'james@example.com', reviewerName: 'James',
    rating: 7, trustRating: 8,
    comments: 'A reliable crowd-pleaser. Fresh pear and light oak. The gateway dram for a reason.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-6', reviewId: 'r-3', tagId: 'ct-3', tagName: 'fruity',  rating: 8, comments: 'Pear and apple dominate.' },
      { id: 'rc-7', reviewId: 'r-3', tagId: 'ct-4', tagName: 'floral',  rating: 6, comments: 'Subtle floral on the nose.' },
      { id: 'rc-8', reviewId: 'r-3', tagId: 'ct-9', tagName: 'vanilla', rating: 7, comments: '' },
    ],
    createdAt: '2025-11-09T20:10:00Z',
  },
  // ── Jan 2026 club night ─────────────────────────────────────────────────
  {
    id: 'r-4', bottleId: 'b-3', meetingId: 'm-2',
    reviewerEmail: 'james@example.com', reviewerName: 'James',
    rating: 9, trustRating: 9,
    comments: 'The sherry influence is magnificent. Rich, complex, long finish. Worth every penny.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-9',  reviewId: 'r-4', tagId: 'ct-14', tagName: 'sherry',      rating: 10, comments: 'Exceptional sherry cask influence.' },
      { id: 'rc-10', reviewId: 'r-4', tagId: 'ct-13', tagName: 'dried fruit', rating: 9,  comments: 'Dark fruits — raisin, fig, sultana.' },
      { id: 'rc-11', reviewId: 'r-4', tagId: 'ct-7',  tagName: 'oaky',        rating: 7,  comments: '' },
      { id: 'rc-12', reviewId: 'r-4', tagId: 'ct-10', tagName: 'caramel',     rating: 8,  comments: '' },
    ],
    createdAt: '2026-01-11T19:30:00Z',
  },
  {
    id: 'r-5', bottleId: 'b-3', meetingId: 'm-2',
    reviewerEmail: 'mike@example.com', reviewerName: 'Mike',
    rating: 8, trustRating: 8,
    comments: 'Stunning whisky. The kind of dram you sip slowly and contemplate the universe.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-13', reviewId: 'r-5', tagId: 'ct-14', tagName: 'sherry',    rating: 9, comments: '' },
      { id: 'rc-14', reviewId: 'r-5', tagId: 'ct-19', tagName: 'chocolate', rating: 7, comments: 'Dark chocolate on the finish.' },
    ],
    createdAt: '2026-01-11T19:45:00Z',
  },
  {
    id: 'r-6', bottleId: 'b-4', meetingId: 'm-2',
    reviewerEmail: 'sarah@example.com', reviewerName: 'Sarah',
    rating: 8, trustRating: 8,
    comments: 'A beautiful balance of everything. Smoke, honey, heather. The Orkney terroir shines.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-15', reviewId: 'r-6', tagId: 'ct-5',  tagName: 'honeyed',  rating: 8, comments: '' },
      { id: 'rc-16', reviewId: 'r-6', tagId: 'ct-16', tagName: 'heathery', rating: 8, comments: 'Distinctly heathery — moorland walk vibes.' },
      { id: 'rc-17', reviewId: 'r-6', tagId: 'ct-1',  tagName: 'smoky',    rating: 5, comments: 'Gentle smoke, nothing like Islay.' },
    ],
    createdAt: '2026-01-11T20:00:00Z',
  },
  {
    id: 'r-11', bottleId: 'b-5', meetingId: 'm-2',
    reviewerEmail: 'mike@example.com', reviewerName: 'Mike',
    rating: 7, trustRating: 8,
    comments: 'Gentle and maritime. A great introductory West Highlands dram.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-28', reviewId: 'r-11', tagId: 'ct-11', tagName: 'maritime', rating: 7, comments: '' },
      { id: 'rc-29', reviewId: 'r-11', tagId: 'ct-9',  tagName: 'vanilla',  rating: 6, comments: '' },
    ],
    createdAt: '2026-01-11T20:15:00Z',
  },
  // ── Feb 2026 personal Islay night ───────────────────────────────────────
  {
    id: 'r-7', bottleId: 'b-6', meetingId: 'm-4',
    reviewerEmail: 'james@example.com', reviewerName: 'James',
    rating: 9, trustRating: 9,
    comments: 'The explosive peppery finish is sensational. One of my all-time favorites.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-18', reviewId: 'r-7', tagId: 'ct-6',  tagName: 'spicy',    rating: 10, comments: 'White pepper explosion on the finish.' },
      { id: 'rc-19', reviewId: 'r-7', tagId: 'ct-11', tagName: 'maritime', rating: 9,  comments: '' },
      { id: 'rc-20', reviewId: 'r-7', tagId: 'ct-1',  tagName: 'smoky',    rating: 7,  comments: '' },
    ],
    createdAt: '2026-02-14T19:00:00Z',
  },
  {
    id: 'r-12', bottleId: 'b-7', meetingId: 'm-4',
    reviewerEmail: 'james@example.com', reviewerName: 'James',
    rating: 9, trustRating: 8,
    comments: "A'bunadh never disappoints. Sherry bomb at cask strength — need to add water.",
    isPrivate: false,
    characteristics: [
      { id: 'rc-30', reviewId: 'r-12', tagId: 'ct-14', tagName: 'sherry',      rating: 10, comments: '' },
      { id: 'rc-31', reviewId: 'r-12', tagId: 'ct-13', tagName: 'dried fruit', rating: 9,  comments: 'Intense dried fruits with a spice kick.' },
      { id: 'rc-32', reviewId: 'r-12', tagId: 'ct-6',  tagName: 'spicy',       rating: 8,  comments: '' },
    ],
    createdAt: '2026-02-14T19:45:00Z',
  },
  // ── Mar 2026 club night ─────────────────────────────────────────────────
  {
    id: 'r-8', bottleId: 'b-8', meetingId: 'm-1',
    reviewerEmail: 'mike@example.com', reviewerName: 'Mike',
    rating: 8, trustRating: 8,
    comments: 'The DoubleWood process adds real complexity. Honey, vanilla, spice.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-21', reviewId: 'r-8', tagId: 'ct-5', tagName: 'honeyed', rating: 9, comments: '' },
      { id: 'rc-22', reviewId: 'r-8', tagId: 'ct-9', tagName: 'vanilla', rating: 8, comments: '' },
      { id: 'rc-23', reviewId: 'r-8', tagId: 'ct-6', tagName: 'spicy',   rating: 5, comments: 'Very subtle, back-palate spice.' },
    ],
    createdAt: '2026-03-08T19:30:00Z',
  },
  {
    id: 'r-9', bottleId: 'b-8', meetingId: 'm-1',
    reviewerEmail: 'sarah@example.com', reviewerName: 'Sarah',
    rating: 9, trustRating: 9,
    comments: 'My favourite bottle of the night. I could drink this every day.',
    isPrivate: false,
    characteristics: [
      { id: 'rc-24', reviewId: 'r-9', tagId: 'ct-5', tagName: 'honeyed', rating: 9, comments: '' },
      { id: 'rc-25', reviewId: 'r-9', tagId: 'ct-9', tagName: 'vanilla', rating: 8, comments: '' },
    ],
    createdAt: '2026-03-08T19:45:00Z',
  },
  {
    id: 'r-10', bottleId: 'b-9', meetingId: 'm-1',
    reviewerEmail: 'james@example.com', reviewerName: 'James',
    rating: 7, trustRating: 6,
    comments: 'Interesting. Unpeated Islay is unusual for Bruichladdich. Growing on me.',
    isPrivate: true,   // private review example
    characteristics: [
      { id: 'rc-26', reviewId: 'r-10', tagId: 'ct-17', tagName: 'grassy', rating: 7, comments: '' },
      { id: 'rc-27', reviewId: 'r-10', tagId: 'ct-8',  tagName: 'citrus', rating: 6, comments: 'Lemon zest on the nose.' },
    ],
    createdAt: '2026-03-08T20:00:00Z',
  },
  {
    id: 'r-13', bottleId: 'b-10', meetingId: 'm-1',
    reviewerEmail: 'sarah@example.com', reviewerName: 'Sarah',
    rating: 8, trustRating: 8,
    comments: "Soft and approachable for an Islay. Almost no peat. A great bridge whisky.",
    isPrivate: false,
    characteristics: [
      { id: 'rc-33', reviewId: 'r-13', tagId: 'ct-12', tagName: 'briny',   rating: 6, comments: '' },
      { id: 'rc-34', reviewId: 'r-13', tagId: 'ct-15', tagName: 'nutty',   rating: 7, comments: '' },
      { id: 'rc-35', reviewId: 'r-13', tagId: 'ct-3',  tagName: 'fruity',  rating: 6, comments: '' },
    ],
    createdAt: '2026-03-08T20:15:00Z',
  },
]
