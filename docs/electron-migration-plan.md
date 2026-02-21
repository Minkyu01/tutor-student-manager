# TimeTrack Electron Migration Plan

## Goal

Convert TimeTrack from web-server deployment model to an Electron desktop app model where SQLite stays on each user's local machine.

## Current Baseline (2026-02-21)

1. Pre-migration snapshot preserved at `legacy/pre-electron-2026-02-21/`
2. Electron runtime scaffold added (`electron/main.js`, `electron/preload.js`)
3. Existing Express server refactored to reusable bootstrap API (`src/server.js`)
4. DB path supports runtime override via `TIMETRACK_DATA_DIR` (`src/db.js`)
5. Electron startup now verifies local data-dir writability and records startup diagnostics to `startup.log`
6. Single-instance lock + graceful embedded-server shutdown are applied
7. Renderer security baseline applied (minimal preload bridge, external navigation/webview blocking, CSP)
8. macOS packaging pipeline verified (`dist:dir`, `dist:mac`) and release runbook documented

## Architecture (Incremental)

1. Renderer: existing `public/` UI loaded in Electron `BrowserWindow`
2. Embedded backend: existing `src/server.js` started in Electron main process
3. DB: existing SQLite schema/bootstrap from `src/db.js`
4. Storage location: Electron user data directory (device local)

## Run Commands

1. Web legacy mode: `npm run dev`
2. Electron mode: `npm run dev:electron`

## Latest Implementation Status

1. Story 7.1 completed: backup/restore UX and safe file operations
2. Story 7.2 completed: startup integrity guardrails and recovery guidance
3. Story 7.3 completed: regression smoke automation and packaged-build QA checklist

## Notes

- Electron runtime uses local loopback (`127.0.0.1`) and does not require external hosting.
- Existing web MVP behavior remains available for regression comparison during migration.
