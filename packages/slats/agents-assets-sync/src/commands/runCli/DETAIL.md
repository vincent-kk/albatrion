# runCli Specification

## Requirements

- `runCli(argv)` 는 유일한 CLI 진입점이며, argv 에서 `--package <name...>` 을
  읽는다. 미리 해석된 메타데이터는 받지 않는다.
- `--package` 는 세 가지 모양을 받는다:
  - `@<scope>` — 그 npm scope 아래 설치된 패키지를 열거
  - `@<scope>/<name>` — scoped 패키지 하나
  - `<name>` — unscoped 패키지 하나
  그 밖의 모양은 파일시스템 IO 이전에 2로 종료한다.
- 모든 가변 플래그는 하나의 수집기를 공유한다. 플래그 반복과 쉼표 구분이
  같은 결과를 낸다 — `--flag a,b --flag c` 와 `--flag a --flag b --flag c`.
- 플래그: `--package <name...>`, `--agent <type...>`, `--scope <user|project>`,
  `--asset <kind...>`, `--dry-run`, `--force`, `--yes`, `--no-interactive`,
  `--root <path>`, `--json`.
- `--package` 값이 하나도 없으면 2로 종료한다. 해석된 패키지가 0개면 경고만
  남기고 0으로 끝난다 — 아무 일도 하지 않은 것은 실패가 아니다.
- `renderOrFallback` 은 target 해석 이후 실행당 정확히 한 번 호출되며 렌더러
  분기를 소유한다. 분기 순서: `--json` → `renderJson`; 비TTY 이거나
  `flags.interactive === false` → `renderPlain`; 나머지 → `ui/` 동적 import.
  패키지가 ESM 전용이므로 `await import()` 로 충분하다.
- `renderOrFallback` 의 `env.isTTY` 는 테스트를 위해 주입 가능하며, 생략 시
  `process.stdout.isTTY` 를 쓴다.
- `--json` 이 켜지면 액션 진입 즉시 `divertLogsToStderr()` 가 호출된다. 이후의
  모든 진단은 — 종료 경로의 것까지 — stderr 로 간다. stdout 은 JSON 문서만의
  것이다.
- 비대화형 경로의 필수 플래그 검증은 `resolveScopeFlag` / `resolveAgentFlag` /
  `resolveAssetFlag` 가 맡아 실패 시 2로 종료한다. `--json` 렌더러는 대신
  `parse*Flag` 를 써서 실패를 값으로 받아 자기 문서에 담는다.
- asset 누락 정책은 `--package` 값의 개수로 갈린다. 값이 정확히 하나이고 그
  값이 패키지 이름이면 strict 다 — `agents.assetPath` 가 없으면 2로 종료한다.
  값이 여럿이면 soft skip 이라 나머지 배치가 계속된다.
- scope alias 는 언제나 soft skip 으로 열거된다. workspace 안의 어떤 패키지가
  asset 을 선언하지 않는 것은 정상이기 때문이다.
- scope 열거는 `<cwd>/node_modules/@<scope>/*` 를 파일시스템 루트까지 거슬러
  올라가며 훑는다. 디렉터리 이름은 선언된 패키지 이름과 다를 수 있으므로
  권위는 `package.json` 의 `name` 필드에 있고, 중첩 설치는 nearest-wins 로
  중복 제거된다.
- scope 열거는 `utils/resolveScopeAlias.ts` 안에만 있다. `runCli/**` 의 다른
  어떤 파일도 형제 `package.json` 을 읽지 않는다.
- 해석된 target 은 렌더링 전에 `packageName` 으로 중복 제거된다.
- commander 의 program name 은 런타임에 `argv[1]` 의 basename 에서 파생된다.
  `npx @slats/agents-assets-sync` 와 설치된 `inject-agents-settings` 가 각각
  자기 이름으로 도움말과 오류를 낸다.
- 렌더러가 0이 아닌 코드를 돌려주면 그 코드로 프로세스가 종료된다.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
- `DefaultFlags`
  - `package?: string[]` (가변; 값 0개 → exit 2)
  - `agent?: string[]` (가변; 빈 값은 "묻거나 거부")
  - `scope?: string`, `asset?: string[]`, `root?: string`
  - `dryRun?: boolean`, `force?: boolean`, `yes?: boolean`, `json?: boolean`
  - `interactive?: boolean` — commander `--no-interactive` 관례. 플래그가
    없으면 `true`.
- `classifyTarget(value)` → scope | package | invalid
- `resolvePackage(name, opts?, originCwd?): Promise<ResolvedMetadata | null>`
  - 2단 해석: cwd 기준 require 를 먼저 (`npx -p` 로 불렸을 때 호스트
    프로젝트의 `node_modules` 를 잡기 위해), 실패하면 엔진 기준 require.
    `originCwd` 생략 시 `process.cwd()`.
- `resolveScopeAlias(scope, rootCwd): Promise<ResolvedMetadata[]>`
- `resolveTargets(targets, rootCwd): Promise<ResolvedMetadata[]>`
- `toConsumerPackages(metadata): Promise<ConsumerPackage[]>`
- `renderOrFallback(targets, flags, originCwd, env?): Promise<number>`
- `renderPlain(targets, flags, originCwd): Promise<number>`
- `renderJson(targets, flags, originCwd): Promise<number>`
- `resolveScopeFlag` / `resolveAgentFlag` / `resolveAssetFlag` — 실패 시 exit 2
- `parseScopeFlag` / `parseAgentFlag` / `parseAssetFlag` — 실패를 값으로 반환

## Acceptance Criteria

### AC-RUNCLI-TARGET — `--package` 값의 분류와 해석

- 세 가지 유효한 모양은 각각 scope alias, scoped 패키지, unscoped 패키지로
  분류되고, 나머지는 invalid 로 2를 낸다.
- scoped/unscoped 패키지는 `<originCwd>/node_modules` 에서 먼저 찾고, 없으면
  조상 `node_modules` 로 올라가며, 그래도 없으면 엔진 기준으로 대체한다.
- 둘 다 일치 가능하면 cwd 기준 해석이 이긴다.
- Verified by `tests/commands/classifyTarget.spec.ts`,
  `tests/commands/resolvePackage.spec.ts`.

### AC-RUNCLI-SCOPE-ALIAS — scope 열거의 권위는 선언된 이름이다

- 조상 `node_modules` 를 따라 올라가며 수집하고, scope 디렉터리가 없는
  레벨은 건너뛴다.
- 디렉터리 basename 이 아니라 선언된 `name` 이 권위이며, 다른 scope 로
  선언된 항목은 걸러진다.
- 점으로 시작하는 항목, `package.json` 이 없거나 깨진 항목, `name` 이
  문자열이 아닌 항목은 건너뛴다.
- 중복은 nearest-wins 로 제거되고 발견 순서(가까운 조상 우선)가 유지된다.
- 일치가 0건이면 2로 종료한다.
- Verified by `tests/commands/resolveScopeAlias.spec.ts`.

### AC-RUNCLI-DISPATCH — 렌더러 분기와 무프롬프트 구동

- `--package`, `--agent`, `--scope` 를 주면 비TTY 에서 아무것도 묻지 않고
  완료된다.
- 비TTY 에서 `--agent` 가 없으면 2로 종료한다.
- 알 수 없는 `--agent` / `--asset` 값은 2로 종료한다.
- `--agent=claude,codex` 는 agent 당 하나씩의 구간을 전사(transcript)에 낸다.
- `--asset=skills` 는 `AGENTS.md` 항목을 계획에서 통째로 없앤다.
- Verified by `tests/e2e/cli.test.ts`.

### AC-RUNCLI-JSON-STREAM — `--json` 은 stdout 을 독점한다

- `--json` 실행의 stdout 전체가 하나의 JSON 객체로 파싱된다.
- 플래그 오류는 느슨한 텍스트가 아니라 `exitCode: 2` 인 문서로 보고된다.
- 렌더러에 닿기 전에 실패하면 stdout 은 비고 진단은 stderr 로만 나간다.
- Verified by `tests/e2e/json.test.ts`.

## History

- 2026-08-06 — `--json` 이 plain 경로를 강제한다는 계약이 폐기됐다.
  `renderJson` 이 독립 렌더러가 되었고, 분기에서 `--json` 이 TTY 판정보다
  먼저 평가된다. 같은 변경으로 `parse*Flag` 계열이 생겼다 — JSON 렌더러는
  플래그 오류에서 종료할 수 없고 그것을 자기 문서에 담아야 하기 때문이다.

## Last Updated

2026-08-06 — 계약을 현행 구현에 맞춰 재작성. 렌더러 분기 순서, asset 누락
정책의 실제 판정 기준(`--package` 값 개수), `divertLogsToStderr`, program
name 파생을 명시하고 Acceptance Criteria 를 도입했다.
