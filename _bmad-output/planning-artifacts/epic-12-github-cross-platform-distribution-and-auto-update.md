# TimeTrack - Epic 12: GitHub Cross-platform Distribution and Auto Update

## Epic 12: GitHub 기반 macOS/Windows 배포 및 자동업데이트

TimeTrack를 GitHub Releases를 통해 배포하고, 사용자가 다운로드 후 설치/실행할 수 있도록 macOS/Windows 패키징 경로를 완성한다.  
또한 앱 내 자동업데이트(업데이트 확인, 다운로드, 재시작 적용) 기능을 도입해 운영 배포를 자동화한다.

### Story 12.1: macOS + Windows Packaging Targets

As an operator,  
I want build artifacts for both macOS and Windows,  
so that users on either platform can download and run TimeTrack.

**Acceptance Criteria:**

1. `electron-builder` 설정이 macOS와 Windows 타겟 산출물을 생성한다.
2. macOS 배포물(`dmg`/`zip`)과 Windows 배포물(`exe` installer, 필요 시 portable/zip)이 생성된다.
3. 빌드 스크립트가 플랫폼별로 명확히 분리되어 실행 가능하다.
4. 런북에 플랫폼별 빌드/검증 절차가 문서화된다.

### Story 12.2: GitHub Releases Distribution Pipeline

As an operator,  
I want release artifacts uploaded to GitHub Releases automatically,  
so that users can download binaries directly from GitHub.

**Acceptance Criteria:**

1. 태그 기반 릴리스 워크플로우가 macOS/Windows 빌드를 수행한다.
2. 빌드 산출물이 GitHub Releases에 자동 업로드된다.
3. 릴리스 노트/버전 규칙(semver)과 체크섬(또는 무결성 정보) 생성 규칙이 정의된다.
4. 실패 시 재시도/수동 대체 절차가 런북에 문서화된다.

### Story 12.3: In-app Auto Update via GitHub Releases

As a user,  
I want the app to detect and apply updates automatically,  
so that I can stay on the latest stable version without manual reinstall steps.

**Acceptance Criteria:**

1. 앱이 시작 시(또는 메뉴 액션으로) 업데이트 체크를 수행한다.
2. 새 버전이 있으면 다운로드 진행 상태와 적용 안내를 사용자에게 제공한다.
3. 다운로드 완료 후 재시작-적용 흐름이 동작한다.
4. 개발환경/서명 미구성 환경에서는 자동업데이트가 안전하게 비활성화되거나 안내 메시지를 제공한다.
5. 업데이트 실패/네트워크 오류 시 앱이 정상 동작을 유지하고 로그를 남긴다.

### Story 12.4: Release Trust, Signing, and Operational Guardrails

As a maintainer,  
I want a secure and repeatable release process,  
so that updates are trusted by OS security policies and operational risk is controlled.

**Acceptance Criteria:**

1. macOS/Windows 코드서명(가능 범위) 구성 지침과 CI 시크릿 요구사항이 문서화된다.
2. 자동업데이트 요구조건(서명/호스팅/버전 채널)이 명시된다.
3. 배포 전 체크리스트(회귀 테스트, 수동 스모크, 롤백 방법)가 런북에 반영된다.
4. 최소 1회 end-to-end 릴리스 리허설(드라이런) 기록이 남는다.

