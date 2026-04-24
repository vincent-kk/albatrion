# @slats/claude-assets-sync

임의의 npm 패키지가 자신의 Claude Code 문서(skills, rules, commands)를 배포하고, 엔진의 `inject-claude-settings` bin 을 통해 사용자의 `.claude/` 디렉토리에 주입할 수 있게 해주는 공용 CLI 엔진입니다.

## 개요

컨슈머 패키지는 `package.json` 에 `claude.assetPath` 를 선언하고, 빌드 중 `claude-build-hashes` 를 실행해 `dist/claude-hashes.json` 을 생성합니다. 최종 사용자는 `npx -p @slats/claude-assets-sync inject-claude-settings --package=<name>` 을 실행하고, 이 엔진은 `createRequire` 로 해당 패키지의 메타데이터를 해석해 파일별 SHA-256 매니페스트를 대상 `.claude/` 와 비교하여 변경이 필요한 파일만 복사합니다.

라이브러리는 호출 1회당 정확히 1개의 컨슈머만 처리합니다 — `--package` 로 명시된 그 컨슈머입니다. `node_modules` 탐색도, yarn workspace 열거도 하지 않습니다.

GitHub fetch 없음, `.sync-meta.json` 없음, 마이그레이션 없음 — 컨슈머의 `dist/claude-hashes.json` 이 유일한 진실의 원천입니다.

## 설치

```bash
npm install -D @slats/claude-assets-sync
# or
yarn add -D @slats/claude-assets-sync
```

## CLI 표면

```
inject-claude-settings --package=<name> [--scope=user|project] [--dry-run] [--force] [--root=<cwd>]
claude-build-hashes
```

### 최종 사용자 호출

엔진은 컨슈머의 런타임 의존성으로 배포되지 않습니다. 항상 `npx -p @slats/claude-assets-sync ...` 형태로 호출하세요 — 패키지 매니저가 엔진을 필요 시 받아와 캐시합니다.

```bash
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user
```

| 플래그 | 의미 |
|---|---|
| `--package <name>` | **필수.** `claude.assetPath` 를 선언한 컨슈머의 scoped npm 이름. |
| `--scope=user` | `~/.claude` (모든 프로젝트에 전역 적용). |
| `--scope=project` | 가장 가까운 조상 `.claude` 디렉토리, 없으면 `<cwd>/.claude`. |
| `--dry-run` | copy / skip / warn 플랜만 출력, 쓰기 없음. |
| `--force` | 발산 파일 덮어쓰기 & 고아 파일 삭제 (TTY 에서는 대화형 확인). |
| `--root <path>` | scope 해석용 cwd 재정의. |

**Exit code**: `0` 성공 / up-to-date / dry-run, `1` 런타임 오류, `2` 사용자 / 설정 오류 (`--package` 누락, 비-TTY 환경에서 `--scope` 누락, 해석 불가한 패키지, `claude.assetPath` 누락).

`--scope=project` 의 경우 대상 `.claude` 디렉토리는 `process.cwd()` 에서 위로 올라가며 가장 가까운 기존 `.claude` 조상을 찾아 해석됩니다. 자동 탐지된 경우 CLI 가 `(auto-located)` 로 로그에 표시합니다.

## 컨슈머 통합 (2단계)

### 1. `package.json`

```jsonc
{
  "name": "@your-scope/your-package",
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "claude-build-hashes"
  },
  "devDependencies": {
    "@slats/claude-assets-sync": "workspace:^"
  },
  "files": ["dist", "docs", "README.md"],
  "claude": { "assetPath": "docs/claude" }
}
```

- `@slats/claude-assets-sync` 는 **반드시** `devDependencies` 에 위치 — 엔진은 CLI-only 도구이므로 최종 사용자의 production 설치에 유출되면 안 됩니다. 아래 근거 참조.
- `bin` 필드 절대 추가 금지. 엔진이 유일한 CLI 표면이며, 패키지마다 bin 을 두면 `node_modules/.bin/` 에서 충돌합니다.
- `exports` 에 `./bin/*` 또는 `./docs/*` 절대 노출 금지. 컨슈머 번들러가 CLI 코드나 문서 트리를 앱 번들로 끌어올 수 있습니다.
- 컨슈머에 `bin/` 또는 `scripts/` 디렉토리 생성 금지.

### 2. 빌드

```bash
yarn build
# 라이브러리 rollup → 타입 emit → claude-build-hashes 가 claude.assetPath 하위의
# 모든 파일을 해싱해 dist/claude-hashes.json 기록
```

결과물인 `dist/` (`claude-hashes.json` 포함) 를 `docs/` 와 함께 publish 합니다.

### 근거: `devDependencies`, `dependencies` 아님

- 엔진이 쓰이는 시점은 두 번뿐입니다: (1) 컨슈머의 자체 빌드에서 `claude-build-hashes` 가 `dist/claude-hashes.json` 을 생성할 때, (2) 최종 사용자가 `inject-claude-settings` 을 일회성으로 호출할 때. 두 경우 모두 컨슈머 라이브러리의 런타임 동작이 아닙니다.
- 엔진을 `dependencies` 에 두면 컨슈머를 설치하는 모든 하위 사용자가 `commander`, `@inquirer/prompts` 와 그 transitive 트리를 production `node_modules` 에 강제로 받게 됩니다 — Claude Code 자산을 한 번도 설정하지 않는 사용자에게는 순수한 부담입니다.
- 워크스페이스 빌드 체인은 여전히 `yarn install` 시점에 `devDependencies` 에서 `.bin/claude-build-hashes` 를 resolve 합니다. yarn workspaces 는 workspace-local 빌드에서 devDeps 와 deps 를 동일하게 링크합니다.
- 최종 사용자는 hoist 된 `inject-claude-settings` bin 에 의존하지 않습니다. 표준 호출은 `npx -p @slats/claude-assets-sync inject-claude-settings --package=<THIS>` 이며, 패키지 매니저가 필요 시 엔진을 받아와 캐시합니다.
- 번들 격리는 import 그래프로 강제됩니다 (컨슈머의 `src/**` 가 엔진을 참조하지 않음). dependency-type 으로 강제되는 게 아닙니다.

## `docs/claude/` 작성

어떤 트리 구조든 동작하지만, Claude Code 컨벤션에 맞춘 권장 레이아웃:

```
docs/claude/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── knowledge/...
├── rules/...
└── commands/...
```

asset 루트 하위의 모든 파일은 해시되어 `dist/claude-hashes.json` 에 추적됩니다.

## 해시 기반 동기화 전략 (Option A)

- `dist/claude-hashes.json` (schema v1) 이 유일한 진실의 원천.
- 파일별 SHA-256 비교:
  - **로컬에 없음** → 복사
  - **해시 일치** → 건너뜀
  - **해시 불일치** → 경고 + `--force` 요구 (설계상 사용자 편집 vs 원본 업데이트 구분 없음)
  - **매니페스트 밖이지만 관리 대상 prefix (`skills/<name>/`) 하위에 있는 파일** → 고아; 삭제하려면 `--force` 필요

- TTY 에서의 `--force`: `@inquirer/prompts.confirm` 으로 대화형 확인, 발산/고아 경로 최대 3개 표시.
- 비-TTY 에서의 `--force`: 발산 목록을 stderr 로 출력한 뒤 진행.

## 아키텍처 불변식

- `src/core/**` 는 `package.json` 을 읽거나 filesystem 을 walk 하지 않습니다. `bin/` 계층 (그리고 dispatcher 에서 호출되는 `src/commands/runCli/utils/resolvePackage.ts`) 만이 `createRequire().resolve('${name}/package.json')` 로 **명시된 단일** 타겟을 해석할 수 있습니다. 복수 탐색 (`--all`, workspace scan) 은 지원하지 않습니다.
- 프롬프트는 `@inquirer/prompts` 만 경유합니다. ink / react 금지.
- 엔진은 호출 1회당 컨슈머 1개라는 계약을 유지합니다 — 확장하려면 명시적 재설계 필요.

## 프로그래매틱 API

```ts
import {
  runCli,
  injectDocs,
  readHashManifest,
  resolveScope,
  isInteractive,
  isValidScope,
  computeNamespacePrefixes,
} from '@slats/claude-assets-sync';
```

전체 export 범위는 `src/index.ts` 와 `src/DETAIL.md` 를 참조하세요.

## 추가 문서

- `docs/consumer-integration.md` — 컨슈머 체크리스트 전체 (package.json 패치, 검증 단계, 최종 사용자 설치 토폴로지)
- `docs/bundle-size-decision.md` — 왜 ink 대신 `@inquirer/prompts` 를 선택했는가

## 라이선스

MIT — [LICENSE](./LICENSE) 참조.
