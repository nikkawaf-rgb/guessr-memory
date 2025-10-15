# Memory Keeper — Roadmap (Draft)

This is a living roadmap for the Memory Keeper project (GeoGuessr‑style memory game + social gallery). We’ll iterate and adjust as we go.

## Vision
- Gallery of community photos with comments/likes (no spoilers).
- Game sessions: each session shows 10 random photos; player identifies people (via tags), location (city), and date (day/month/year) for points.
- Leaderboard, achievements, and profiles.
- Admin tools for content management and moderation.
- Supabase for storage and platform services; Prisma + Postgres for data models; Next.js App Router.

References: [Supabase — Postgres development platform](https://supabase.com/)

## Scoring Rules (current spec)
- People: 200 pts if all people are correctly identified via tags.
- Location (city): 200 pts if correct.
- Date: up to 600 pts — 200 for year, 200 for month, 200 for day.
- Max per photo: 1000 pts.

## Current Status (from repo audit)
- Auth: NextAuth credentials provider for admin is wired (`app/api/auth/[...nextauth]/route.ts`); Google/VK pending.
- Upload & registration:
  - Upload to Supabase Storage: `app/api/photos/upload/route.ts`.
  - DB registration + EXIF date intake: `app/api/photos/register/route.ts`.
  - Admin upload UI with EXIF parsing via `exifr`: `app/admin/upload/page.tsx`.
- Data models (Prisma): Users, Photos (with `exifTakenAt`), People/Tagging zones, Sessions/Guesses, Comments/Likes/Reports, Achievements, AdminConfig, UserLabelPresets (`prisma/schema.prisma`).
- Gallery: `app/gallery/page.tsx` (no spoilers; shows previews + comments count), detail page `app/photo/[id]/page.tsx` with comments and basic like/report actions.
- Play/Leaderboard pages: placeholders exist (`app/play/page.tsx`, `app/leaderboard/page.tsx`).
- Supabase helpers present in `app/lib/*`.

### Updates (Oct 2025)
- Direct client upload to Supabase in admin to avoid 413 (`app/admin/upload/page.tsx`).
- Session start API + session flow (`/api/session/start`, `app/session/[id]/page.tsx`).
- Server action `submitGuess` with scoring (`app/session/actions.ts`).
- Admin: People and Locations CRUD pages (`/admin/people`, `/admin/locations`).
- Admin: Zones tool added — list and per-photo editor (`/admin/zones`, `/admin/zones/[photoId]`), basic rect helper.
- Session page: minimal people tagger (client component), `guessedPeopleNames` + `timeSpentSec`, next-photo navigation.

## Phase 0 — Foundations (in progress)
- [x] Prisma schema for core entities
- [x] Supabase Storage upload endpoint
- [x] Photo registration endpoint with EXIF date intake
- [x] Basic gallery and photo detail pages
- [x] Comments + like/report endpoints
- [x] Admin sign‑in (credentials)
- [x] Admin upload with EXIF + direct Supabase upload (413 fixed)
- [ ] Protect admin routes (middleware/role checks)
- [ ] Rate limiting for comment/like/report
- [ ] Migrations applied and synced with DB

## Phase 1 — MVP Game (Ranked mode)
- Game session core
  - [x] Session creation (10 random active photos, per‑player randomized ordering)
  - [ ] Session progress persistence (resume between sessions)
  - [x] Per‑photo UI: minimal tagging UI (names list), city input, date input
  - [ ] People tagging geometry check vs. `PhotoPeopleZone` (match inside shapes)
  - [x] Location check vs. `Location` (with aliases)
  - [x] Date check: year/month/day vs. `Photo.exifTakenAt` or admin override
  - [x] Scoring service (200 people, 200 location, 200 each Y/M/D)
  - [x] Time tracking per photo (for achievements later)
- Comments during play
  - [ ] Inline comment box on task screen; reminder: no spoilers
  - [x] Persist and revalidate; visible later on photo page
- Admin setup for answers
  - [x] People directory (`Person`) CRUD
  - [x] Photo tagging zones CRUD (`PhotoPeopleZone`), basic rect helper; polygon/circle UI pending
  - [x] Locations CRUD with aliases
  - [ ] Photo active/hide moderation, comment moderation

## Phase 2 — Leaderboard, Profiles, Achievements
- Leaderboard
  - [ ] Ranked leaderboards (daily/weekly/all‑time)
  - [ ] Titles (e.g., “Хранитель памяти”) based on rank/season
- Profiles
  - [ ] Player profile page: achievements, stats (ranked/fun), comment activity
  - [ ] Session history and best scores
- Achievements (initial set)
  - [ ] “Перфекционист” — 1,000 pts on one photo
  - [ ] “Комментатор” — 10+ comments
  - [ ] “Популярный” — 20+ likes on comments
  - [ ] “Активист” — comments on every photo in a session
  - [ ] “Быстрый стрелок” — average answer < 10s
  - [ ] “Снайпер” — 5 perfect tag hits in a row
  - [ ] “Молния” — answer < 5s
  - [ ] “Эрудит” — all dates correct in one game
  - [ ] “Знаток лиц” — all people correct in 5 photos
  - [ ] “Знаток мест” — 8 correct locations in a row
  - [ ] “Историк” — 10 correct years
  - [ ] “Ясновидящий” — exact day+month on 3 photos in a row
  - [ ] Social: “Болтун”, “Душа компании”, “Товарищ”, “Рассказчик”, “Весельчак”
  - [ ] Special: “Новичок”, “Повторитель”, “Марафонец”, “Циркач”, “Детектив”

## Phase 3 — Fun mode, UX, and Safety
- Fun mode
  - [ ] Alternate non‑ranked rules and relaxed scoring
- UX & Accessibility
  - [ ] Skeletons, error states, keyboard navigation
  - [ ] Responsive tagging canvas with `react‑konva`
- Safety & anti‑cheat
  - [ ] Don’t leak answers in UI/requests
  - [ ] Minimal metadata exposure; cache headers; server checks
  - [ ] Basic anomaly detection (e.g., impossible fast solves)

## Phase 4 — Admin & Moderation
- [ ] Admin dashboard: reports queue, comment hide/unhide
- [ ] Bulk photo import tool (drag‑drop + EXIF)
- [ ] People/Locations management UI
- [ ] Photo status and answer overrides (date/location)

## Phase 5 — Platform & Ops
- Auth
  - [ ] Email/password or magic link (easy) and/or VK OAuth
- Performance
  - [ ] Thumbnails, image optimization, caching
  - [ ] Edge rendering where applicable
- Reliability & Security
  - [ ] Zod validation on all API routes
  - [ ] CSRF for mutations, rate limiting
  - [ ] Transactions for multi‑write operations
- Observability & CI/CD
  - [ ] Structured logs, basic tracing
  - [ ] Lint/type/test checks in CI; preview envs

## Data & Entities Checklist
- [x] `User`, `Photo`, `Comment`, `CommentLike`, `Report`
- [x] `Person`, `PhotoPeopleZone`, `Location`
- [x] `Session`, `SessionPhoto`, `Guess`
- [x] `Achievement`, `UserAchievement`
- [x] `AdminConfig`, `UserLabelPreset`

## Open Questions
- People tagging: allow free‑text tags and map to `Person` by admin review? or strict list?
- Location granularity: city only vs. city + venue?
- Allow hints (off by default) for fun mode?
- Seasonality for leaderboards?

## Current Step (for Cursor to resume)
1) Production stability: fix Supabase upload error "Invalid Compact JWS" (verify NEXT_PUBLIC_SUPABASE_URL/ANON_KEY on Vercel; Storage policies for `photos` bucket set; redeploy).
2) Ensure prod DB has migrations applied (`prisma migrate deploy` against Production `DATABASE_URL`).
3) People tagging geometry: implement shape comparison (rect/circle/polygon + tolerance) against `PhotoPeopleZone` and switch UI to `react‑konva` editor in admin.
4) Admin route protection (middleware/role checks).

## Next Steps
- Add leaderboard and basic achievements.
- Harden APIs with validation and rate limits.
- Improve upload path: optional server-side upload using `SUPABASE_SERVICE_ROLE_KEY` to avoid client anon permissions.

## Known Issues / Risks
- Upload in Production fails with "Invalid Compact JWS" when `NEXT_PUBLIC_SUPABASE_ANON_KEY` is invalid/mismatched; verify env vars and Storage policies; consider moving to server-side upload.
- Possible missing prod migrations cause server exceptions on `/admin/zones/[photoId]` and `/session/[id]`.
