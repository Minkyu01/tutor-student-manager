# Story 7.3: Desktop Regression Test Coverage

## Summary

Completed regression coverage for core flows and added CI-like local DB path verification, plus an expanded packaged-build manual QA checklist.

## Changes

- `scripts/desktop-regression-smoke.js`
  - Added automated verification for local DB override behavior (`TIMETRACK_DATA_DIR`).
  - Checks that:
    - `db.dataDir` matches override path
    - `db.dbPath` resolves under override path
    - `schemaVersion` is present and expected
    - SQLite file is created in the override location

- `package.json`
  - Added `test:desktop-db-path` script for CI-like DB-path validation.
  - Kept `test:e2e` as the core regression smoke command for PIN/student/lesson flows.

- `docs/electron-release-runbook.md`
  - Added automation commands section for repeatable smoke validation.
  - Expanded packaged-build manual QA checklist.

- `docs/electron-migration-plan.md`
  - Updated implementation status to reflect completion of stories 7.1–7.3.

## Acceptance Criteria Mapping

1. Core student/lesson/PIN flows are covered by smoke tests.
   - Covered by `npm run test:e2e` (Playwright suite).
2. Local DB path behavior is verified in CI-like scripts.
   - Covered by `npm run test:desktop-db-path`.
3. Manual QA checklist exists for packaged build validation.
   - Documented in `docs/electron-release-runbook.md` under manual QA checklist.

## Validation

- `npm run test:e2e`
  - Result: 10 passed, 0 failed.
- `npm run test:desktop-db-path`
  - Result: local DB override checks passed.
