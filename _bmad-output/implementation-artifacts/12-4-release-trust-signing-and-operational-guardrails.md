# Story 12.4: Release Trust, Signing, and Operational Guardrails

Status: review

## Story

As a maintainer,  
I want a secure and repeatable release process,  
so that updates are trusted by OS security policies and operational risk is controlled.

## Acceptance Criteria

1. macOS/Windows 코드서명(가능 범위) 구성 지침과 CI 시크릿 요구사항이 문서화된다.
2. 자동업데이트 요구조건(서명/호스팅/버전 채널)이 명시된다.
3. 배포 전 체크리스트(회귀 테스트, 수동 스모크, 롤백 방법)가 런북에 반영된다.
4. 최소 1회 end-to-end 릴리스 리허설(드라이런) 기록이 남는다.

## Tasks / Subtasks

- [x] `docs/electron-release-runbook.md`에 코드서명/시크릿 요구사항을 추가한다.
- [x] 자동업데이트 신뢰 조건(배포 호스트, 버전 규칙, 메타데이터/블록맵)을 문서화한다.
- [x] 배포 전 체크리스트(자동 회귀, 수동 스모크, 롤백 가드레일)를 정리한다.
- [x] 릴리스 리허설 실행 기록 파일을 추가한다.
- [x] 로컬 리허설 검증(`npm run test:e2e`, `npm run dist:dir`) 결과를 기록한다.

## Dev Notes

- 코드서명/노터라이즈는 CI 시크릿 준비 상태에 따라 선택 적용이 가능하도록 가이드했다.
- 자동업데이트 신뢰성은 GitHub Releases 메타데이터/버전 증가/서명 상태에 크게 의존하므로 운영 규칙을 명시했다.
- 현재 환경에서는 원격 GitHub publish까지의 완전 E2E 검증은 네트워크/원격 권한 상태에 좌우되므로, 이번 스토리는 문서/가드레일 중심으로 완료하고 상태를 `review`로 둔다.

## Dev Agent Record

### Completion Notes List

- 릴리스 운영 문서를 trust/signing 중심으로 재구성했다.
- 자동업데이트 안전 조건과 실패 시 운영 대응 절차를 명시했다.
- 배포 전 필수 점검 체크리스트를 강화했다.
- 2026-02-21 기준 드라이런 결과 문서를 추가했다.

### File List

- `docs/electron-release-runbook.md`
- `_bmad-output/implementation-artifacts/12-4-release-rehearsal-2026-02-21.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
