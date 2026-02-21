# Story 12.1: macOS + Windows Packaging Targets

Status: ready-for-dev

## Story

As an operator,  
I want build artifacts for both macOS and Windows,  
so that users on either platform can download and run TimeTrack.

## Acceptance Criteria

1. `electron-builder` 설정이 macOS와 Windows 타겟 산출물을 생성한다.
2. macOS 배포물(`dmg`/`zip`)과 Windows 배포물(`exe` installer, 필요 시 portable/zip)이 생성된다.
3. 빌드 스크립트가 플랫폼별로 명확히 분리되어 실행 가능하다.
4. 런북에 플랫폼별 빌드/검증 절차가 문서화된다.

## Tasks / Subtasks

- [ ] `package.json`의 `build` 타겟에 Windows 배포 타겟을 추가한다.
- [ ] 플랫폼별 배포 스크립트(`dist:mac`, `dist:win`, 필요 시 `dist:all`)를 정리한다.
- [ ] 아티팩트 출력 경로/파일명 규칙을 문서화한다.
- [ ] Windows 환경 또는 CI에서 실제 산출물 생성 검증을 수행한다.
- [ ] 런북(`docs/electron-release-runbook.md`)을 크로스플랫폼 기준으로 갱신한다.

## Dev Notes

- 기존 macOS 배포 파이프라인(Epic 6.3)을 확장하는 방식으로 변경 범위를 최소화한다.
- Windows 코드서명 인증서가 없는 경우 unsigned 빌드 동작과 배포 주의사항을 명확히 문서화한다.

