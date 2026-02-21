# Story 5.1: Legacy Snapshot and Workspace Preservation

Status: done

## Story

As a maintainer,  
I want all pre-migration files preserved in one location,  
so that migration risk is reversible.

## Acceptance Criteria

1. Current workspace snapshot is stored under a single `legacy/` path.
2. Snapshot includes source, docs, tests, and build/runtime configs.
3. Migration can continue without modifying snapshot contents.

## Tasks / Subtasks

- [x] `legacy/pre-electron-2026-02-21/` 스냅샷 디렉터리 생성
- [x] 기존 워크스페이스 전체를 `legacy/` 경로로 복제
- [x] 스냅샷 디렉터리 구조 및 용량 확인

## Dev Notes

- 보존 경로: `legacy/pre-electron-2026-02-21/`
- 스냅샷 크기: 약 40MB
- 스냅샷은 마이그레이션 진행 중 변경하지 않고 참조 전용으로 유지

## Dev Agent Record

### Completion Notes List

- Electron 전환 전 상태를 전체 복제하여 단일 보존 위치를 확보했다.

### File List

- `legacy/pre-electron-2026-02-21/`
