# Story 4.4: Additional Dashboard Entry File Alignment

Status: done

## Story

As an academy operator,  
I want an additional dashboard file with the same updated UI,  
so that dashboard entry can be accessed from more than one static path.

## Acceptance Criteria

1. `public/dashboard.html` 파일이 추가된다.
2. `public/dashboard.html`은 최신 `index` UI 변경사항을 동일하게 반영한다.
3. `/dashboard.html` 경로로 접근 시 동일 UI가 표시된다.

## Tasks / Subtasks

- [x] `public/index.html` 기반으로 `public/dashboard.html` 생성
- [x] 최신 시안 반영 마크업이 포함되었는지 확인
- [x] BMAD sprint status에 스토리 반영

## Dev Notes

- 정적 파일 서빙 구조(Express `static`)에서 `dashboard.html`은 별도 라우팅 수정 없이 접근 가능.

## Dev Agent Record

### Completion Notes List

- 추가 대시보드 진입 파일을 생성하고 기존 UI 변경사항을 동일 반영했다.

### File List

- `public/dashboard.html`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

