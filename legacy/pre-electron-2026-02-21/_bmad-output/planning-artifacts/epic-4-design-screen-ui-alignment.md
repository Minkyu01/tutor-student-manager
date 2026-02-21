# TimeTrack - Epic 4: Design Screen UI Alignment

## Epic 4: design/screens PNG 기준 UI 정합

`design/screens/dashBoard_1.png`,`design/screens/dashBoard_2.png`, `design/screens/student_add_modal.png`, `design/screens/calss_add_modal.png` 시안을 기준으로 운영 UI를 정렬한다.

### Story 4.1: Dashboard Layout and Visual Token Alignment

As an academy operator,  
I want the main dashboard to follow the design screenshot layout and visual rhythm,  
so that daily scheduling is familiar and fast.

**Acceptance Criteria:**

1. Sidebar, header, summary strip, week grid가 시안 비율/톤과 유사하게 정렬된다.
2. 학생 카드 선택/배지/아바타 상태가 시안 스타일과 유사하다.
3. 주간 타임테이블의 카드/현재시간 라인/요일 컬러가 시안 톤과 유사하다.

### Story 4.2: Student Modal UI Alignment

As an academy operator,  
I want the student add/edit modal to match the design,  
so that data entry UI가 일관된다.

**Acceptance Criteria:**

1. 학생 모달 헤더, 입력 필드, 스위치, 액션 버튼 스타일이 시안과 유사하다.
2. 배경 오버레이와 모달 라운드/그림자가 시안 톤과 유사하다.
3. 모바일 폭에서도 모달 레이아웃이 깨지지 않는다.

### Story 4.3: Lesson Modal UI Alignment

As an academy operator,  
I want the lesson add/edit modal to match the design,  
so that class scheduling flow is visually consistent.

**Acceptance Criteria:**

1. 수업 모달 헤더, 날짜/시간 입력, 상태 토글, 메모/액션 영역이 시안과 유사하다.
2. 날짜/시간 입력 아이콘 및 상태 버튼 active 스타일이 시안과 유사하다.
3. 데스크톱/모바일에서 모달 가독성이 유지된다.

### Story 4.4: Additional Dashboard Entry File Alignment
As an academy operator,  
I want an additional dashboard file with the same updated UI,  
so that dashboard entry can be accessed from more than one static path.

**Acceptance Criteria:**
1. `public/dashboard.html` 파일이 추가된다.
2. `public/dashboard.html`은 최신 `index` UI 변경사항을 동일하게 반영한다.
3. `/dashboard.html` 경로로 접근 시 동일 UI가 표시된다.
