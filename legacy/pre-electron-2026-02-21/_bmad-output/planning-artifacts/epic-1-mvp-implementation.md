# TimeTrack - Epic Breakdown (Initialized from Existing Docs and Current Progress)

## Overview

This epic/story set was initialized from:
- `docs/mvp-spec.md`
- `docs/api-db-spec.md`
- `docs/implementation-plan.md`
- Current implementation in `src/`, `public/`, and `tests/e2e/`

## Epic List

1. Epic 1: MVP Foundation APIs and Data
2. Epic 2: MVP Dashboard and Scheduling UX
3. Epic 3: Stabilization and Test Reliability

## Epic 1: MVP Foundation APIs and Data

Deliver a stable backend foundation for student/lesson scheduling and PIN-protected write operations.

### Story 1.1: App Scaffold and Database Bootstrap
As an operator,
I want the app server and DB schema initialized,
So that I can run TimeTrack consistently.

**Acceptance Criteria:**

**Given** the service starts
**When** DB initialization runs
**Then** tables and indexes for students, lessons, pin_audit exist.

### Story 1.2: Student Query and CRUD API
As an operator,
I want to search/filter and manage students,
So that I can maintain active/inactive roster data.

**Acceptance Criteria:**

**Given** student records exist
**When** I call student list and write endpoints
**Then** I can query by search/active/filter and perform create/update/delete with write auth.

### Story 1.3: Lesson CRUD and Summary API
As an operator,
I want to manage lessons and read summary counts,
So that canceled/makeup operations are trackable by period.

**Acceptance Criteria:**

**Given** lessons exist in a selected period
**When** I call lesson and summary endpoints
**Then** CRUD operations and canceled/makeup aggregation return correct results.

### Story 1.4: PIN Verify and Write Token Guard
As an operator,
I want PIN-gated write access with lockout protection,
So that unauthorized writes are blocked.

**Acceptance Criteria:**

**Given** write endpoints are called
**When** request lacks valid write token or PIN lockout is active
**Then** write is rejected with proper error status.

## Epic 2: MVP Dashboard and Scheduling UX

Deliver operational UI for weekly scheduling, student management, and period-based summary visibility.

### Story 2.1: Header Navigation and Period Mode Switching
As an operator,
I want week/month/year navigation controls,
So that I can view schedules by period.

**Acceptance Criteria:**

**Given** dashboard is loaded
**When** I move previous/next or switch mode
**Then** period label and displayed data refresh correctly.

### Story 2.2: Student Panel Search Filter and Status Badges
As an operator,
I want search/filter controls and canceled/makeup badges,
So that I can identify students needing action.

**Acceptance Criteria:**

**Given** students and lessons exist
**When** I apply search/filter pills
**Then** the list reflects filter state and status badge counts.

### Story 2.3: Week Timetable Slot Interaction and Lesson Modal
As an operator,
I want to click timetable slots/cards to create or edit lessons,
So that scheduling is fast.

**Acceptance Criteria:**

**Given** week grid is shown
**When** I click a slot or an event card
**Then** lesson modal opens with appropriate pre-filled values.

### Story 2.4: Summary Strip and Expandable Canceled Makeup List
As an operator,
I want period summary totals and details,
So that I can monitor canceled/makeup volume quickly.

**Acceptance Criteria:**

**Given** canceled/makeup lessons are in range
**When** summary strip is shown and expanded
**Then** count labels and detail list are accurate.

### Story 2.5: Student Modal Create Update Delete and Active Toggle
As an operator,
I want to manage student details and status in a modal,
So that roster maintenance stays in one flow.

**Acceptance Criteria:**

**Given** student modal is opened
**When** I save updates or delete
**Then** list and related data refresh with confirmation feedback.

## Epic 3: Stabilization and Test Reliability

Close remaining UX/spec mismatches and stabilize automated tests for repeatable implementation workflows.

### Story 3.1: Lesson Edit Delete Flow Validation
As an operator,
I want lesson edits/deletes to be reliable in UI and API,
So that schedule updates are trustworthy.

**Acceptance Criteria:**

**Given** an existing lesson
**When** I edit or delete it from modal
**Then** persisted data and UI feedback are consistent.

### Story 3.2: End-to-End Coverage for Core MVP Journeys
As a maintainer,
I want E2E tests for core workflows,
So that regressions are detected automatically.

**Acceptance Criteria:**

**Given** Playwright suite is executed
**When** core MVP user journeys run
**Then** major create/edit/filter/summary/PIN flows are verified.

### Story 3.3: Lesson Modal Title Field and E2E Selector Alignment
As a maintainer,
I want lesson title input behavior aligned with spec and tests,
So that lesson create/edit scenarios no longer fail from hidden-field targeting.

**Acceptance Criteria:**

**Given** lesson modal supports optional title per MVP spec
**When** E2E interacts with title field
**Then** input is visible/editable and tests for create/edit lesson pass.

