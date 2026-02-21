# TimeTrack - Epic 9: Scheduling Editing Hardening

## Epic 9: 드래그 기반 스케줄 편집 고도화

주간 타임테이블 편집 UX를 운영 수준으로 강화한다. 핵심은 기본 수업 길이 정책 정합(2시간)과 30분 단위 시간 이동 정확도다.

### Story 9.1: Two-hour Default and Half-hour Drag Rescheduling

As an academy operator,  
I want newly created lessons to default to 2 hours and support 30-minute drag repositioning,  
so that weekly schedule adjustments match real operation patterns.

**Acceptance Criteria:**

1. 빈 슬롯에서 수업 생성 시 기본 길이는 2시간이다.
2. 주간 타임테이블 카드 드래그 드롭 시 00분/30분 단위로 시작 시간이 결정된다.
3. 드롭 후 기존 수업 길이는 유지된다.
4. 기존 클릭 편집/삭제 흐름은 유지된다.
5. E2E가 기본 2시간 생성 및 30분 단위 드래그 이동을 검증한다.

### Story 9.2: Collision Policy and Drop Validation

As an academy operator,  
I want clear conflict handling when moving lessons,  
so that schedule integrity is predictable.

**Acceptance Criteria:**

1. 충돌 정책(허용/경고/차단)이 문서화되고 구현에 반영된다.
2. 드롭 불가 조건에서 사용자 피드백이 명확하다.
3. 정책 관련 회귀 테스트가 추가된다.

### Story 9.3: Drag Failure Recovery UX

As an academy operator,  
I want recoverable feedback if drag-save fails,  
so that I can continue editing without data confusion.

**Acceptance Criteria:**

1. 저장 실패 시 이전 상태 유지가 보장된다.
2. 사용자에게 실패 원인과 재시도 수단을 제공한다.
3. 네트워크/권한 실패에 대한 E2E 또는 통합 테스트가 추가된다.
