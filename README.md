# TutorFlow

TutorFlow is a desktop-first tutor/student scheduling app for academy operations.

## Overview

TutorFlow helps operators manage:

- students (active/inactive, search, memo)
- lessons on a 30-minute timetable grid
- lesson status (`normal`, `canceled`, `makeup`)
- period-based summary (canceled/makeup counts)
- PIN-protected write actions
- backup/restore and desktop update flow (Electron)

## Tech Stack

- Electron + Express + SQLite (`better-sqlite3`)
- Vanilla HTML/CSS/JS frontend
- Playwright end-to-end tests

## Project Structure

- `electron/`: Electron main/preload process
- `src/`: API server and DB layer
- `public/`: frontend UI
- `tests/e2e/`: Playwright scenarios
- `docs/`: specs and release runbooks
- `_bmad-output/`: BMAD planning and implementation artifacts

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run as web app (API + static)

```bash
npm run dev
```

### 3. Run as desktop app (Electron)

```bash
npm run dev:electron
```

## Test

```bash
npm run test:e2e
```

## Desktop Build and Release

```bash
npm run dist:mac
npm run dist:win
npm run release:mac
npm run release:win
```

For release trust/signing and operational checklist, see:

- `docs/electron-release-runbook.md`

## Notes

- Package and desktop product identifiers are aligned to **TutorFlow**.
- Release target repository is `Minkyu01/tutor-student-manager`.
