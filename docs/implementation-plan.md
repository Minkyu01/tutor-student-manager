# Implementation Plan (MVP)

## Phase 1. Base setup
1. Initialize web app scaffold (frontend + API server).
2. Add DB schema for `students`, `lessons`.
3. Add timezone/date utility (`Asia/Seoul`, week starts Monday).

## Phase 2. Core data APIs
1. Student list/search/filter APIs.
2. Lesson CRUD APIs.
3. Summary API for canceled/makeup strip.
4. PIN verification + write protection middleware.

## Phase 3. Core UI
1. Header + period navigation.
2. Left student panel (search/filter/badges).
3. Right timetable with slot interaction modal.
4. Canceled/Makeup summary strip + expandable list.

## Phase 4. Operational UX
1. Student create/edit modal.
2. Empty/loading/error/confirm/toast states.
3. Basic keyboard/focus accessibility for form and modal.

## Phase 5. Stabilization
1. Validate acceptance criteria in `docs/mvp-spec.md`.
2. Add smoke tests for main flow:
- create student
- create lesson
- change status to canceled/makeup
- summary count reflects change

