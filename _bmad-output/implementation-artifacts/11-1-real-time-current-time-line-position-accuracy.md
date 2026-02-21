# Story 11.1: Real-time Current Time Line Position Accuracy

Status: done

## Story

As an academy operator,  
I want the timetable current-time line to match the real current time,  
so that I can trust schedule timing at a glance.

## Acceptance Criteria

1. 주간 보기에서 현재시간 가로줄 위치가 실제 현재 시각과 일치한다.
2. 라인 위치 계산은 하드코딩 픽셀이 아닌 실제 렌더링된 그리드 치수를 기준으로 한다.
3. 타임테이블이 열려 있는 동안 현재시간 라벨/라인이 주기적으로 자동 갱신된다.
4. 현재 주간 범위 밖이거나 운영 시간(09:00~21:00) 밖일 때 현재시간 라인은 숨김 처리된다.
5. 월/연 보기 전환 시 현재시간 라인 갱신 타이머가 정리되어 불필요한 동작이 남지 않는다.
6. 회귀 테스트(기존 E2E 전체)에서 실패가 없어야 한다.

## Tasks / Subtasks

- [x] 현재시간 라인 위치 계산에서 하드코딩 픽셀 오프셋 상수를 제거하고, 실제 그리드 셀 DOM 좌표 기반 계산으로 전환.
- [x] 라인 위치를 분 단위 이상으로 갱신할 수 있도록 주기적 업데이트 타이머 추가.
- [x] 주간 범위/운영시간 범위를 벗어나면 라인을 자동 숨김 처리.
- [x] 월/연 모드 전환 시 타이머 정리 로직 추가.
- [x] CSS 고정 좌표(`left`) 의존도를 제거하고 JS 계산값으로 수평 위치 정렬.
- [x] 전체 E2E 회귀 검증 실행.

## Dev Notes

- 기존 `TIMETABLE_HEADER_OFFSET_PX`, `TIMETABLE_SLOT_HEIGHT_PX` 기반 계산은 헤더 높이/테이블 스타일 변화에 취약하므로 제거했다.
- 현재시간 라인은 `tbody` 첫/마지막 슬롯 셀 실측 높이 구간으로 보간하여 계산한다.
- 타이머는 주간 모드 진입 시 시작하고, 월/연 모드 렌더 시 즉시 정리한다.

## Dev Agent Record

### Completion Notes List

- 현재시간 라인 좌표를 DOM 실측 기반으로 계산하도록 변경해 실제 시간과 시각적 위치 오차를 줄였다.
- 라벨 시간을 15초 간격으로 갱신하도록 하여 열린 화면에서도 현재시각 반영이 유지되게 했다.
- 주간 외 범위/운영시간 외 조건에서 라인 숨김 처리로 오표시를 방지했다.
- `better-sqlite3` 네이티브 모듈 재빌드 후 E2E 전체(13개)를 통과했다.

### File List

- `public/app.js`
- `public/styles.css`
- `_bmad-output/planning-artifacts/epic-11-current-time-indicator-alignment.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

