# Story 7.1: Backup and Restore Workflow

## Summary

Implemented desktop backup/restore controls in Electron with startup-time restore apply, file validation, and rollback-safe behavior.

## Changes

- `electron/main.js`
  - Added Electron IPC handlers:
    - `desktop:create-backup`
    - `desktop:restore-backup`
    - `desktop:get-last-restore-result`
  - Added DB backup creation flow:
    - prompts save location
    - creates timestamped backup file name
    - runs checkpoint + SQLite backup copy
    - validates backup (`quick_check`, required tables)
  - Added restore staging flow:
    - prompts source file
    - validates selected backup file before staging
    - stores pending restore metadata
    - relaunches app for safe apply
  - Added startup restore apply:
    - detects pending restore
    - takes pre-restore rollback snapshot
    - applies staged DB and clears WAL/SHM
    - re-validates restored DB
    - rolls back on failure
    - persists restore result for renderer feedback

- `electron/preload.js`
  - Exposed desktop bridge methods:
    - `createBackup()`
    - `restoreBackup()`
    - `getLastRestoreResult()`

- `public/dashboard.html`
  - Added desktop tool buttons in header:
    - `백업`
    - `복원`

- `public/app.js`
  - Added desktop bridge detection.
  - Added backup/restore button handlers with user feedback.
  - Added restore result notification after login.
  - Hides desktop tools in non-Electron mode.

- `public/styles.css`
  - Added desktop tool button styles.
  - Updated header grid layout for new controls.

## Acceptance Criteria Mapping

1. Export action creates timestamped DB backup file.
   - Implemented via save dialog default path: `timetrack-backup-YYYYMMDD-HHMMSS.db`.
2. Restore action validates file before replacement.
   - Selected backup is validated before staging and again before/after startup apply.
3. User gets clear success/failure feedback with rollback-safe behavior.
   - Success/failure result persisted and shown in UI.
   - Restore apply takes rollback snapshot and reverts on failure.

## Validation

- Syntax checks passed:
  - `node --check electron/main.js`
  - `node --check electron/preload.js`
  - `node --check public/app.js`
- Native module alignment:
  - Ran `npm rebuild better-sqlite3` to match local Node runtime ABI.
- E2E passed:
  - `npm run test:e2e`
  - Result: 10 passed, 0 failed.
