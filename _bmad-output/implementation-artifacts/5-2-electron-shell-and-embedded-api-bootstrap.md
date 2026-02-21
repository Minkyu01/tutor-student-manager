# Story 5.2: Electron Shell and Embedded API Bootstrap

Status: done

## Story

As an operator,  
I want the existing TimeTrack UI to open as a desktop app,  
so that web deployment is no longer required for local operations.

## Acceptance Criteria

1. Electron main process starts and creates `BrowserWindow`.
2. Existing Express app starts as embedded local API/static server.
3. Desktop app loads the same scheduling UI via localhost loopback.

## Tasks / Subtasks

- [x] Electron main/preload 파일 생성
- [x] 패키지 엔트리(`main`)를 Electron 기준으로 전환
- [x] Electron 실행 스크립트 추가
- [x] 기존 Express 서버를 함수형 부트스트랩(`startServer`)으로 리팩터링

## Dev Notes

- Electron 부팅 파일: `electron/main.js`
- Preload 브리지: `electron/preload.js`
- 렌더러 로딩 경로: `http://127.0.0.1:<port>`

## Dev Agent Record

### Completion Notes List

- 기존 UI/API를 유지한 채 Electron에서 재사용 가능한 런타임 골격을 확보했다.

### File List

- `electron/main.js`
- `electron/preload.js`
- `src/server.js`
- `package.json`
