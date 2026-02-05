# @slats/claude-assets-sync

npm 패키지에서 Claude commands와 skills를 프로젝트의 `.claude/` 디렉토리로 동기화하는 CLI 도구입니다.

## 개요

이 도구를 사용하면 npm 패키지 작성자가 Claude Code commands와 skills를 패키지와 함께 배포할 수 있습니다. 사용자가 이러한 패키지를 설치하면 Claude assets을 로컬 `.claude/` 디렉토리로 동기화하여 Claude Code에서 바로 사용할 수 있습니다.

## 기능

- **다중 패키지 동기화**: 한 명령어로 여러 패키지 동기화
- **버전 추적**: 버전 변경이 없으면 자동으로 재동기화 건너뛰기
- **평탄 구조 지원**: 접두사 파일명을 사용한 최신 평탄 파일 구조
- **레거시 마이그레이션**: 중첩 구조에서 평탄 구조로 마이그레이션
- **패키지 관리**: 동기화된 패키지 목록 조회, 삭제, 검사
- **상태 모니터링**: 동기화 상태 확인 및 사용 가능한 업데이트 확인
- **드라이런 모드**: 변경 사항을 미리 확인한 후 적용
- **GitHub 및 npm 통합**: GitHub API에서 파일을 가져오고 npm 레지스트리 모니터링

## 설치

```bash
# npx 사용 (일회성 사용에 권장)
npx @slats/claude-assets-sync -p @canard/schema-form

# 또는 전역 설치
npm install -g @slats/claude-assets-sync
```

## 빠른 시작

```bash
# 단일 패키지 동기화
npx @slats/claude-assets-sync -p @canard/schema-form

# 여러 패키지 동기화
npx @slats/claude-assets-sync -p @canard/schema-form -p @lerx/promise-modal

# 동기화될 내용 미리보기
npx @slats/claude-assets-sync -p @canard/schema-form --dry-run

# 동기화 상태 및 사용 가능한 업데이트 확인
npx @slats/claude-assets-sync status

# 동기화된 모든 패키지 나열
npx @slats/claude-assets-sync list

# 동기화된 패키지 삭제
npx @slats/claude-assets-sync remove -p @canard/schema-form

# 레거시 중첩 구조에서 평탄 구조로 마이그레이션
npx @slats/claude-assets-sync migrate
```

## 명령어

### sync (기본 명령어)

npm 패키지에서 Claude assets을 동기화합니다.

```bash
npx @slats/claude-assets-sync [옵션] -p <패키지>
```

**옵션:**

| 옵션 | 설명 |
|------|------|
| `-p, --package <name>` | 동기화할 패키지 이름 (여러 번 지정 가능) |
| `-f, --force` | 버전이 일치해도 강제 동기화 |
| `--dry-run` | 파일 생성 없이 미리보기 |
| `-l, --local` | node_modules 대신 로컬 워크스페이스에서 패키지 읽기 |
| `-r, --ref <ref>` | 가져올 Git ref (브랜치, 태그, 커밋) |
| `--no-flat` | 평탄 구조 대신 레거시 중첩 구조 사용 |
| `--help` | 도움말 표시 |
| `--version` | 버전 표시 |

**예제:**

```bash
# 버전 체크와 함께 동기화 (기본 동작)
npx @slats/claude-assets-sync -p @canard/schema-form

# 버전 체크를 무시하고 강제 동기화
npx @slats/claude-assets-sync -p @canard/schema-form --force

# 동기화 전 변경 사항 미리보기
npx @slats/claude-assets-sync -p @canard/schema-form --dry-run

# 특정 git ref에서 동기화
npx @slats/claude-assets-sync -p @canard/schema-form -r main

# 로컬 워크스페이스에서 동기화
npx @slats/claude-assets-sync -p @canard/schema-form --local

# 레거시 중첩 구조 사용
npx @slats/claude-assets-sync -p @canard/schema-form --no-flat
```

### list

동기화된 모든 패키지를 세부 정보와 함께 나열합니다.

```bash
npx @slats/claude-assets-sync list [옵션]
```

**옵션:**

| 옵션 | 설명 |
|------|------|
| `--json` | 결과를 JSON으로 출력 |

**예제:**

```bash
# 인간이 읽을 수 있는 형식으로 동기화된 패키지 나열
npx @slats/claude-assets-sync list

# 스크립팅을 위해 JSON 출력 가져오기
npx @slats/claude-assets-sync list --json
```

**출력:**

```
Synced Packages:

  @canard/schema-form@1.0.0
    Synced: 2025. 2. 5. 오전 10:30:00
    Assets: 2 files
    Types: 1 commands, 1 skills

  @lerx/promise-modal@0.5.0
    Synced: 2025. 2. 5. 오전 10:30:00
    Assets: 1 files
    Types: 1 skills
```

### remove

동기화된 패키지와 그 assets을 삭제합니다.

```bash
npx @slats/claude-assets-sync remove [옵션] -p <패키지>
```

**옵션:**

| 옵션 | 설명 |
|------|------|
| `-p, --package <name>` | 삭제할 패키지 이름 (필수) |
| `-y, --yes` | 확인 프롬프트 건너뛰기 |
| `--dry-run` | 파일을 삭제하지 않고 변경 사항 미리보기 |

**예제:**

```bash
# 확인 프롬프트와 함께 패키지 삭제
npx @slats/claude-assets-sync remove -p @canard/schema-form

# 확인 없이 삭제
npx @slats/claude-assets-sync remove -p @canard/schema-form --yes

# 삭제될 내용 미리보기
npx @slats/claude-assets-sync remove -p @canard/schema-form --dry-run
```

### status

모든 패키지의 동기화 상태를 표시하고 사용 가능한 업데이트를 확인합니다.

```bash
npx @slats/claude-assets-sync status [옵션]
```

**옵션:**

| 옵션 | 설명 |
|------|------|
| `--no-remote` | npm 레지스트리 업데이트 확인 건너뛰기 |

**기능:**

- 동기화된 각 패키지의 로컬 버전 표시
- npm 레지스트리에서 최신 버전 확인
- 원격 버전 확인 캐싱 (5분 TTL)
- 상태 아이콘으로 업데이트 가능 여부 표시
- 각 패키지의 동기화 타임스탬프 포함

**예제:**

```bash
# 원격 버전 확인과 함께 상태 확인
npx @slats/claude-assets-sync status

# npm 레지스트리 확인 없이 상태 확인
npx @slats/claude-assets-sync status --no-remote
```

**출력:**

```
Package Status:

  ✓ @canard/schema-form
      Local:  1.0.0
      Remote: 1.0.0
      Status: Up to date
      Synced: 2025. 2. 5. 오전 10:30:00

  ⚠ @lerx/promise-modal
      Local:  0.5.0
      Remote: 0.6.0
      Status: Update available
      Synced: 2025. 2. 5. 오전 10:30:00

Summary: 1 up to date, 1 updates available
```

### migrate

동기화된 패키지를 레거시 중첩 구조에서 평탄 구조로 마이그레이션합니다.

```bash
npx @slats/claude-assets-sync migrate [옵션]
```

**옵션:**

| 옵션 | 설명 |
|------|------|
| `--dry-run` | 변경하지 않고 마이그레이션 미리보기 |

**기능:**

- 중첩 디렉토리 구조를 평탄 파일 명명으로 변환
- 모든 패키지 메타데이터 보존
- 원본 구조의 백업 생성
- 여러 번 실행해도 안전함
- 포괄적인 드라이런 미리보기 포함

**예제:**

```bash
# 마이그레이션 변경 사항 미리보기
npx @slats/claude-assets-sync migrate --dry-run

# 마이그레이션 수행
npx @slats/claude-assets-sync migrate
```

## 디렉토리 구조

### 평탄 구조 (기본값, 최신)

기본 평탄 구조는 공유 디렉토리에서 접두사가 붙은 파일명을 사용합니다:

```
your-project/
└── .claude/
    ├── commands/
    │   ├── @canard-schema-form-my-command.md
    │   └── @lerx-promise-modal-another-command.md
    └── skills/
        ├── @canard-schema-form-my-skill.md
        └── @lerx-promise-modal-another-skill.md
```

**장점:**
- 깔끔한 디렉토리 구조
- 패키지 간 commands 공유가 용이
- asset 유형당 단일 .sync-meta.json
- 많은 패키지가 있을 때 더 나은 확장성

### 중첩 구조 (레거시)

레거시 중첩 구조는 패키지별로 구성합니다:

```
your-project/
└── .claude/
    ├── commands/
    │   └── @canard/
    │       └── schema-form/
    │           ├── my-command.md
    │           └── .sync-meta.json
    └── skills/
        └── @lerx/
            └── promise-modal/
                ├── my-skill.md
                └── .sync-meta.json
```

**사용 사례:** 레거시 프로젝트 또는 패키지별 구성이 필요한 경우

## 버전 관리

도구는 동기화된 버전을 추적하여 불필요한 재동기화를 방지합니다. 통합된 `.sync-meta.json` 파일이 모든 패키지의 메타데이터를 저장합니다:

```json
{
  "version": "0.0.1",
  "syncedAt": "2025-02-05T10:30:00.000Z",
  "packages": {
    "@canard-schema-form": {
      "originalName": "@canard/schema-form",
      "version": "1.0.0",
      "files": {
        "commands": [
          { "original": "my-command.md", "transformed": "@canard-schema-form-my-command.md" }
        ],
        "skills": [
          { "original": "my-skill.md", "transformed": "@canard-schema-form-my-skill.md" }
        ]
      }
    }
  }
}
```

**기능:**

- 패키지 버전이 변경되지 않으면 자동으로 동기화 건너뛰기
- `--force`를 사용하여 버전 체크를 무시하고 재동기화
- 각 동기화마다 `syncedAt` 타임스탬프 업데이트
- 정리 및 마이그레이션을 위한 전체 파일 매핑

## 패키지 작성자를 위한 가이드

`claude-assets-sync`와 호환되도록 하려면 `package.json`에 `claude` 필드를 추가하세요:

```json
{
  "name": "@your-scope/your-package",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-repo.git",
    "directory": "packages/your-package"
  },
  "claude": {
    "assetPath": "docs/claude"
  }
}
```

### 패키지 구조

패키지는 다음과 같은 구조를 가져야 합니다:

```
your-package/
├── docs/
│   └── claude/
│       ├── commands/
│       │   └── your-command.md
│       └── skills/
│           └── your-skill.md
└── package.json
```

### Asset 가이드라인

- **Commands와 skills**: Markdown 파일(`.md`)이어야 합니다
- **파일 형식**: 표준 Claude Code command/skill 형식 사용
- **파일명**: 소문자 하이픈으로 설명적인 파일명 사용 (예: `my-command.md`)
- **수정 없음**: 파일은 변환 없이 그대로 동기화됩니다
- **Repository 요구사항**: package.json에 유효한 `repository.type`과 `repository.url` 필요

### 설정

package.json의 `claude.assetPath`는 `commands/`와 `skills/` 하위 디렉토리를 포함하는 디렉토리를 가리켜야 합니다:

```json
{
  "claude": {
    "assetPath": "docs/claude"  // 패키지 루트를 기준으로 한 경로
  }
}
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `GITHUB_TOKEN` | GitHub API rate limit 완화를 위한 개인 액세스 토큰 | (인증 안 함) |
| `VERBOSE` | 디버그 로깅 활성화 (모든 값 설정 가능) | (비활성화) |

## Rate Limits

- **토큰 없이**: 시간당 60회 요청 (GitHub API 제한)
- **토큰 사용 시**: 시간당 5,000회 요청

대부분의 경우 인증되지 않은 제한으로 충분합니다. 많은 패키지를 동기화하는 경우 GitHub 토큰을 설정하세요:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
npx @slats/claude-assets-sync -p @package1 -p @package2 -p @package3
```

## 워크플로우 예제

### 초기 설정

```bash
# 프로젝트의 모든 패키지 동기화
npx @slats/claude-assets-sync \
  -p @canard/schema-form \
  -p @lerx/promise-modal \
  -p @winglet/react-utils

# 동기화 확인
npx @slats/claude-assets-sync list

# 사용 가능한 업데이트 확인
npx @slats/claude-assets-sync status
```

### 정기적 유지 관리

```bash
# 사용 가능한 업데이트가 있는 패키지 확인
npx @slats/claude-assets-sync status

# 특정 패키지를 최신 버전으로 업데이트
npx @slats/claude-assets-sync -p @canard/schema-form --force

# 특정 브랜치의 모든 패키지 업데이트
npx @slats/claude-assets-sync \
  -p @canard/schema-form \
  -p @lerx/promise-modal \
  --force -r develop
```

### 정리

```bash
# 삭제 전에 제거될 내용 확인
npx @slats/claude-assets-sync remove -p @old-package --dry-run

# 패키지 제거
npx @slats/claude-assets-sync remove -p @old-package --yes

# 남은 패키지 나열
npx @slats/claude-assets-sync list
```

### CI/CD 통합

```bash
#!/bin/bash
# 팀 패키지를 모두 동기화하는 스크립트
PACKAGES=(
  "@canard/schema-form"
  "@lerx/promise-modal"
  "@winglet/react-utils"
)

for pkg in "${PACKAGES[@]}"; do
  npx @slats/claude-assets-sync -p "$pkg" --force
done

# 동기화 확인
npx @slats/claude-assets-sync list
```

## 문제 해결

### "Package is not synced" (패키지가 동기화되지 않음)

지정된 패키지가 아직 동기화되지 않았습니다. 사용 가능한 패키지를 나열하세요:

```bash
npx @slats/claude-assets-sync list
```

그런 다음 동기화하세요:

```bash
npx @slats/claude-assets-sync -p @your-package
```

### "Rate limit exceeded" (Rate limit 초과)

GitHub API rate limit에 도달했습니다 (인증 없이 시간당 60회 요청). 해결 방법:

1. **GitHub 토큰 설정:** `export GITHUB_TOKEN=ghp_xxxxxxxxxxxx`
2. **1시간 대기** (rate limit 초기화)
3. **`--local` 플래그 사용** (패키지가 로컬 워크스페이스에 있는 경우)

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx npx @slats/claude-assets-sync -p @package
```

### "Repository information not found" (Repository 정보를 찾을 수 없음)

패키지의 `package.json`에 필요한 repository 설정이 없습니다:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/your-repo.git"
  }
}
```

### `.claude/` 디렉토리에 파일이 나타나지 않음

1. **동기화 상태 확인:** `npx @slats/claude-assets-sync list`
2. **패키지에 assets가 있는지 확인:** 패키지에 `docs/claude/commands` 또는 `docs/claude/skills` 디렉토리가 있는지 확인
3. **드라이런을 사용하여 디버깅:** `npx @slats/claude-assets-sync -p @package --dry-run`

### 이전 버전에서 마이그레이션

레거시 중첩 구조가 있는 경우:

```bash
# 마이그레이션 변경 사항 미리보기
npx @slats/claude-assets-sync migrate --dry-run

# 마이그레이션 수행
npx @slats/claude-assets-sync migrate
```

## 아키텍처

### 명령어 아키텍처

도구는 모듈식 명령어 구조를 사용합니다:

- **sync**: GitHub API 통합을 통한 핵심 동기화 로직
- **list**: 통합 메타데이터 쿼리 및 패키지 정보 표시
- **remove**: 확인 프롬프트가 있는 안전한 패키지 제거
- **status**: npm 레지스트리 통합을 통한 버전 확인
- **migrate**: 드라이런 지원 포함 구조 마이그레이션

### 데이터 흐름

```
1. package.json 읽기 → claude.assetPath 추출
2. repository URL 파싱 → GitHub owner/repo
3. 버전 확인 → 변경 없으면 건너뛰기 (--force 제외)
4. 파일 가져오기 → GitHub API (commands/ 및 skills/)
5. 경로 변환 → 명명 규칙 적용
6. 파일 쓰기 → .claude/{type}/{prefixed-name}.md (평탄)
7. 메타데이터 업데이트 → 통합된 .sync-meta.json
```

## 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](./LICENSE)를 참조하세요.
