# Story 4.2: Student Modal UI Alignment

Status: done

## Story

As an academy operator,  
I want the student add/edit modal to match the design,  
so that data entry UI is consistent.

## Acceptance Criteria

1. 학생 모달 헤더, 입력 필드, 스위치, 액션 버튼 스타일이 시안과 유사하다.
2. 배경 오버레이와 모달 라운드/그림자가 시안 톤과 유사하다.
3. 모바일 폭에서도 모달 레이아웃이 깨지지 않는다.

## Tasks / Subtasks

- [x] 학생 모달 헤더 타이포/아이콘/닫기버튼 스타일 반영
- [x] 입력 필드/텍스트영역/토글 스위치 스타일 반영
- [x] 푸터 액션(취소/저장/삭제) 시각 정렬 및 반응형 보강

## Dev Notes

- 모달 제목 아이콘 표현을 위해 `public/index.html`의 학생 모달 헤더 마크업을 업데이트.
- 스타일은 공통 모달 규칙 + 학생 모달 전용 규칙으로 분리.

## Dev Agent Record

### Completion Notes List

- 학생 모달 UI를 시안 중심 톤으로 변경하고 모바일 반응형까지 반영했다.

### File List

- `public/index.html`
- `public/styles.css`

