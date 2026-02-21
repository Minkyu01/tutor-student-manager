# Story 4.1: Dashboard Layout and Visual Token Alignment

Status: done

## Story

As an academy operator,  
I want the main dashboard to follow the design screenshot layout and visual rhythm,  
so that daily scheduling is familiar and fast.

## Acceptance Criteria

1. Sidebar, header, summary strip, week grid가 시안 비율/톤과 유사하게 정렬된다.
2. 학생 카드 선택/배지/아바타 상태가 시안 스타일과 유사하다.
3. 주간 타임테이블의 카드/현재시간 라인/요일 컬러가 시안 톤과 유사하다.

## Tasks / Subtasks

- [x] 대시보드 전역 토큰/컬러/스페이싱 재정의
- [x] 사이드바(브랜드/검색/필터/학생카드/추가버튼) 스타일 정렬
- [x] 헤더/요약스트립/주간그리드/이벤트카드 스타일 정렬

## Dev Notes

- 주요 스타일 재구성은 `public/styles.css`에서 수행.
- 기존 DOM/JS 동작을 유지하기 위해 클래스명은 기존 구조를 보존.

## Dev Agent Record

### Completion Notes List

- 디자인 시안 톤에 맞게 레이아웃, 색상, 컴포넌트 시각 요소를 조정했다.

### File List

- `public/styles.css`

