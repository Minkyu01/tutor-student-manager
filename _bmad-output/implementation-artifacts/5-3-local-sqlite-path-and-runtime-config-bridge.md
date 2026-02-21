# Story 5.3: Local SQLite Path and Runtime Config Bridge

Status: done

## Story

As an operator,  
I want DB files stored in device-local app data,  
so that each user keeps isolated local data.

## Acceptance Criteria

1. DB directory is configurable through runtime env (`TIMETRACK_DATA_DIR`).
2. Electron runtime sets DB path to app-specific user data directory.
3. Existing schema bootstrap/migrations continue to run in the new path.

## Tasks / Subtasks

- [x] DB 모듈에서 데이터 디렉터리 환경변수 경로 지원
- [x] Electron 부팅 시 `TIMETRACK_DATA_DIR`를 `app.getPath("userData")/data`로 고정
- [x] `/api/health`에 DB 경로/데이터 디렉터리 진단값 노출
- [x] 데이터 디렉터리 write 가능 여부 점검 로직 추가

## Dev Notes

- DB 경로 설정: `src/db.js`
- Electron 런타임 경로 설정/검증: `electron/main.js`
- health 진단: `src/server.js`

## Dev Agent Record

### Completion Notes List

- 앱 시작 시 로컬 데이터 디렉터리 write-check를 수행하고, 임베디드 서버가 해당 경로의 SQLite를 사용하도록 연결했다.

### File List

- `src/db.js`
- `src/server.js`
- `electron/main.js`
