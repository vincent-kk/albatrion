# @slats/agents-assets-sync

임의의 npm 패키지가 자신의 Claude Code 문서(skills, rules, commands)를 배포하고, 엔진의 dispatcher CLI 를 통해 사용자의 `.claude/` 디렉토리에 주입할 수 있게 해주는 공용 엔진입니다.

## 개요

컨슈머 패키지는 `package.json` 에 `agents.assetPath` 를 선언하고, 빌드 중 `agents-build-hashes` 를 실행해 `dist/agents-hashes.json` 을 생성합니다. 최종 사용자는 `npx @slats/agents-assets-sync --package=<name>` 을 실행하고, 이 엔진은 각 컨슈머의 메타데이터를 해석해 파일별 SHA-256 매니페스트를 대상 `.claude/` 와 비교하여 변경이 필요한 파일만 복사합니다.

`--package` 는 scoped 이름 (`@scope/pkg`), unscoped 이름 (`pkg`), 또는 **scope alias** (`@scope` — 슬래시 없음) 를 받습니다. scope alias 는 설치된 `node_modules/@scope/*` 중 `agents.assetPath` 를 선언한 모든 패키지로 전개됩니다. 단일 타깃은 `createRequire` 로 해석되고, scope alias 열거는 `cwd` 에서 상위로 올라가며 각 조상의 `node_modules/@<scope>/` 디렉토리를 훑으며 `runCli/targets/resolveScopeAlias.ts` 에 격리돼 있습니다.

GitHub fetch 없음, `.sync-meta.json` 없음, 마이그레이션 없음 — 컨슈머의 `dist/agents-hashes.json` 이 유일한 진실의 원천입니다.

## 설치

```bash
npm install -D @slats/agents-assets-sync
# or
yarn add -D @slats/agents-assets-sync
```

## CLI 표면

```
<bin> --package=<name...> [--agent=claude|codex] [--scope=user|project] [--asset=<kind...>]
      [--asset-path=<path>] [--dry-run] [--force] [--yes] [--no-interactive]
      [--root=<cwd>] [--json]
agents-build-hashes
```

`<bin>` 은 동일한 엔진을 가리키는 세 가지 진입점 중 하나입니다:

| Bin                      | 사용 시점                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `agents-assets-sync`     | `npx` 로 호출할 때 — 패키지 unscoped 이름과 일치해서 `npx @slats/agents-assets-sync ...` 가 바로 동작 |
| `inject-agents-settings` | 엔진을 설치 (`yarn add -D` / `npm i -g`) 한 환경에서 명시적인 명령 이름을 선호할 때                   |
| `agents-build-hashes`    | 컨슈머 패키지 빌드 시 보조 도구 (`package.json` 의 scripts 에서 호출)                                 |

### 에이전트별 목적지

`projectRoot` 는 `--scope=user` 이면 홈 디렉터리, `--scope=project` 이면 `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git` 중 하나라도 가진 최근접 조상(없으면 cwd)입니다. 모든 에이전트가 이 루트를 공유하므로 한 번의 실행이 서로 다른 프로젝트에 걸칠 수 없습니다.

| Kind               | claude                       | codex                      | agents                     |
| ------------------ | ---------------------------- | -------------------------- | -------------------------- |
| `skills` (user)    | `~/.claude/skills/**`        | `~/.codex/skills/**`       | `~/.agents/skills/**`      |
| `skills` (project) | `<root>/.claude/skills/**`   | `<root>/.agents/skills/**` | `<root>/.agents/skills/**` |
| `rules` (user)     | `~/.claude/rules/**`         | `~/.codex/AGENTS.md`       | `~/.agents/AGENTS.md`      |
| `rules` (project)  | `<root>/.claude/rules/**`    | `<root>/AGENTS.md`         | `<root>/AGENTS.md`         |
| `commands`         | `<root>/.claude/commands/**` | 미지원                     | 미지원                     |

`agents` 는 제품이 아니라 벤더 중립 `.agents` 규약입니다 — 자체 홈 대신 이 규약을 읽는 도구를 위한 선택지입니다. `codex` 와는 `user` scope 에서만 다르고 프로젝트 레이아웃은 동일합니다.

rule 파일 1개가 블록 1개가 되므로, 블록 본문 해시가 그 파일의 매니페스트 해시와 같고 copy/skip/diverged 판정이 파일 경로와 완전히 동일한 입자도를 갖습니다:

```
<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/schema-form-rule.md -->
…원본 바이트 그대로…
<!-- AGENTS-ASSETS-SYNC:END:@canard/schema-form:rules/schema-form-rule.md -->
```

형식은 해당 파일이 이미 지니고 있는 `FILID:` / `SEIRI:` 마커 규약을 따릅니다. 이 도구의 블록 밖 내용 — 타 도구의 블록, 사람이 쓴 본문 — 은 바이트 단위로 보존됩니다.

### 최종 사용자 호출

엔진은 컨슈머의 런타임 의존성으로 배포되지 않습니다. 표준 npx 형식은 다음과 같습니다:

```bash
# 단일 컨슈머:
npx @slats/agents-assets-sync --package=@canard/schema-form --agent=claude --scope=user

# Scope alias — 설치된 @winglet/* 중 agents.assetPath 를 선언한 모두:
npx @slats/agents-assets-sync --package=@winglet --agent=claude,codex --scope=user

# 선언도 빌드 산출물도 없는 패키지 — 디렉토리를 직접 지정:
npx @slats/agents-assets-sync --package=some-pkg --asset-path=agents --agent=claude --scope=project
```

dispatcher 는 현재 작업 디렉토리 (또는 `--root <path>`) 에서 시작해 `node_modules` 를 filesystem root 까지 거슬러 올라가므로, 호스트 프로젝트의 hoisting 체인 어딘가에 대상 패키지가 설치되어 있으면 동작합니다.

#### 설치 후 호출 (대안)

```bash
yarn add -D @slats/agents-assets-sync
yarn inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user

# 또는 글로벌:
npm i -g @slats/agents-assets-sync
inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user
```

기존 명시 형식 `npx -p @slats/agents-assets-sync inject-agents-settings ...` 도 backward compatibility 를 위해 그대로 동작합니다.

| 플래그                | 의미                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--package <name>`    | **필수.** 반복 지정 / 콤마 구분 가능. `@scope/pkg`, `pkg`, 또는 scope alias `@scope` (설치된 `node_modules/@scope/*` 중 `agents.assetPath` 를 선언한 모든 패키지로 전개) 형식.                                                                                                                                            |
| `--asset-path <path>` | 각 대상 패키지 루트 기준의 asset 루트 — `agents.assetPath` 를 선언하지 않고 `agents/` 나 `docs/` 같은 디렉토리에 에셋만 둔 패키지를 위한 것. 모든 대상의 선언을 덮어쓰고 그 디렉토리를 실행 시점에 해싱하므로 `dist/agents-hashes.json` 이 필요 없습니다. 상대 경로여야 하고 패키지 안의 실제 디렉토리를 가리켜야 합니다. |
| `--scope=user`        | `~/.claude` (모든 프로젝트에 전역 적용).                                                                                                                                                                                                                                                                                  |
| `--scope=project`     | 가장 가까운 조상 `.claude` 디렉토리, 없으면 `<cwd>/.claude`.                                                                                                                                                                                                                                                              |
| `--dry-run`           | copy / skip / warn 플랜만 출력, 쓰기 없음.                                                                                                                                                                                                                                                                                |
| `--force`             | 발산 파일 덮어쓰기 & 고아 파일 삭제 (TTY 에서는 대화형 확인).                                                                                                                                                                                                                                                             |
| `--root <path>`       | scope 해석용 cwd 재정의.                                                                                                                                                                                                                                                                                                  |

**Exit code**: `0` 성공 / up-to-date / dry-run, `1` 런타임 오류, `2` 사용자 / 설정 오류 (`--package` 누락, 비-TTY 환경에서 `--scope` 누락, 해석 불가한 패키지, `--asset-path` 없이 `agents.assetPath` 누락, 절대 경로이거나 패키지 안의 디렉토리를 가리키지 않는 `--asset-path`).

`--scope=project` 의 경우 대상 `.claude` 디렉토리는 `process.cwd()` 에서 위로 올라가며 가장 가까운 기존 `.claude` 조상을 찾아 해석됩니다. 자동 탐지된 경우 CLI 가 `(auto-located)` 로 로그에 표시합니다.

## JSON 출력

`--json` 은 세 번째 렌더러로 전환해 stdout 에는 문서 **하나만** 쓰고 모든 진단을
stderr 로 돌립니다. 따라서 스트림 전체가 그대로 파싱됩니다.

```jsonc
{
  "schemaVersion": 1,
  "tool": "agents-assets-sync",
  "version": "0.1.0",
  "dryRun": true,
  "exitCode": 0,
  "errors": [],
  "units": [
    {
      "package": { "name": "@canard/schema-form", "version": "0.13.2" },
      "agent": "codex",
      "scope": "project",
      "projectRoot": "/repo",
      "destination": "/repo/.agents/skills + /repo/AGENTS.md (codex, project)",
      "requiresForce": false,
      "actions": [
        {
          "kind": "skip-uptodate",
          "relPath": "rules/schema-form-rule.md",
          "target": {
            "kind": "block",
            "fileAbs": "/repo/AGENTS.md",
            "blockId": "@canard/schema-form:rules/schema-form-rule.md",
          },
        },
      ],
      "report": {
        "created": [],
        "updated": [],
        "skipped": [],
        "warnings": [],
        "deleted": [],
        "exitCode": 0,
      },
    },
  ],
}
```

`(패키지, 에이전트)` 쌍마다 `unit` 하나입니다. 플래그 오류는 `errors` 에 담기고
`exitCode: 2`, `units` 는 빈 배열이 되므로 읽는 쪽은 항상 파싱할 문서를 받습니다.
예외는 렌더러 이전 단계의 실패 — 해석 불가한 `--package` — 로, 이때 stdout 은
비고 종료 코드가 판정을 전달합니다.

## 컨슈머 통합 (2단계)

### 1. `package.json`

```jsonc
{
  "name": "@your-scope/your-package",
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "agents-build-hashes",
  },
  "devDependencies": {
    "@slats/agents-assets-sync": "workspace:^",
  },
  "files": ["dist", "docs", "README.md"],
  "agents": { "assetPath": "docs/agents" },
}
```

- `@slats/agents-assets-sync` 는 **반드시** `devDependencies` 에 위치 — 엔진은 CLI-only 도구이므로 최종 사용자의 production 설치에 유출되면 안 됩니다. 아래 근거 참조.
- `bin` 필드 절대 추가 금지. 엔진이 유일한 CLI 표면이며, 패키지마다 bin 을 두면 `node_modules/.bin/` 에서 충돌합니다.
- `exports` 에 `./bin/*` 또는 `./docs/*` 절대 노출 금지. 컨슈머 번들러가 CLI 코드나 문서 트리를 앱 번들로 끌어올 수 있습니다.
- 컨슈머에 `bin/` 또는 `scripts/` 디렉토리 생성 금지.

### 2. 빌드

```bash
yarn build
# 라이브러리 rolldown → 타입 emit → agents-build-hashes 가 agents.assetPath 하위의
# 모든 파일을 해싱해 dist/agents-hashes.json 기록
```

결과물인 `dist/` (`agents-hashes.json` 포함) 를 `docs/` 와 함께 publish 합니다.

### 근거: `devDependencies`, `dependencies` 아님

- 엔진이 쓰이는 시점은 두 번뿐입니다: (1) 컨슈머의 자체 빌드에서 `agents-build-hashes` 가 `dist/agents-hashes.json` 을 생성할 때, (2) 최종 사용자가 `inject-agents-settings` 을 일회성으로 호출할 때. 두 경우 모두 컨슈머 라이브러리의 런타임 동작이 아닙니다.
- 엔진을 `dependencies` 에 두면 컨슈머를 설치하는 모든 하위 사용자가 `commander`, `@inquirer/prompts` 와 그 transitive 트리를 production `node_modules` 에 강제로 받게 됩니다 — Claude Code 자산을 한 번도 설정하지 않는 사용자에게는 순수한 부담입니다.
- 워크스페이스 빌드 체인은 여전히 `yarn install` 시점에 `devDependencies` 에서 `.bin/agents-build-hashes` 를 resolve 합니다. yarn workspaces 는 workspace-local 빌드에서 devDeps 와 deps 를 동일하게 링크합니다.
- 최종 사용자는 hoist 된 `inject-agents-settings` bin 에 의존하지 않습니다. 표준 호출은 `npx @slats/agents-assets-sync --package=<THIS>` 이며, 패키지 매니저가 필요 시 엔진을 받아와 캐시합니다.
- 번들 격리는 import 그래프로 강제됩니다 (컨슈머의 `src/**` 가 엔진을 참조하지 않음). dependency-type 으로 강제되는 게 아닙니다.

## `docs/agents/` 작성

어떤 트리 구조든 동작하지만, Claude Code 컨벤션에 맞춘 권장 레이아웃:

```
docs/agents/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── knowledge/...
├── rules/...
└── commands/...
```

asset 루트 하위의 모든 파일은 해시되어 `dist/agents-hashes.json` 에 추적됩니다.

## 해시 기반 동기화 전략 (Option A)

- `dist/agents-hashes.json` (schema v1) 이 유일한 진실의 원천.
- 파일별 SHA-256 비교:
  - **로컬에 없음** → 복사
  - **해시 일치** → 건너뜀
  - **해시 불일치** → 경고 + `--force` 요구 (설계상 사용자 편집 vs 원본 업데이트 구분 없음)
  - **매니페스트 밖이지만 관리 대상 prefix (`skills/<name>/`) 하위에 있는 파일** → 고아; 삭제하려면 `--force` 필요

- TTY 에서의 `--force`: `@inquirer/prompts.confirm` 으로 대화형 확인, 발산/고아 경로 최대 3개 표시.
- 비-TTY 에서의 `--force`: 발산 목록을 stderr 로 출력한 뒤 진행.

## 아키텍처 불변식

- `src/core/**` 는 `package.json` 을 읽거나 filesystem 을 walk 하지 않습니다. `bin/` 계층 (그리고 dispatcher 에서 호출되는 `src/commands/runCli/targets/resolvePackage.ts`) 만이 `createRequire().resolve('${name}/package.json')` 로 **명시된 단일** 타겟을 해석할 수 있습니다. 복수 탐색 (`--all`, workspace scan) 은 지원하지 않습니다.
- 프롬프트는 `@inquirer/prompts` 만 경유합니다. ink / react 금지.
- 엔진은 호출 1회당 컨슈머 1개라는 계약을 유지합니다 — 확장하려면 명시적 재설계 필요.

## 프로그래매틱 API

```ts
import {
  computeNamespacePrefixes,
  injectDocs,
  isInteractive,
  isValidScope,
  readHashManifest,
  resolveScope,
  runCli,
} from '@slats/agents-assets-sync';
```

전체 export 범위는 `src/index.ts` 와 `src/DETAIL.md` 를 참조하세요.

## 추가 문서

- `docs/consumer-integration.md` — 컨슈머 체크리스트 전체 (package.json 패치, 검증 단계, 최종 사용자 설치 토폴로지)
- `docs/bundle-size-decision.md` — 왜 ink 대신 `@inquirer/prompts` 를 선택했는가

## 라이선스

MIT — [LICENSE](./LICENSE) 참조.
