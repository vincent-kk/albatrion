# CLAUDE.md

`@slats/claude-assets-sync` — Claude Code 자산(commands, skills)을 npm 패키지에서 `.claude/` 디렉토리로 동기화하는 CLI 도구.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트
yarn lint              # ESLint
```

## Sync Flow

1. `node_modules`의 `package.json`에서 `claude.assetPath` 설정 읽기
2. 저장소 URL → GitHub owner/repo 파싱
3. `.sync-meta.json` 버전 비교 (일치 시 스킵, `--force`로 강제)
4. GitHub Contents API로 `commands/`, `skills/` 파일 목록 조회
5. `raw.githubusercontent.com`에서 파일 다운로드
6. `.claude/{type}/{scope}/{name}/`에 저장
7. `.sync-meta.json` 업데이트

## Architecture

```
src/
├── index.ts              # CLI 진입점
├── core/
│   ├── cli.ts            # Commander.js CLI 정의
│   ├── github.ts         # GitHub API 클라이언트
│   ├── filesystem.ts     # 파일 시스템 관리, .sync-meta.json
│   ├── sync.ts           # 동기화 오케스트레이션
│   └── migration.ts      # 마이그레이션 로직
├── commands/             # sync, add, list, status, remove, migrate 커맨드
├── components/           # ink 기반 인터랙티브 터미널 UI
└── utils/                # types, package.json 파싱, logger
```

## Key Details
- **ink**: 인터랙티브 터미널 UI (TreeSelect, AddCommand, ListCommand 등)
- **인증**: `GITHUB_TOKEN` 환경변수로 GitHub API rate limit 우회
- **런타임 의존성 없음**: Node.js 내장 모듈 + `commander`, `picocolors`만 사용

## Build Output
`dist/index.cjs` + `dist/index.mjs` (CLI shebang 포함) + `dist/index.d.ts`
