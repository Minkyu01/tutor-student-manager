# Story 10.1: Half-hour Slot Rendering and Duration-constrained Lesson Editing

Status: done

## Story

As an academy operator,  
I want timetable time labels and lesson card sizing to follow 30-minute granularity,  
and lesson duration to be editable from 30 minutes to 4 hours in 30-minute steps,  
so that schedule creation and editing reflect actual class operations precisely.

## Acceptance Criteria

1. 주간 타임테이블 행 라벨이 `09:00`, `09:30`, `10:00` 형태로 30분 단위로 표시된다.
2. 수업 카드 높이가 30분 슬롯 단위 길이와 일치하게 렌더링된다.
3. 수업 생성/수정 모달에서 수업 길이를 30~240분 범위, 30분 단위로만 선택할 수 있다.
4. 수업 시작 시간은 00분 또는 30분으로만 저장된다.
5. API 레벨에서도 시작 시간/길이 제약이 검증된다.
6. E2E가 4시간 수업 생성 및 30분 슬롯 드래그 이동을 회귀 검증한다.

## Tasks / Subtasks

- [x] 주간 타임테이블 슬롯을 1시간 단위에서 30분 단위로 변경.
- [x] 카드 높이 계산을 30분 슬롯 기준으로 조정.
- [x] 수업 모달에 수업 길이 선택 필드(30~240분, 30분 step) 추가.
- [x] 수업 시간 입력을 30분 단위로 제한(`step=1800`)하고 클라이언트 검증 보강.
- [x] 서버 `lessonValidation`에 시작 시간/수업 길이 제약 검증 추가.
- [x] E2E에 4시간 수업 생성 시나리오 추가 및 드래그 타겟을 30분 슬롯 기준으로 갱신.
- [x] CSP(`style-src 'self'`) 환경에서 인라인 스타일이 차단되는 문제를 해결하기 위해 카드 높이 표현을 인라인 style에서 클래스 기반(`event-span-*`)으로 전환.

## Dev Notes

- 슬롯 기준 상수(`30분`, `09:00~21:00`, `행 높이`)를 앱 상단 상수로 통합해 계산 일관성을 확보했다.
- 기존 데이터 중 비정규 길이 값이 있더라도 렌더링/편집 시 30분 규칙으로 정규화된다.

## Dev Agent Record

### Completion Notes List

- 타임테이블 시간 라벨을 30분 단위로 세분화했다.
- 카드 배치/높이 계산을 30분 슬롯 스케일에 맞춰 조정했다.
- CSP 제약으로 무시되던 인라인 높이 스타일을 제거하고 슬롯 span 클래스 기반 렌더링으로 전환해 실제 UI 반영을 보장했다.
- 모달 입력과 API 검증 모두에 30분 단위 제약을 적용했다.
- E2E 13개 테스트를 전부 통과했다.

### File List

- `public/app.js`
- `public/index.html`
- `public/dashboard.html`
- `public/styles.css`
- `src/server.js`
- `tests/e2e/app.spec.js`
- `docs/mvp-spec.md`
- `docs/api-db-spec.md`

## Senior Developer Review (AI)

Review Date: 2026-02-21

- Acceptance Criteria 1-6 are implemented and validated by E2E.
- No High/Medium findings were detected in reviewed files.
- Story status can remain `done`.
- Linked review artifact: `_bmad-output/implementation-artifacts/10-1-code-review.md`
