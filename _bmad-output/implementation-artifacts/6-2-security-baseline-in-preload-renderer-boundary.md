# Story 6.2: Security Baseline in Preload/Renderer Boundary

Status: done

## Story

As a maintainer,  
I want renderer isolation defaults kept strict,  
so that desktop attack surface remains limited.

## Acceptance Criteria

1. `contextIsolation=true`, `nodeIntegration=false` are enforced.
2. Required renderer capabilities are exposed via minimal preload bridge only.
3. No direct Node.js primitive access from renderer app code.

## Tasks / Subtasks

- [x] BrowserWindow webPreferences 보안 기본값 유지 검증
- [x] preload 브리지 최소화 및 immutable 객체 노출
- [x] 외부 네비게이션/새 창 차단
- [x] webview attachment 차단
- [x] 정적 HTML 엔트리에 CSP 추가

## Dev Notes

- Electron 보안 경계 처리: `electron/main.js`, `electron/preload.js`
- CSP 적용 파일: `public/index.html`, `public/dashboard.html`

## Dev Agent Record

### Completion Notes List

- 로컬 앱 오리진 외부로의 이동 경로를 차단하고 preload 노출 표면을 축소했다.

### File List

- `electron/main.js`
- `electron/preload.js`
- `public/index.html`
- `public/dashboard.html`
