# MSMS (Malt, Meet, Sip, Score) — App Design Doc

> This file is the living specification and build tracker.
> Break implementation into the chunks listed under "Build Plan" — each chunk is sized to fit in one response.

---

## App Name Placeholder
"MSMS" — working title. Update as desired.

---

## Core Concept
A web app for a Scotch whisky tasting club. Members tap NFC stickers on bottles to open the app pre-loaded with that bottle. They can rate it, leave tasting notes, tag characteristics, and attach photos. Reviews are linked to a meeting/session and to the reviewer's email-based soft profile. All data is public by default; reviews may be marked private (soft — hidden from public feeds, no server enforcement).

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | React 18 + Vite | Deployed on Vercel (free) |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| State | Zustand | Lightweight global state |
| DB + API | Supabase (free tier) | Postgres + auto REST + Storage for photos |
| Auth | None (email identity only) | Email stored in localStorage |
| Hosting | Vercel | Free, deploys from GitHub |
| NFC write | Web NFC API (Android Chrome) | iOS fallback: NFC Tools guided instructions |
| Image storage | Supabase Storage | Public bucket, per-bottle folder |

---

## URL Structure

| URL | Purpose |
|---|---|
| `/` | Home / dashboard |
| `/t/:tagId` | NFC tap landing — looks up bottle or starts registration |
| `/bottle/:bottleId` | Bottle detail page |
| `/bottle/:bottleId/review` | Leave a review (optionally pre-linked to meeting) |
| `/bottle/new` | Register a new bottle (after tag lookup fails) |
| `/meetings` | Browse all meeting dates |
| `/meeting/:meetingId` | Meeting detail — list of bottles tasted |
| `/search` | Search bottles |
| `/profile` | User profile (change display name, see own reviews) |

---

## Data Model

### `users`
```
id          uuid PK
email       text UNIQUE NOT NULL
display_name text
created_at  timestamptz
```

### `bottles`
```
id           uuid PK
name         text NOT NULL
distillery   text
region       text
age          int  (null = NAS)
abv          numeric(5,2)
vintage_year int
notes        text  (general bottle notes, not a review)
created_by   uuid → users
created_at   timestamptz
```

### `bottle_photos`
```
id          uuid PK
bottle_id   uuid → bottles
photo_type  text  ('front' | 'back' | 'other')
storage_url text
uploaded_by uuid → users
uploaded_at timestamptz
```

### `nfc_tags`
```
tag_id      text PK  (slug written to tag URL, e.g. "a1b2c3")
bottle_id   uuid → bottles
registered_by uuid → users
registered_at timestamptz
```

### `meetings`
```
id          uuid PK
name        text
date        date NOT NULL
type        text  ('club' | 'personal' | 'none')
created_by  uuid → users
created_at  timestamptz
```

### `tastings`  (bottle × meeting)
```
id          uuid PK
bottle_id   uuid → bottles
meeting_id  uuid → meetings (nullable if no meeting)
```

### `reviews`
```
id              uuid PK
tasting_id      uuid → tastings
reviewer_id     uuid → users
rating          int  (1–10)
trust_rating    int  (1–10)  -- "how much should future-you trust this?"
comments        text
is_private      bool DEFAULT false
created_at      timestamptz
updated_at      timestamptz
```

### `characteristic_tags`
```
id          uuid PK
name        text UNIQUE NOT NULL  (lowercase, trimmed)
created_by  uuid → users
created_at  timestamptz
```

### `review_characteristics`
```
id              uuid PK
review_id       uuid → reviews
char_tag_id     uuid → characteristic_tags
rating          int  (1–10, nullable)
comments        text
```

---

## Feature Inventory

### NFC / Tap Flow
- [x] Tap tag → open `/t/:tagId`
- [x] Tag found → redirect to `/bottle/:id`
- [x] Tag unknown → offer to register (link to existing bottle or create new)
- [x] Android: Web NFC API to write URL to new blank tag
- [x] iOS: Modal with step-by-step NFC Tools instructions + copyable URL

### Bottle Detail Page (`/bottle/:id`)
- [x] Name, distillery, region, age, ABV, vintage
- [x] Photo carousel (front, back, other) with upload button
- [x] Aggregate rating (avg of public reviews)
- [x] List of reviews (public + own private)
- [x] Button: "Review this bottle"
- [x] Meeting context shown (which meetings this bottle appeared in)

### Review Form
- [x] Overall rating 1–10 (tap/slider)
- [x] Trust rating 1–10 ("how much should future-you trust this?")
  - Helper text: "Were you tired? 3rd bottle of the night? Rate your own reliability."
- [x] Comments (free text)
- [x] Private toggle
- [x] Characteristic tags section:
  - Search existing tags (typeahead)
  - Add new tag if not found
  - Per-tag: rating 1–10 (optional) + comment (optional)
- [x] Meeting association (auto-detect or prompt — see Meeting Logic)

### Meeting / Session Logic
- On review submit: check if any meeting record exists for today's date
  - If yes → confirm association with that meeting
  - If no → modal:
    1. Club meeting (creates meeting record, date = today, name editable)
    2. Personal tasting (user names it, type = 'personal')
    3. No association (standalone review)

### Browse: Meeting List (`/meetings`)
- [x] List of all dates with entries, grouped or sorted by date (newest first)
- [x] Filter toggles:
  - All entries
  - Club meetings only
  - My entries only (any meeting where current user has a review)
- [x] Click date → open meeting detail page

### Meeting Detail (`/meeting/:id`)
- [x] List of bottles tasted that night
- [x] Mini rating summary per bottle
- [x] Click bottle → bottle detail page

### Search (`/search`)
- [x] Text search on bottle name, distillery, region
- [x] Toggle: "This meeting only" vs "All bottles ever"
- [x] Results show bottle name, avg rating, # reviews

### Browse from Meeting Context
- When user is in a meeting session, home page / nav shows "Tonight's Bottles" — quick list of bottles already scanned/added to tonight's meeting
- Can tap any to review without needing NFC scan

### User Profile / Identity
- [x] Email stored in localStorage (key: `msms_user_email`)
- [x] Display name stored in localStorage + synced to Supabase `users` table
- [x] Profile page: change display name, view own reviews (including private ones)
- [x] On any page: if no email in localStorage → prompt modal to enter email

### Photos
- [x] Multiple photos per bottle
- [x] Types: Front Label, Back Label, Other
- [x] Stored in Supabase Storage (public bucket: `bottle-photos`)
- [x] Path: `bottle-photos/{bottleId}/{uuid}.jpg`
- [x] Upload from review page or bottle detail page
- [x] Carousel display on bottle page

---

## Build Plan (Chunked for Implementation)

Each chunk is one self-contained response worth of work.

### Chunk 1 — Project Scaffold
- Init Vite + React + TypeScript project in `MSMS App/`
- Install: react-router-dom, tailwindcss, zustand, @supabase/supabase-js
- Set up folder structure (pages, components, lib, hooks)
- `.env.example` for Supabase keys
- Basic App.tsx with router shell (all routes stubbed)

### Chunk 2 — Supabase Schema
- Full SQL migration file (`supabase/migrations/001_initial.sql`)
- Row Level Security policies (public read for non-private reviews, user-scoped writes)
- Storage bucket policy for bottle photos

### Chunk 3 — User Identity
- `useUser` hook (reads/writes localStorage + syncs to Supabase)
- Email prompt modal (shown when no identity set)
- Profile page (display name edit, list own reviews)
- Zustand store for current user

### Chunk 4 — NFC Tap Landing + Bottle Lookup
- `/t/:tagId` page
- Supabase lookup: tag → bottle
- Found: redirect to bottle page
- Not found: "Register this tag" flow entry point
- Platform detection (Android vs iOS)

### Chunk 5 — Bottle Registration
- "Register tag" form: link to existing bottle (search) OR create new
- New bottle form: name, distillery, region, age, ABV, vintage, notes
- Android: Web NFC write flow
- iOS: NFC Tools instruction modal with copyable URL

### Chunk 6 — Bottle Detail Page
- Display bottle info
- Photo carousel
- Photo upload (Supabase Storage)
- Aggregate rating display
- List of public reviews (+ own private reviews)
- "Review this bottle" button

### Chunk 7 — Meeting Logic + Session State
- Zustand store for active meeting
- On review submit: today's date check against meetings table
- Meeting prompt modal (club / personal / none)
- "Tonight's bottles" derived list

### Chunk 8 — Review Form
- Rating widget (1–10, tap to select)
- Trust rating widget with helper text
- Comments textarea
- Private toggle
- Characteristic tag section (typeahead search + add new + per-tag rating/comment)
- Meeting association (from Chunk 7)
- Submit → write to reviews + review_characteristics

### Chunk 9 — Browse: Meetings List + Meeting Detail
- `/meetings` page with filter toggles (all / club / mine)
- Meeting detail page: bottle list with ratings
- Link back to bottle pages

### Chunk 10 — Search
- `/search` page
- Text input with debounce
- Toggle: current meeting vs all-time
- Results list

### Chunk 11 — Navigation + Polish
- Top nav / bottom nav bar
- "Tonight's Bottles" quick list on home
- Empty states, loading states
- Mobile-first responsiveness pass

---

## Open Questions / Decisions Log

| Question | Decision |
|---|---|
| NFC tag type | NFC (not RFID) — URL-storing stickers |
| Private review enforcement | Soft only — hidden from public feed, no server auth |
| Bottle data | Manual entry only |
| Rating scale | 1–10 |
| Who can register bottles | Any member |
| Ratings per meeting | Separate review per meeting event |
| Hosting | Vercel (free) + Supabase (free tier) |
| iOS NFC write | Guided NFC Tools instructions with copyable URL |
| Multi-photo | Yes — front/back/other, Supabase Storage |
| Trust rating | Yes — 1–10, "how much should future-you trust this?" |

---

## Status

- [ ] Chunk 1 — Project Scaffold
- [ ] Chunk 2 — Supabase Schema
- [ ] Chunk 3 — User Identity
- [ ] Chunk 4 — NFC Tap Landing
- [ ] Chunk 5 — Bottle Registration
- [ ] Chunk 6 — Bottle Detail Page
- [ ] Chunk 7 — Meeting Logic
- [ ] Chunk 8 — Review Form
- [ ] Chunk 9 — Meetings Browser
- [ ] Chunk 10 — Search
- [ ] Chunk 11 — Nav + Polish
