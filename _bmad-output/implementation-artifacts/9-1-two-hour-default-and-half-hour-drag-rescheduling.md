# Story 9.1: Two-hour Default and Half-hour Drag Rescheduling

Status: done

## Story

As an academy operator,  
I want newly created lessons to default to 2 hours and support 30-minute drag repositioning,  
so that weekly schedule adjustments match real operation patterns.

## Acceptance Criteria

1. 빈 슬롯에서 수업 생성 시 기본 길이는 2시간이다.
2. 주간 타임테이블 카드 드래그 드롭 시 00분/30분 단위로 시작 시간이 결정된다.
3. 드롭 후 기존 수업 길이는 유지된다.
4. 기존 클릭 편집/삭제 흐름은 유지된다.
5. E2E가 기본 2시간 생성 및 30분 단위 드래그 이동을 검증한다.

## Tasks / Subtasks

- [x] 기본 수업 길이 상태값을 120분으로 변경.
- [x] 빈 슬롯 클릭으로 열리는 신규 수업 모달 기본 종료시간을 +120분으로 변경.
- [x] 모달 기본값(신규 수업 열기 경로)의 종료시간 기본값을 +120분으로 변경.
- [x] 드래그 드롭 시 마우스 포인터 위치(셀 상/하단)에 따라 00분/30분 시작시간 계산.
- [x] 드롭 하이라이트에 하단(30분) 시각 피드백 추가.
- [x] E2E 시나리오 보강:
  - 기본 생성 수업이 2시간인지 검증
  - 30분 단위 드래그 이동 검증

## Dev Notes

- 30분 스냅은 각 hour-cell의 절반 기준으로 계산한다.
- 드래그 이동은 `start_at`, `end_at`만 patch하며 길이는 기존 duration 유지 로직으로 계산한다.

## Dev Agent Record

### Completion Notes List

- 기존 DnD 기능을 00/30분 스냅으로 확장했다.
- 기본 수업 생성 길이를 2시간으로 통일했다.
- E2E를 11개 시나리오로 유지하며 신규 요구사항 회귀를 추가 검증했다.

### File List

- `public/app.js`
- `public/styles.css`
- `tests/e2e/app.spec.js`
