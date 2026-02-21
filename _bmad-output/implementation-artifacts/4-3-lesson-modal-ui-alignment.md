# Story 4.3: Lesson Modal UI Alignment

Status: done

## Story

As an academy operator,  
I want the lesson add/edit modal to match the design,  
so that class scheduling flow is visually consistent.

## Acceptance Criteria

1. 수업 모달 헤더, 날짜/시간 입력, 상태 토글, 메모/액션 영역이 시안과 유사하다.
2. 날짜/시간 입력 아이콘 및 상태 버튼 active 스타일이 시안과 유사하다.
3. 데스크톱/모바일에서 모달 가독성이 유지된다.

## Tasks / Subtasks

- [x] 수업 모달 컨테이너 크기/라운드/타이포를 시안 비율에 맞춰 조정
- [x] 날짜/시간 필드에 우측 아이콘 래퍼 추가
- [x] 상태 토글/저장 버튼/하단 액션 스타일 정렬

## Dev Notes

- 날짜/시간 입력 아이콘 표시를 위해 `public/index.html`에 `input-icon-wrap` 마크업 추가.
- 수업 모달 스타일은 `lesson-modal*` 계열 CSS를 시안 중심으로 재정의.

## Dev Agent Record

### Completion Notes List

- 수업 모달을 시안 스타일로 변경하고 아이콘형 입력 UI를 적용했다.

### File List

- `public/index.html`
- `public/styles.css`

