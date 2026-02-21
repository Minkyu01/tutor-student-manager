# TimeTrack - Epic 11: Current Time Indicator Alignment

## Epic 11: 현재시간 인디케이터 정합 및 실시간 갱신 안정화

주간 타임테이블의 현재시간 가로줄이 실제 현재 시각과 정확히 일치하도록 보장하고, 레이아웃 변화/시간 경과 상황에서도 표시 오차 없이 유지되도록 안정화한다.

### Story 11.1: Real-time Current Time Line Position Accuracy

As an academy operator,  
I want the timetable current-time line to match the real current time,  
so that I can trust schedule timing at a glance.

**Acceptance Criteria:**

1. 주간 보기에서 현재시간 가로줄 위치가 실제 현재 시각과 일치한다.
2. 라인 위치 계산은 하드코딩 픽셀이 아닌 실제 렌더링된 그리드 치수를 기준으로 한다.
3. 타임테이블이 열려 있는 동안 현재시간 라벨/라인이 주기적으로 자동 갱신된다.
4. 현재 주간 범위 밖이거나 운영 시간(09:00~21:00) 밖일 때 현재시간 라인은 숨김 처리된다.
5. 월/연 보기 전환 시 현재시간 라인 갱신 타이머가 정리되어 불필요한 동작이 남지 않는다.
6. 회귀 테스트(기존 E2E 전체)에서 실패가 없어야 한다.

