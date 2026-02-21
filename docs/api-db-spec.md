# TimeTrack API / DB Spec (MVP)

## 1. Entities

### students
- `id` (uuid, pk)
- `name` (text, not null)
- `nickname` (text, nullable)
- `memo` (text, nullable)
- `is_active` (boolean, default true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### lessons
- `id` (uuid, pk)
- `student_id` (uuid, fk -> students.id, not null)
- `start_at` (timestamptz, not null)
- `end_at` (timestamptz, not null)
- `status` (enum: `normal|canceled|makeup`, not null)
- `title` (text, nullable)
- `memo` (text, nullable)
- `origin_lesson_id` (uuid, nullable, fk -> lessons.id)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### pin_audit (optional but recommended)
- `id` (uuid, pk)
- `action` (text, not null)
- `success` (boolean, not null)
- `ip_hash` (text, nullable)
- `created_at` (timestamptz)

## 2. Indexes
- `students(is_active)`
- `students(name)`
- `students(nickname)`
- `lessons(student_id, start_at)`
- `lessons(start_at, end_at)`
- `lessons(status, start_at)`

## 3. API Endpoints (REST)

### Health
- `GET /api/health`

### Students
- `GET /api/students?query=&active=&filter=`
- `POST /api/students` (PIN required)
- `PATCH /api/students/:id` (PIN required)

### Lessons
- `GET /api/lessons?from=&to=&studentId=&status=`
- `POST /api/lessons` (PIN required)
- `PATCH /api/lessons/:id` (PIN required)
- `DELETE /api/lessons/:id` (PIN required)

### Summary
- `GET /api/summary?from=&to=`
- Returns canceled/makeup counts + list preview

### PIN
- `POST /api/pin/verify`
- Body: `{ "pin": "1234" }`
- Returns short-lived write token or signed session flag

## 4. Key Behaviors
- Date range is always explicit in API (`from`, `to`).
- Client resolves period mode (`week/month/year`) and sends date range.
- Week view slot granularity is 30 minutes.
- Canceled to makeup linkage:
- If makeup is created from canceled class, set `origin_lesson_id`.
- Summary strip data source:
- `status = canceled` count
- `status = makeup` count

## 5. Validation Rules
- `end_at` must be greater than `start_at`.
- `start_at` minute must be `00` or `30`.
- Lesson duration (`end_at - start_at`) must be 30~240 minutes in 30-minute increments.
- `student_id` must exist and be active for new lesson creation.
- PIN verification required for all write endpoints.
- Rate limit PIN verification attempts.
