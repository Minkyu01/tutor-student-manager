# Story 6.3: Packaging Pipeline for macOS Distribution

Status: done

## Story

As an operator,  
I want an installable app package,  
so that non-developer users can run TimeTrack locally.

## Acceptance Criteria

1. Packaging config produces macOS distributable artifact(s).
2. Runtime assets (`public`, server code, DB bootstrap) are bundled correctly.
3. Release build runbook is documented.

## Tasks / Subtasks

- [x] `electron-builder` 설정을 `package.json`에 추가
- [x] native 모듈 재빌드 스크립트(`rebuild:electron`) 추가
- [x] 배포 스크립트(`dist:dir`, `dist:mac`) 추가
- [x] 실제 `dmg`/`zip` 아티팩트 생성 검증
- [x] 릴리스 런북 문서 작성

## Dev Notes

- 패키징 설정/스크립트: `package.json`
- 릴리스 가이드: `docs/electron-release-runbook.md`
- 빌드 출력 경로: `dist-electron/`

## Dev Agent Record

### Completion Notes List

- `npm run dist:mac` 실행으로 `arm64` 대상 `dmg`/`zip` 산출물 생성을 확인했다.
- 현재 환경에서는 유효한 Developer ID 인증서가 없어 code signing은 스킵되었다.

### File List

- `package.json`
- `package-lock.json`
- `docs/electron-release-runbook.md`
- `dist-electron/`
