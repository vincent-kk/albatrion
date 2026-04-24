# src

## Purpose

컨슈머 패키지가 얇은 `bin/claude-sync.mjs` 래퍼를 통해 호출하여 자신의
번들된 Claude docs 를 사용자의 `.claude` 디렉토리에 주입하는 공유 CLI 엔진.
Playwright-cli 패턴을 따라: 컨슈머는 래퍼만 소유하고, 이 패키지는 로직을
소유한다.

## Structure

- `index.ts` — 프로그래매틱 public API 배럴
- `main.ts` — 주 bin 진입점 (`claude-sync`); `runCli` 로 포워딩
- `commands/` — commander 핸들러: `runCli`, `listConsumers`, `buildHashesCmd` (fractal-of-fractals)
- `core/` — `hash`, `hashManifest`, `scope`, `buildPlan`, `injectDocs` (fractal-of-fractals)
- `discover/` — workspace + node_modules walker (fractal)
- `prompts/` — `@inquirer/prompts` 기반 scope picker & force confirm (organ)
- `utils/` — logger, asyncPool, heartbeat, types, version (organ)

## Conventions

- TypeScript strict mode, rollup 로 ESM + CJS 듀얼 출력
- `./buildHashes` 서브패스는 build-time 해시 생성을 위한 순수 Node ESM
- `scripts/buildHashes.mjs` 는 rollup 외부에서 작동; 자기 실행 bin 은
  `scripts/claude-build-hashes.mjs` 에 존재

## Boundaries

### Always do

- `core/` 를 UI-free 로 유지; 프롬프트는 `commands/` 에서만 호출
- fractal 간 경계는 반드시 각 sibling 의 `index.ts` 배럴로 통과

### Ask first

- `inject`(기본) / `list` / `build-hashes` 이외의 새 최상위 커맨드 추가
- `RunCliOptions`, `InjectOptions`, `DiscoverOptions` 의 public shape 변경

### Never do

- `ink`/`react` 를 어디에서도 import — `@inquirer/prompts` 가 유일한 프롬프트 표면
- GitHub 페치, `.sync-meta.json`, 혹은 레거시 동기화 상태 재도입
- `core/` 또는 `utils/` 내부에서 `prompts/` 로부터 import
