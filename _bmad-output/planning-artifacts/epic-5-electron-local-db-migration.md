# TimeTrack - Epic 5~7: Electron Local DB Migration Plan

## Overview

This migration plan resets delivery around a desktop-first architecture while preserving the completed web MVP as a legacy snapshot.

- Legacy snapshot: `legacy/pre-electron-2026-02-21/`
- Current target: Electron desktop runtime + local SQLite in user device storage
- Migration style: BMAD incremental epic/story execution

## Epic List

1. Epic 5: Migration Foundation and Electron Runtime Bootstrap
2. Epic 6: Desktop Hardening and Release Packaging
3. Epic 7: Data Safety, Backup/Restore, and QA Stabilization

## Epic 5: Migration Foundation and Electron Runtime Bootstrap

Build a non-breaking baseline where existing UI/API logic runs inside Electron and persists data locally per user device.

### Story 5.1: Legacy Snapshot and Workspace Preservation
As a maintainer,  
I want all pre-migration files preserved in one location,  
so that migration risk is reversible.

**Acceptance Criteria:**

1. Current workspace snapshot is stored under a single `legacy/` path.
2. Snapshot includes source, docs, tests, and build/runtime configs.
3. Migration can continue without modifying snapshot contents.

### Story 5.2: Electron Shell and Embedded API Bootstrap
As an operator,  
I want the existing TimeTrack UI to open as a desktop app,  
so that web deployment is no longer required for local operations.

**Acceptance Criteria:**

1. Electron main process starts and creates `BrowserWindow`.
2. Existing Express app starts as embedded local API/static server.
3. Desktop app loads the same scheduling UI via localhost loopback.

### Story 5.3: Local SQLite Path and Runtime Config Bridge
As an operator,  
I want DB files stored in device-local app data,  
so that each user keeps isolated local data.

**Acceptance Criteria:**

1. DB directory is configurable through runtime env (`TIMETRACK_DATA_DIR`).
2. Electron runtime sets DB path to app-specific user data directory.
3. Existing schema bootstrap/migrations continue to run in the new path.

## Epic 6: Desktop Hardening and Release Packaging

Prepare production-grade desktop behavior and distributable artifacts.

### Story 6.1: Window Lifecycle and Crash-safe Shutdown
As a user,  
I want stable startup/shutdown behavior,  
so that data corruption risk is minimized.

**Acceptance Criteria:**

1. App handles macOS activate/close lifecycle consistently.
2. Embedded API server is terminated cleanly on app quit.
3. Startup errors are logged with operator-readable context.

### Story 6.2: Security Baseline in Preload/Renderer Boundary
As a maintainer,  
I want renderer isolation defaults kept strict,  
so that desktop attack surface remains limited.

**Acceptance Criteria:**

1. `contextIsolation=true`, `nodeIntegration=false` are enforced.
2. Required renderer capabilities are exposed via minimal preload bridge only.
3. No direct Node.js primitive access from renderer app code.

### Story 6.3: Packaging Pipeline for macOS Distribution
As an operator,  
I want an installable app package,  
so that non-developer users can run TimeTrack locally.

**Acceptance Criteria:**

1. Packaging config produces macOS distributable artifact(s).
2. Runtime assets (`public`, server code, DB bootstrap) are bundled correctly.
3. Release build runbook is documented.

## Epic 7: Data Safety, Backup/Restore, and QA Stabilization

Close operational gaps for long-term local-first usage.

### Story 7.1: Backup and Restore Workflow
As an operator,  
I want manual backup/restore controls,  
so that local data loss is recoverable.

**Acceptance Criteria:**

1. Export action creates timestamped DB backup file.
2. Restore action validates file before replacement.
3. User gets clear success/failure feedback with rollback-safe behavior.

### Story 7.2: Migration Guardrails and Integrity Checks
As a maintainer,  
I want startup checks for schema/version/integrity,  
so that broken local DB state is detected early.

**Acceptance Criteria:**

1. Startup verifies schema compatibility.
2. Integrity check runs before write session starts.
3. Recovery guidance is presented when corruption is detected.

### Story 7.3: Desktop Regression Test Coverage
As a maintainer,  
I want repeatable smoke/regression checks for Electron runtime,  
so that release confidence remains high.

**Acceptance Criteria:**

1. Core student/lesson/PIN flows are covered by smoke tests.
2. Local DB path behavior is verified in CI-like scripts.
3. Manual QA checklist exists for packaged build validation.

## Execution Sequence (BMAD)

1. Complete Epic 5 and keep web MVP behavior parity.
2. Move to Epic 6 for security/lifecycle/packaging readiness.
3. Finalize Epic 7 for data safety and regression confidence before broad rollout.
