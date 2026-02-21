# TimeTrack MVP Specification

## 1. Goal

- Login-free web scheduler for academy operations.
- Staff manage students and class time slots.
- Clearly separate and track normal / canceled / makeup sessions.

## 2. MVP Scope (Must)

- Header bar
- Title (academy/class name)
- `Today` button
- Previous/Next period navigation
- Current period label (e.g. `2026년 2월 3주`)
- Period toggle: `Week / Month / Year`
- Left student panel
- Search by name/nickname
- Filters: `All`, `Has Canceled`, `Has Makeup`, `Active`, `Inactive`
- Student badges: canceled count, makeup count
- Right timetable
- Week timetable displays in 30-minute slots (`09:00`, `09:30`, ...)
- Slot click opens create/edit modal
- Lesson fields: student, date, start time, duration, status, optional title, optional memo
- Status: `normal`, `canceled`, `makeup`
- Canceled/Makeup summary strip above timetable
- Example: `취소 3 | 보강 2` and click to expand list
- Student management modal (create/update, active/inactive)
- Basic UX states: empty, loading, error, confirmation dialog, save toast
- PIN lock for write actions (create/update/delete)

## 3. Deferred (After MVP)

- Drag and drop for rescheduling
- Advanced export formats (CSV/PDF)
- Multiple month view modes at same time
- Year-view visual optimization

## 4. Core Rules

- Week starts on Monday.
- Timezone: `Asia/Seoul`.
- Navigation unit follows selected period:
- Week mode: ±1 week
- Month mode: ±1 month
- Year mode: ±1 year
- Student badge counts are computed for current visible period.
- Lesson start time must align to `:00` or `:30`.
- Lesson duration is configurable from 30 minutes to 4 hours in 30-minute increments.

## 5. Acceptance Criteria

1. Switching period mode keeps current filters intact.
2. User can create/update a lesson in <= 2 main interactions after slot click.
3. Summary strip click opens canceled/makeup item list for current period.
4. Dangerous actions (delete/cancel) require confirmation dialog.
5. PIN is required for write actions; invalid PIN attempts are rate-limited.
6. Lesson cards match 30-minute grid scale and configured duration.

## 6. Data Status Model

- `normal`: planned or completed as scheduled
- `canceled`: class canceled and not yet remapped
- `makeup`: makeup class scheduled/processed

## 7. Secㄹurity Baseline (No Login)

- Read access can stay open in internal environment.
- Write actions require 4-digit PIN verification.
- PIN failure policy for MVP:
- 5 consecutive failures => 1 minute lockout
