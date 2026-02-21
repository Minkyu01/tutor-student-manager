# Story 7.2: Migration Guardrails and Integrity Checks

## Summary

Added startup guardrails for schema compatibility and DB integrity, enforced integrity checks before write sessions, and surfaced recovery guidance for corruption/startup failures.

## Changes

- `src/db.js`
  - Added schema version constant (`SCHEMA_VERSION = 1`) and schema compatibility verification.
  - Added compatibility failures for:
    - unsupported newer DB schema version
    - missing required tables/columns
  - Added integrity check (`quick_check`) at startup.
  - Added `db.ensureWriteSessionHealthy()` with throttled checks before write sessions.
  - Added structured recovery steps attached to guard errors.

- `src/server.js`
  - `requireWriteAuth` now runs `db.ensureWriteSessionHealthy()` before permitting any write.
  - On integrity failure, returns `503` with:
    - error code
    - recovery steps
  - `/api/health` now reports:
    - schema version
    - write-session integrity state

- `electron/main.js`
  - Added startup failure recovery window instead of immediate quit.
  - Displays DB path, log path, failure message, and actionable recovery steps.

- `public/app.js`
  - API error handling now includes server-provided `recoverySteps` in user-visible messages.

## Acceptance Criteria Mapping

1. Startup verifies schema compatibility.
   - Implemented in `src/db.js` via `verifySchemaCompatibility()`.
2. Integrity check runs before write session starts.
   - Implemented in `src/server.js` inside `requireWriteAuth`.
3. Recovery guidance is presented when corruption is detected.
   - Implemented via:
     - startup recovery guidance window in Electron
     - write-path `503` responses with `recoverySteps` shown in UI alerts

## Validation

- Syntax checks passed:
  - `node --check src/db.js`
  - `node --check src/server.js`
  - `node --check electron/main.js`
  - `node --check public/app.js`
- E2E passed:
  - `npm run test:e2e`
  - Result: 10 passed, 0 failed.
