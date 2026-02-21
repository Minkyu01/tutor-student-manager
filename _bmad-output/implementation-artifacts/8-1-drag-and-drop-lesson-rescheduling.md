# Story 8.1: Drag-and-drop Lesson Rescheduling in Weekly Timetable

Status: done

## Story

As a manager,  
I want to drag a lesson card to another timetable slot,  
so that I can quickly reschedule lesson times without reopening the edit modal.

## Acceptance Criteria

1. Week mode timetable cards are draggable.
2. Dropping a card on another hour slot updates lesson `start_at`/`end_at` via API.
3. Lesson duration is preserved after move.
4. Existing click-to-open lesson edit modal behavior remains functional.
5. E2E regression covers drag-and-drop rescheduling.

## Tasks / Subtasks

- [x] Add draggable lesson card behavior in `public/app.js`.
- [x] Add week-cell drop handlers with optimistic UI guard and API patch.
- [x] Preserve lesson duration when recalculating dropped timeslot end time.
- [x] Add drag/drop visual feedback styles in `public/styles.css`.
- [x] Add Playwright E2E test for lesson drag-and-drop move.

## Dev Notes

- Drop target is aligned to timetable slot granularity (`HH:00`).
- Move operation patches only `start_at` and `end_at`; server-side merge logic preserves other lesson fields.
- Click suppression window prevents unintended modal opening right after drag end/drop.

## Dev Agent Record

### Completion Notes List

- Implemented drag-to-move for week timetable cards with drop highlight and dragging states.
- Added robust handler for same-slot no-op and API error handling.
- Verified full E2E suite after rebuilding `better-sqlite3` for current Node ABI.

### File List

- `public/app.js`
- `public/styles.css`
- `tests/e2e/app.spec.js`
