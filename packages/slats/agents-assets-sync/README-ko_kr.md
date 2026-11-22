# @slats/agents-assets-sync

임의의 npm 패키지가 에이전트 문서(skills, rules, commands)를 배포하고, 엔진의 dispatcher CLI를 통해 선택한 에이전트의 목적지에 주입할 수 있게 해주는 공용 엔진입니다.

## 개요

컨슈머 패키지는 `package.json` 에 `agents.assetPath` 를 선언하고, 빌드 중 `agents-build-hashes` 를 실행해 `dist/agents-hashes.json` 을 생성합니다. 최종 사용자는 `npx @slats/agents-assets-sync --package=<name>` 을 실행하고, 이 엔진은 각 컨슈머의 메타데이터를 해석해 파일별 SHA-256 매니페스트를 선택한 목적지와 비교하여 변경이 필요한 파일만 복사합니다.

`--package` 는 scoped 이름 (`@scope/pkg`), unscoped 이름 (`pkg`), 또는 **scope alias** (`@scope` — 슬래시 없음) 를 받습니다. scope alias 는 설치된 `node_modules/@scope/*` 중 `agents.assetPath` 를 선언한 모든 패키지로 전개됩니다. 단일 타깃은 `createRequire` 로 해석되고, scope alias 열거는 `cwd` 에서 상위로 올라가며 각 조상의 `node_modules/@<scope>/` 디렉토리를 훑으며 `runCli/targets/resolveScopeAlias.ts` 에 격리돼 있습니다.

GitHub fetch 없음, `.sync-meta.json` 없음, 마이그레이션 없음 — 컨슈머의 asset 트리 자체가 유일한 진실의 원천이며, 빌드된 `dist/agents-hashes.json` 이 있으면 그것을 읽고 없으면 그 자리에서 해싱합니다.

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

`<bin>`은 두 dispatcher 별칭 중 하나이며 agents-build-hashes는 별도의 빌드 도구입니다:

| Bin                      | 사용 시점                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `agents-assets-sync`     | `npx` 로 호출할 때 — 패키지 unscoped 이름과 일치해서 `npx @slats/agents-assets-sync ...` 가 바로 동작 |
| `inject-agents-settings` | 엔진을 설치 (`yarn add -D` / `npm i -g`) 한 환경에서 명시적인 명령 이름을 선호할 때                   |
| `agents-build-hashes`    | 컨슈머 패키지 빌드 시 보조 도구 (`package.json` 의 scripts 에서 호출)                                 |

### 에이전트별 목적지

`projectRoot`는 `--scope=user`이면 홈 디렉터리입니다. `--scope=project`이면 root marker(`.git`, `pnpm-workspace.yaml`, 또는 `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `npm-shrinkwrap.json`, `bun.lock`, `bun.lockb` lockfile)를 가진 최근접 조상을 우선합니다. 그런 조상이 없으면 `.claude`, `AGENTS.md`, `.agents`, `.codex`를 가진 최근접 조상, 그것도 없으면 cwd입니다. root marker는 더 가까운 agent 디렉터리보다 우선하며 홈 디렉터리와 그 조상의 marker는 무시합니다. 모든 에이전트가 같은 루트를 사용합니다.

| Kind               | claude                       | codex                      | agents                     |
| ------------------ | ---------------------------- | -------------------------- | -------------------------- |
| `skills` (user)    | `~/.claude/skills/**`        | `~/.codex/skills/**`       | `~/.agents/skills/**`      |
| `skills` (project) | `<root>/.claude/skills/**`   | `<root>/.agents/skills/**` | `<root>/.agents/skills/**` |
| `rules` (user)     | `~/.claude/rules/**`         | `~/.codex/AGENTS.md`       | `~/.agents/AGENTS.md`      |
| `rules` (project)  | `<root>/.claude/rules/**`    | `<root>/AGENTS.md`         | `<root>/AGENTS.md`         |
| `commands`         | `<root>/.claude/commands/**` | 미지원                     | 미지원                     |

`agents` 는 제품이 아니라 벤더 중립 `.agents` 규약입니다 — 자체 홈 대신 이 규약을 읽는 도구를 위한 선택지입니다. `codex` 와는 `user` scope 에서만 다르고 프로젝트 레이아웃은 동일합니다.

규칙 파일 하나는 블록 하나가 됩니다. 선두 UTF-8 BOM을 제거하고 CRLF와 단독 CR을 LF로 바꾼 동일한 바이트 정규형으로 검증·쓰기·본문 해시 비교를 수행하므로 다음 실행은 무변경입니다. 그 밖의 바이트는 재인코딩하지 않습니다:

```
<!-- AGENTS-ASSETS-SYNC:START:@canard/schema-form:rules/schema-form-rule.md -->
…정규화한 규칙 바이트…
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
| `--agent <type>`      | **대화형 TTY 밖에서 필수.** `claude`, `codex`, `agents`를 반복 또는 쉼표로 지정합니다.                                                                                                                                                                                                                                    |
| `--asset <kind>`      | `skills`, `rules`, `commands`. 기본값은 모두이며 제외한 종류는 계획·보고·삭제에서 빠집니다.                                                                                                                                                                                                                               |
| `--asset-path <path>` | 각 대상 패키지 루트 기준의 asset 루트 — `agents.assetPath` 를 선언하지 않고 `agents/` 나 `docs/` 같은 디렉토리에 에셋만 둔 패키지를 위한 것. 모든 대상의 선언을 덮어쓰고 그 디렉토리를 실행 시점에 해싱하므로 `dist/agents-hashes.json` 이 필요 없습니다. 상대 경로여야 하고 패키지 안의 실제 디렉토리를 가리켜야 합니다. |
| `--yes`               | force 확인을 화면 없이 승인합니다.                                                                                                                                                                                                                                                                                        |
| `--no-interactive`    | TTY에서도 질문하지 않으며 필수 플래그가 없으면 2로 종료합니다.                                                                                                                                                                                                                                                            |
| `--scope=user`        | 홈 디렉터리(모든 프로젝트에 전역 적용).                                                                                                                                                                                                                                                                                   |
| `--scope=project`     | 에이전트별 목적지에 설명한 프로젝트 루트이며 root marker가 agent anchor보다 우선합니다.                                                                                                                                                                                                                                   |
| `--dry-run`           | copy / skip / warn 플랜만 출력, 쓰기 없음.                                                                                                                                                                                                                                                                                |
| `--force`             | 발산 파일 덮어쓰기 & 고아 파일 삭제 (TTY 에서는 대화형 확인).                                                                                                                                                                                                                                                             |
| `--root <path>`       | scope 해석용 cwd 재정의.                                                                                                                                                                                                                                                                                                  |

**Exit code**: `0` 성공 / up-to-date / dry-run, `1` 런타임 오류, `2` 사용자 / 설정 오류 (`--package` 누락, 비-TTY 환경에서 `--scope` 누락, 해석 불가한 패키지, `--asset-path` 없이 `agents.assetPath` 누락, 절대 경로이거나 패키지 안의 디렉토리를 가리키지 않는 `--asset-path`, 패키지 밖으로 해석되는 asset 루트).

`--scope=project`는 에이전트별 목적지의 root marker 우선순위를 따릅니다. 작업 디렉터리 위의 루트가 자동 탐지되면 CLI는 `(auto-located)`를 표시합니다.

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

비어 있지 않은 agents.assetPath 선언이 없으면 agents-build-hashes는 아무 파일도 만들지 않고 성공합니다. 선언된 디렉터리가 없으면 오류입니다. 매니페스트는 원본 파일 해시와 정규형 ruleBodyHashes를 보관합니다. 이전 매니페스트를 다시 빌드하면 원본 디렉터리 없이 설치된 블록을 비교하는 데 필요한 정규형 해시를 얻습니다.

결과물인 `dist/` (`agents-hashes.json` 포함) 를 `docs/` 와 함께 publish 합니다.

### 근거: `devDependencies`, `dependencies` 아님

- 엔진이 쓰이는 시점은 두 번뿐입니다: (1) 컨슈머의 자체 빌드에서 `agents-build-hashes` 가 `dist/agents-hashes.json` 을 생성할 때, (2) 최종 사용자가 `inject-agents-settings` 을 일회성으로 호출할 때. 두 경우 모두 컨슈머 라이브러리의 런타임 동작이 아닙니다.
- 엔진을 `dependencies` 에 두면 컨슈머를 설치하는 모든 하위 사용자가 `commander`, `ink`, `react`와 그 transitive 트리를 production `node_modules` 에 강제로 받게 됩니다 — Claude Code 자산을 한 번도 설정하지 않는 사용자에게는 순수한 부담입니다.
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

- `dist/agents-hashes.json` (schema v1) 이 있으면 그것이 진실의 원천입니다. 없으면 asset 루트 — 선언된 `agents.assetPath` 또는 `--asset-path` 가 지정한 경로 — 를 실행 시점에 해싱해 같은 문서를 만들므로, 빌드하지 않은 패키지도 주입할 수 있습니다. 선언된 asset 경로에 매니페스트도 디렉토리도 없으면 참조할 원천이 없으므로 그 대상은 보고 후 건너뜁니다.
- 파일별 SHA-256 비교:
  - **로컬에 없음** → 복사
  - **해시 일치** → 건너뜀
  - **해시 불일치** → 경고 + `--force` 요구 (설계상 사용자 편집 vs 원본 업데이트 구분 없음)
  - **매니페스트 밖이지만 관리 대상 prefix (`skills/<name>/`) 하위에 있는 파일** → 고아; 삭제하려면 `--force` 필요

- TTY 에서의 `--force`: Ink 확인 화면으로 발산·고아 경로를 표시합니다.
- 비-TTY 에서의 `--force`: 덮어쓰거나 삭제할 발산/고아 경로를 stderr 로 출력한 뒤 진행. 고아 삭제만 있는 실행도 똑같이 확인하고 출력합니다.
- `--scope=project` 에서는 심볼릭 링크를 통해 프로젝트 밖으로 해석되는 목적지를 그 경로를 명시하고 거부하며, 그곳에는 아무것도 쓰거나 지우지 않습니다. 목적지 루트(`.claude/skills`, `.claude/rules`, `.claude/commands`, `.agents/skills`, `AGENTS.md`), 각 스킬 디렉터리, 그리고 실행이 쓰는 그 아래의 모든 디렉터리와 파일이 대상입니다. 프로젝트 안을 가리키는 링크는 따라가며, `--force` 는 링크를 통해 지우지 않습니다. 저장소는 심볼릭 링크를 커밋할 수 있어서, 받아 온 프로젝트가 쓰기와 `--force` 삭제를 아무 곳으로나 돌릴 수 있기 때문입니다. `--scope=user` 는 이런 링크를 그대로 따릅니다. `~/.claude` 를 dotfiles 저장소로 링크하는 것은 의도된 구성입니다.

## 아키텍처 불변식

- `src/core/**`는 소비자의 package.json을 읽거나 설치된 패키지를 발견하지 않습니다. 해시·검증·계획·적용을 위해 자산과 목적지 파일을 읽습니다. `bin/` 계층 (그리고 dispatcher 에서 호출되는 `src/commands/runCli/targets/resolvePackage.ts`) 만이 `createRequire().resolve('${name}/package.json')` 로 **명시된 단일** 타겟을 해석할 수 있습니다. 스코프 별칭 열거는 dispatcher만 수행하며 `--all`은 지원하지 않습니다.
- 입력 화면은 일반·JSON 출력과 동일한 코어 계획과 적용기에 선택값을 전달합니다.
- 한 실행의 모든 대상은 실행 전체의 계획과 네임스페이스 병합을 공유합니다.

## 프로그래매틱 API

```ts
import {
  computeNamespacePrefixes,
  isValidScope,
  readHashManifest,
  resolveProjectRoot,
  runCli,
} from '@slats/agents-assets-sync';
```

공개 내보내기는 `src/index.ts`와 `src/DETAIL.md`를 참고합니다.

## 추가 문서

- `docs/consumer-integration.md` — 컨슈머 체크리스트 전체 (package.json 패치, 검증 단계, 최종 사용자 설치 토폴로지)
- `docs/bundle-size-decision.md` — 터미널 렌더러 의존성 결정

## JSON 출력

`--json` 은 세 번째 렌더러로 전환해 stdout 에는 문서 **하나만** 쓰고 모든 진단을
stderr 로 돌립니다. 따라서 스트림 전체가 그대로 파싱됩니다.

```json
{
  "schemaVersion": 1,
  "tool": "agents-assets-sync",
  "version": "0.1.0",
  "dryRun": true,
  "exitCode": 0,
  "errors": [],
  "failures": [],
  "notices": [],
  "units": [
    {
      "key": "codex:@canard/schema-form",
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
            "blockId": "@canard/schema-form:rules/schema-form-rule.md"
          }
        }
      ],
      "report": {
        "created": [],
        "updated": [],
        "skipped": [],
        "warnings": [],
        "deleted": [],
        "exitCode": 0
      }
    }
  ]
}
```

`(패키지, 에이전트)` 쌍마다 `unit` 하나입니다. 플래그 오류는 `errors` 에 담기고
`exitCode: 2`, `units` 는 빈 배열이 되므로 읽는 쪽은 항상 파싱할 문서를 받습니다.
unit 의 `requiresForce` 는 적용이 발산 내용을 덮어쓰거나 고아를 삭제하면 `--force`
여부와 무관하게 `true` 입니다. `--force`가 없으면 그런 unit은 미리보기가 아닌 실행을 2로 막습니다. dry-run은 0입니다.
해석할 수 없는 패키지와 gate 실패도 JSON 문서 하나를 출력합니다. failures는 경로·단계·이유를, notices는 실제 적용 작업에서 제외한 삭제 보호 안내를 담습니다.

## 라이선스

MIT — [LICENSE](./LICENSE) 참조.

## 알려진 한계

- 프로그래매틱 API는 ESM 전용입니다. ESM `import` 또는 CommonJS의 동적 `import()`를 사용합니다. `require()`는 export되지 않습니다. TypeScript `nodenext`는 CommonJS 정적 import를 허용할 수 있지만 Node는 거부하므로 타입 검사 통과가 CommonJS 호환성을 보장하지 않습니다.
- 공유 스킬 네임스페이스는 한 실행의 모든 패키지를 합쳐 계획합니다. `--force`에서는 해당 패키지를 함께 지정합니다. 현재 디렉터리 탐색에서 같은 네임스페이스의 다른 패키지 파일을 모두 고아와 구분할 수는 없습니다. 같은 목적지에 서로 다른 내용이 있으면 해당 단위를 오류로 보고하며 그 파일을 쓰지 않습니다.
- 발견·gate 단계도 포함한 실패 참여자가 소유할 수 있는 네임스페이스의 고아는 삭제하지 않습니다. 출력은 참여자와 이유를 명시하며 보호된 삭제는 force 확인에서 제외합니다.
- 덮어쓰기는 mode·owner·group·하드 링크를 보존합니다. 단일 링크이며 소유권을 복원할 수 있으면 원자 교체하고, 그렇지 않으면 in-place 쓰기이므로 crash-atomic하지 않습니다. 읽기 전용 대상과 끊어진 쓰기 링크는 거부합니다.
- 사용자 스코프 AGENTS.md 심볼릭 링크는 대상이 존재할 때만 따라갑니다. 끊긴 링크는 오류로 거부하고 보존하여 dotfiles 링크가 일반 파일로 바뀌지 않게 합니다.

스킬이나 Claude 규칙 파일이 새 버전에서 빠지면 에이전트의 자산 루트에 있는 `agents-assets-sync.json`에 완료된 작업의 경로와 SHA-256을 기록한 파일만 같은 강제 적용 확인에 올립니다. 같은 실행의 다른 작업이 실패해도 완료한 파일 작업은 기록할 수 있습니다. 현재 내용이 기록과 일치해야 하며 기록된 다른 소유자가 있으면 보존합니다. Codex와 agents는 각 관리 규칙 블록에 소유 증거를 기록합니다.

설치 기록 쓰기가 실패하면 명령은 오류를 보고하고 완료한 파일 변경은 보존합니다. 재실행 시 내용이 같은 미기록 파일은 그대로 둡니다. 이 경우 소유권을 기록하려면 해당 파일을 직접 확인한 뒤 다시 설치합니다.

### 규칙 Markdown의 구획

규칙 원본의 코드 fence와 HTML 주석은 닫혀 있어야 합니다. `AGENTS.md`에서 닫히지 않은 fence나 주석 뒤에는 관리 블록을 넣을 수 없습니다. 오류는 파일과 열린 행, 닫는 방법을 명시하며 해당 단위 전체를 쓰지 않고 다른 단위는 계속 처리합니다. 원본이나 문서의 구획을 닫은 뒤 다시 실행합니다. 규칙 본문의 BOM·줄바꿈은 검증·쓰기·비교에 동일한 정규형을 사용하며 그 밖의 바이트와 블록 밖 사용자 내용은 보존합니다. 중첩되거나 짝이 없는 마커는 복구하지 않고 거부합니다. 완전히 닫힌 순차 중복은 읽을 수 있으며 강제 갱신은 최신 사본 하나를 남깁니다. 최상위 backtick·tilde fence와 3칸까지의 들여쓰기, 더 긴 종료 fence를 지원합니다. blockquote·목록 내부 fence와 탭 또는 4칸 이상 들여쓴 fence 구문은 해당 행을 명시하여 거부하므로 최상위로 옮깁니다. HTML 주석 내부 마커는 예제이며 관리 블록이 아닙니다.

스캐너는 CommonMark보다 적은 Markdown 구문을 읽으며, 두 해석이 갈릴 수 있는 곳에서는 추측하지 않고 거부합니다. inline code span은 해석하지 않습니다. blockquote·목록 접두사 뒤의 backtick 세 개는 inline code 안에 있어도 fence로 보며, 주석으로 시작한 행에서는 backtick 안의 `<!--`도 주석을 엽니다. 주석은 `<!--`로 시작하는 행에서만 열립니다. 같은 행에서 닫힌 뒤 다시 열린 주석(`<!-- a --> b <!-- c`)은 Markdown과 HTML이 다르게 읽으므로, 그 안의 관리 마커나 fence 행은 주석을 연 행을 명시하여 거부합니다. 목록은 빈 행 뒤에 내용 열보다 왼쪽인 행이 오거나 최상위 fence·주석·마커 행이 와야 끝나므로, 빈 행 없이 목록을 끊는 제목 뒤에도 fence 검사에는 목록 들여쓰기가 남습니다.
