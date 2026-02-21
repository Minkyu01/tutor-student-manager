# Story 6.1: Window Lifecycle and Crash-safe Shutdown

Status: done

## Story

As a user,  
I want stable startup/shutdown behavior,  
so that data corruption risk is minimized.

## Acceptance Criteria

1. App handles macOS activate/close lifecycle consistently.
2. Embedded API server is terminated cleanly on app quit.
3. Startup errors are logged with operator-readable context.

## Tasks / Subtasks

- [x] 단일 인스턴스 락(`app.requestSingleInstanceLock`) 적용
- [x] second-instance 진입 시 기존 창 focus 복구
- [x] before-quit에서 임베디드 서버 graceful shutdown 적용(타임아웃 포함)
- [x] startup/에러/렌더러 이상 상태 로그를 `startup.log`로 기록

## Dev Notes

- Electron lifecycle 처리: `electron/main.js`
- shutdown 실패 시 타임아웃으로 앱 종료 블로킹 방지

## Dev Agent Record

### Completion Notes List

- 종료 이벤트에서 서버 close 완료를 보장하도록 처리하고, 시작/오류 진단 로그를 남기도록 했다.

### File List

- `electron/main.js`
