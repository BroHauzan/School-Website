# TASK: Implement Preview System for SMAN 1 Lumajang Admin Page Builder

## Context
Next.js App Router project with Firebase (Admin SDK for server writes, Firestore rules lock
client writes). Admin page builder lives in `components/admin/` (`HalamanForm.tsx`,
`BlockEditor.tsx`, etc.), backed by `lib/halaman-schema.ts` (types/validation) and
`lib/halaman-server.ts` (server-only data access). Public pages render blocks via a
block renderer component under `components/public/`.

## Problem
The PRD requires a way for non-coder admins to preview a page before publishing it.
This does not currently exist — content edited in the admin panel goes straight to the
published Firestore doc with no way to review the rendered result first. This is the
top-priority gap from the latest audit (see action item #3, CRITICAL).

## Goal
Add a token-based preview flow:
1. Admin edits blocks in the page builder (unsaved / draft state in the client).
2. Admin clicks "Preview" — this persists the current draft blocks separately from the
   published `blocks` field, and generates a short-lived preview token.
3. A new tab opens at a `/preview/[slug]?token=...` route that renders the draft content
   using the existing public block renderer, without touching the published doc or
   requiring a login (token-based access, so it can be shared with other reviewers).
4. Token expires after 30 minutes and is regenerated (invalidating the old one) every
   time "Preview" is clicked again.
5. Publishing (the existing publish/save action) should NOT depend on preview — preview
   is optional and additive to the current save flow.

## Implementation Steps

### 1. Schema — `lib/halaman-schema.ts`
Extend `HalamanDoc` with:
- `draftBlocks?: Blok[] | null` — snapshot of unpublished draft content, separate from
  the published `blocks` field
- `draftUpdatedAt?: Timestamp | null`
- `previewToken?: string | null`
- `previewTokenExpiresAt?: Timestamp | null`

Update any Zod/validation schema for `HalamanDoc` accordingly so these fields pass
validation as optional/nullable.

### 2. Server logic — `lib/halaman-server.ts`
Add two functions:

- `createPreviewToken(halamanId: string, draftBlocks: Blok[])`
  - Generates a random token (crypto-secure, e.g. `crypto.randomBytes(24).toString("hex")`)
  - Sets `draftBlocks`, `draftUpdatedAt`, `previewToken`, and `previewTokenExpiresAt`
    (now + 30 minutes) on the doc via the Admin SDK
  - Returns `{ token, expiresAt }`

- `getHalamanForPreview(halamanId: string, token: string)` (or by slug, whichever the
  public renderer currently looks up by — check `lib/halaman-server.ts` for the existing
  published-page lookup function and mirror its signature)
  - Fetches the doc
  - Returns `null` if the doc doesn't exist, the token doesn't match, or the token is
    expired (compare `previewTokenExpiresAt` against `Date.now()`)
  - On success, returns the doc data with `blocks` replaced by `draftBlocks` (falling
    back to published `blocks` if `draftBlocks` is empty/null)

Reuse existing patterns already in this file (optimistic locking, error handling style,
Firestore access patterns) rather than introducing new conventions.

### 3. API route — `app/api/admin/halaman/[id]/preview-token/route.ts`
- `POST` handler, admin-only
- Must reuse the existing admin session verification used elsewhere in
  `app/api/admin/**` routes (find and reuse it — do not reinvent auth)
- Must reuse the existing `assertSameOrigin` / CSRF check pattern already used on other
  state-changing admin routes
- Request body: `{ draftBlocks: Blok[] }` — the current in-editor state, not yet saved
- Calls `createPreviewToken` and returns `{ token, expiresAt }` as JSON
- Return proper status codes: 403 for origin/CSRF failure, 401 for unauthenticated,
  500 on unexpected errors — match the existing error response shape used by sibling
  admin API routes (e.g. the generic `errMsg()` helper mentioned in the codebase)

### 4. Preview page — `app/preview/[slug]/page.tsx`
- Server component
- Reads `token` from `searchParams`
- Looks up the page by slug, then validates the token via `getHalamanForPreview`
- If invalid/expired/missing token → render a clear "Preview link expired or invalid"
  message (do NOT leak whether the slug exists if the token is wrong — same generic
  message either way, to avoid enumeration)
- If valid → render using the SAME block renderer component used by the real public
  page (do not fork/duplicate rendering logic) so preview accurately reflects what will
  actually go live
- Add a persistent visual banner at the top (e.g. "PREVIEW MODE — this content is not
  yet published") so it's never confused with the live page
- Add `<meta name="robots" content="noindex, nofollow">` so preview pages are never
  indexed
- Do NOT reuse the production layout's nav/footer data if that data itself could leak
  unpublished state — check how the real public page pulls global nav/footer and keep
  that part identical (published) while only the page body reflects the draft

### 5. Admin UI — `components/admin/HalamanForm.tsx`
- Add a "Preview" button near the existing Save/Publish actions
- On click: POST the current in-memory block state to the new API route, then
  `window.open()` the resulting `/preview/[slug]?token=...` URL in a new tab
- Show a loading state on the button while the request is in flight
- Show a toast/inline error if token creation fails
- Disable the button if there are no blocks yet / the form is in an invalid state
  (reuse whatever validation gates the existing Save button)

## Constraints / Things to Preserve
- Do NOT change how publishing/saving currently works — this is additive only
- Do NOT allow preview token creation to bypass the existing admin auth or CSRF checks
- Do NOT let preview data touch the published Firestore fields that the live public
  site reads from
- Match existing code style, naming conventions (`*-server.ts`, `*-schema.ts`), and
  error-handling patterns already established in the repo rather than introducing new
  patterns
- Keep the block renderer single-source-of-truth — preview and published pages must
  render through the exact same component

## Acceptance Criteria
- [ ] Clicking "Preview" in the admin panel opens a new tab showing unpublished draft
      content rendered exactly as it would appear live
- [ ] The published page is unaffected by preview actions
- [ ] Preview links stop working after 30 minutes
- [ ] Preview links stop working once a newer preview token has been generated for the
      same page
- [ ] Preview route requires no login but cannot be brute-forced into revealing content
      without a valid token (generic error message on failure)
- [ ] Preview pages are excluded from search indexing
- [ ] No new dependencies added unless something already in `package.json` doesn't
      cover the need (check `package.json` first)

## Deliverable
Working code changes across the files listed above, plus a short summary of what was
changed and any deviations from this spec (e.g. if actual function/file names differ
from what's assumed here).
