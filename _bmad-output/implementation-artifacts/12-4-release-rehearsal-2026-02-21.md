# Epic 12 Release Rehearsal Record (Dry Run)

Date: 2026-02-21  
Scope: Release trust/signing guardrails + local release pipeline preflight  
Operator: Codex session

## Goal

- Epic 12.4 운영 가드레일 기준으로 릴리스 전 검증 절차를 실제 실행하고 결과를 기록한다.

## Executed Commands and Results

1. Core regression
   - Command: `npm run test:e2e`
   - Result: passed (`13 passed`)

2. Packaging smoke
   - Command: `npm run dist:dir`
   - Result: passed
   - Notes:
     - `dist-electron/mac-arm64/TimeTrack.app` 생성 확인
     - 코드서명 인증서 미구성으로 unsigned 경고 출력 (예상된 동작)

3. Runtime syntax sanity
   - Command: `node --check electron/main.js`
   - Result: passed
   - Command: `node --check electron/preload.js`
   - Result: passed
   - Command: `node --check public/app.js`
   - Result: passed

4. Integrity sample (existing macOS artifacts)
   - Command: `shasum -a 256 dist-electron/TimeTrack-1.0.0-arm64.dmg dist-electron/TimeTrack-1.0.0-arm64-mac.zip`
   - Result:
     - `9f2ebadbecee57663614cc6bcf7f1f87feb086f38bf320aacbe8610c06e6b76d  dist-electron/TimeTrack-1.0.0-arm64.dmg`
     - `5b493137a0705447c45dfae9d6574e5eaa142528266470713cc0e62398666315  dist-electron/TimeTrack-1.0.0-arm64-mac.zip`

## Artifact Snapshot

- `dist-electron/TimeTrack-1.0.0-arm64.dmg`
- `dist-electron/TimeTrack-1.0.0-arm64-mac.zip`
- `dist-electron/TimeTrack-1.0.0-arm64.dmg.blockmap`
- `dist-electron/TimeTrack-1.0.0-arm64-mac.zip.blockmap`
- `dist-electron/mac-arm64/TimeTrack.app`

## Risks and Follow-ups

1. Remote GitHub release publish and auto-update end-to-end verification still depends on:
   - repository remote accessibility
   - tag push and Actions execution
2. Windows installer artifact validation must be confirmed in `windows-latest` CI run.
3. Signing trust (Gatekeeper/SmartScreen) requires production-grade certificate secrets in CI.

## Outcome

- Local release preflight and packaging smoke are green.
- Operational guardrails, signing requirements, and rollback guidance are now documented.
- Epic 12.4 is ready for review, pending full remote release rehearsal on GitHub Actions.
