# runCli

## Purpose

최상위 `claude-sync` CLI 드라이버. 공유 commander 루트에 기본 inject 액션과
`list`, `build-hashes` 하위 커맨드를 등록하고, 해석된 타겟 집합을
`core/inject` 로 디스패치한다.

## Structure

- `index.ts` — 배럴 export (`runCli`, `RunCliOptions`, `DefaultFlags`)
- `runCli.ts` — commander 루트 + 하위 커맨드 등록
- `types.ts` — `RunCliOptions`, `DefaultFlags`
- `utils/runInject.ts` — 기본 액션 오케스트레이터 (discover → targets → inject)
- `utils/resolveTargets.ts` — 플래그/cwd/invokedFromBin 기반 타겟 선택
- `utils/resolveCwdPackageName.ts` — cwd 를 소유한 가장 깊은 컨슈머
- `utils/isPathInside.ts` — sibling-prefix 안전 path 접두 검사
- `utils/resolveInvokedPackageName.ts` — `import.meta.url` 에서 위로 탐색
- `utils/injectOne.ts` — heartbeat + force confirm 포함 per-target inject
- `utils/resolveScopeFlag.ts` — 스코프 플래그 → 프롬프트 폴백

## Boundaries

### Always do

- 모든 종료 경로에서 `process.exit(0 | 1 | 2)` 로 끝내기
- 긴 inject 는 이 레이어에서 `startHeartbeat` 로 감싸기 (core 는 tick-free)

### Ask first

- `list` / `build-hashes` 이외의 새 하위 커맨드 추가
- `--all`, `--package`, cwd, `invokedFromBin` 우선 순위 변경

### Never do

- `@inquirer/prompts` 직접 호출; `prompts/` 어댑터 사용
- `core/` 내부 파일에서 import; 반드시 `core/index.ts` 배럴 경유
