# UI Design Handoff Guide

이 폴더에 넣어주신 디자인을 기준으로 제가 그대로 화면 개발을 진행합니다.

## 1. 넣어주실 위치
- 화면 시안 이미지: `design/screens/`
- 컴포넌트 단위 시안: `design/components/`
- 디자인 토큰/스타일 가이드: `design/tokens/`
- 플로우 설명(텍스트): `design/flows/`

## 2. 권장 파일 형식
- 이미지: `.png`, `.jpg`, `.webp`
- 벡터/원본: `.svg`, `.fig`(가능하면 export 추가)
- 텍스트 명세: `.md`

## 3. 파일 네이밍 규칙
- 화면: `screen-{영역}-{뷰}.png`
- 예시: `screen-main-week.png`, `screen-main-month.png`, `screen-modal-lesson-edit.png`
- 컴포넌트: `component-{이름}-{상태}.png`
- 예시: `component-student-item-default.png`, `component-student-item-selected.png`

## 4. 최소 필요 디자인 세트
- 메인 화면 3종: week / month / year
- 학생 추가/수정 모달
- 수업 생성/수정 모달
- 취소/보강 요약 스트립 + 펼침 상태
- 빈 상태 / 에러 상태 / 로딩 상태

## 5. 개발 반영 규칙
- 같은 요소의 상태별 시안이 있으면 시안 우선.
- 충돌되는 시안이 있으면 최신 수정일 파일 우선.
- 시안에 없는 상호작용은 `docs/mvp-spec.md` 기준으로 구현.

## 6. 선택 사항(있으면 품질 향상)
- 간격/폰트/색상 토큰 문서(`design/tokens/ui-tokens.md`)
- 반응형 기준 폭(예: 1280, 768, 390)
- hover/focus/disabled 상태 캡처

