# TimeTrack Electron Release Runbook (macOS + Windows + GitHub Releases)

## 1. Prerequisites

1. Node.js 20.x and npm installed
2. Project dependencies installed (`npm install`)
3. GitHub repository configured: `Minkyu01/TimeTrack`
4. GitHub Actions enabled for the repository
5. Optional for trust:
   - macOS Developer ID certificate
   - Windows code signing certificate

## 2. Local Build Commands

1. Rebuild native modules for Electron runtime:
   - `npm run rebuild:electron`
2. Smoke package output directory:
   - `npm run dist:dir`
3. Build macOS artifacts:
   - `npm run dist:mac`
4. Build Windows artifacts:
   - `npm run dist:win`

## 3. Release Commands (Publish to GitHub Releases)

1. macOS publish:
   - `npm run release:mac`
2. Windows publish:
   - `npm run release:win`

`release:*` scripts require `GH_TOKEN` (or GitHub Actions `GITHUB_TOKEN`) with `repo` scope.

## 4. GitHub Actions Release Flow

Workflow file: `.github/workflows/release.yml`

1. Push semver tag:
   - `git tag v1.0.1`
   - `git push origin v1.0.1`
2. Workflow builds on `macos-latest` and `windows-latest`
3. Artifacts are uploaded to GitHub Releases automatically

## 5. Output Locations

- Build output root: `dist-electron/`
- macOS:
  - `dist-electron/TimeTrack-<version>-arm64.dmg`
  - `dist-electron/TimeTrack-<version>-arm64-mac.zip`
- Windows:
  - `dist-electron/TimeTrack Setup <version>.exe` (NSIS)
  - `dist-electron/TimeTrack-<version>-win.zip`

## 6. Auto Update Behavior

1. Auto update is enabled for packaged desktop builds on macOS/Windows.
2. On app startup, update check runs automatically.
3. In desktop header, users can click `업데이트 확인` for manual check.
4. If update is downloaded, user can restart immediately to apply.
5. In development/non-packaged environments, auto update is disabled safely.

## 7. Validation Checklist (Per Release)

1. `npm run test:e2e` passes before tagging
2. App launches on macOS and Windows packaged builds
3. Core CRUD + PIN + backup/restore flows are verified
4. Auto update check triggers and reports expected status
5. Downloaded update can be applied by restart

## 8. Rollback / Failure Handling

1. If release upload fails in CI:
   - Re-run failed GitHub Actions job
   - Or publish with local `npm run release:*` using `GH_TOKEN`
2. If faulty release is published:
   - Publish next patch version (e.g. `v1.0.2`)
   - Do not overwrite existing release assets
3. If updater errors occur:
   - Verify GitHub Release assets include update metadata files
   - Verify app version increments and semver ordering

