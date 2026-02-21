# TimeTrack - Epic 10: Half-hour Timetable and Flexible Lesson Duration

## Epic 10: 30분 슬롯 타임테이블 및 수업 길이 설정 확장

주간 타임테이블의 시간 표현을 운영 현실에 맞게 30분 단위로 세분화하고, 수업 길이를 30분~4시간 범위에서 30분 단위로 설정 가능하게 한다.

### Story 10.1: Half-hour Slot Rendering and Duration-constrained Lesson Editing

As an academy operator,  
I want timetable time labels and lesson card sizing to follow 30-minute granularity,  
and lesson duration to be editable from 30 minutes to 4 hours in 30-minute steps,  
so that schedule creation and editing reflect actual class operations precisely.

**Acceptance Criteria:**

1. 주간 타임테이블 행 라벨이 `09:00`, `09:30`, `10:00` 형태로 30분 단위로 표시된다.
2. 수업 카드 높이가 30분 슬롯 단위 길이와 일치하게 렌더링된다.
3. 수업 생성/수정 모달에서 수업 길이를 30~240분 범위, 30분 단위로만 선택할 수 있다.
4. 수업 시작 시간은 00분 또는 30분으로만 저장된다.
5. API 레벨에서도 시작 시간/길이 제약이 검증된다.
6. E2E가 4시간 수업 생성 및 30분 슬롯 드래그 이동을 회귀 검증한다.
