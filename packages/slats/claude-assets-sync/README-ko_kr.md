# @slats/claude-assets-sync

npm 패키지에서 Claude commands와 skills를 프로젝트의 `.claude/` 디렉토리로 동기화하는 CLI 도구입니다.

## 개요

이 도구를 사용하면 npm 패키지 작성자가 Claude Code commands와 skills를 패키지와 함께 배포할 수 있습니다. 사용자가 이러한 패키지를 설치하면 Claude assets을 로컬 `.claude/` 디렉토리로 동기화하여 Claude Code에서 바로 사용할 수 있습니다.

## 설치

```bash
# npx 사용 (일회성 사용에 권장)
npx @slats/claude-assets-sync -p @canard/schema-form

# 또는 전역 설치
npm install -g @slats/claude-assets-sync
```

## 사용법

### 기본 사용법

```bash
# 단일 패키지 동기화
npx @slats/claude-assets-sync -p @canard/schema-form

# 여러 패키지 동기화
npx @slats/claude-assets-sync -p @canard/schema-form -p @lerx/promise-modal
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `-p, --package <name>` | 동기화할 패키지 이름 (여러 번 지정 가능) |
| `-f, --force` | 버전이 일치해도 강제 동기화 |
| `--dry-run` | 파일 생성 없이 미리보기 |
| `--help` | 도움말 표시 |
| `--version` | 버전 표시 |

### 예제

```bash
# 동기화될 내용 미리보기
npx @slats/claude-assets-sync -p @canard/schema-form --dry-run

# 강제 동기화 (버전 체크 무시)
npx @slats/claude-assets-sync -p @canard/schema-form --force

# GitHub 토큰으로 동기화 (Rate limit 완화)
GITHUB_TOKEN=ghp_xxx npx @slats/claude-assets-sync -p @canard/schema-form
```

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

### 디렉토리 구조

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

### 파일 형식

- Commands와 skills는 Markdown 파일 (`.md`)이어야 합니다
- 파일은 수정 없이 그대로 동기화됩니다
- 표준 Claude Code command/skill 형식을 사용하세요

## 대상 디렉토리 구조

동기화된 파일은 프로젝트의 `.claude/` 디렉토리에 정리됩니다:

```
your-project/
└── .claude/
    ├── commands/
    │   └── @your-scope/
    │       └── your-package/
    │           ├── your-command.md
    │           └── .sync-meta.json
    └── skills/
        └── @your-scope/
            └── your-package/
                ├── your-skill.md
                └── .sync-meta.json
```

## 버전 관리

도구는 동기화된 버전을 추적하기 위해 `.sync-meta.json` 파일을 생성합니다:

```json
{
  "version": "1.0.0",
  "syncedAt": "2025-02-01T12:00:00.000Z",
  "files": ["your-command.md"]
}
```

- 로컬 버전이 패키지 버전과 일치하면 동기화를 건너뜁니다
- `--force`를 사용하여 버전 체크를 무시할 수 있습니다

## 환경 변수

| 변수 | 설명 |
|------|------|
| `GITHUB_TOKEN` | GitHub API Rate limit 완화를 위한 개인 액세스 토큰 |
| `VERBOSE` | 디버그 로깅 활성화 |

## Rate Limits

- **토큰 없이**: 시간당 60회 요청 (GitHub API 제한)
- **토큰 사용 시**: 시간당 5,000회 요청

대부분의 경우 인증되지 않은 제한으로 충분합니다. 많은 패키지를 동기화하는 경우 `GITHUB_TOKEN`을 설정하세요.

## 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](./LICENSE)를 참조하세요.
