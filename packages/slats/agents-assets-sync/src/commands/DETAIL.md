# commands Specification

## Requirements

- `runCli(argv)` 는 유일한 CLI 진입점이다. argv 에서 `--package <name...>` 을 읽어 각 값을 분류하고, 디스패처 계층 (`runCli/targets/resolvePackage.ts` — 단일 패키지, `runCli/targets/resolveScopeAlias.ts` — scope alias) 을 통해 모든 target 을 해석한다. 이 계층은 미리 해석된 메타데이터를 받지 않는다.
- 플래그: `--package <name...>`, `--agent <type...>`, `--scope <user|project>`, `--asset <kind...>`, `--dry-run`, `--force`, `--yes`, `--no-interactive`, `--root`, `--json`.
- `--scope` 는 설정을 쓸 위치를 고르는 것이지 npm scope 선택자가 아니다.
- 렌더러 선택은 `runCli/renderers/renderOrFallback.ts` 한 곳에서, 실행당 한 번만 일어난다. 순서가 계약이다:
  - `--json` → `renderJson` (TTY 여부와 무관하게 먼저 이긴다)
  - 그 외에 비TTY 이거나 `--no-interactive` → `renderPlain`
  - 나머지 (TTY 이면서 프롬프트가 허용됨) → `ui/` 를 동적 import 하여 `renderInjectApp(input)`
- 프롬프트가 불가능하거나 금지된 경로에서 필수 플래그가 없으면 묻지 않고 2로 종료한다. `--scope` 와 `--agent` 가 그 대상이다.
- 플래그 검증기는 두 형태로 존재한다. `resolve*Flag` 는 진단을 찍고 `process.exit(2)` 하고, `parse*Flag` 는 같은 검증을 하되 실패를 값으로 돌려준다. `--json` 렌더러는 후자를 쓴다 — 여기서 종료하면 자기가 소유한 문서가 쓰이지 않은 채 남기 때문이다.
- `--force` 와 diverged/orphan 이 함께일 때: TTY 는 Ink `ConfirmForce` 를 열고(`--yes` 면 건너뜀), 비대화형은 대상 목록을 stderr 로 내보내고 진행한다.
- `dist/agents-hashes.json` 이 없으면 plain 경로는 경고하고 건너뛰며, Ink 경로는 `useInjectSession` 을 통해 실패한 plan step 으로 표면화한다.
- 단일 target 과 배치의 종료 정책은 `runCli/DETAIL.md` 가 정의한다.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
  - 두 번째 인자가 없다. 모든 메타데이터는 argv 에서 해석된다.
- `DefaultFlags` (재수출):
  - `package?: string[]`, `agent?: string[]`, `scope?: string`, `asset?: string[]`, `dryRun?: boolean`, `force?: boolean`, `yes?: boolean`, `interactive?: boolean`, `root?: string`, `json?: boolean`
  - `interactive` 는 commander 의 `--no-interactive` 관례를 따른다. 플래그가 없으면 `true` 로 남고, `false` 일 때 프롬프트가 금지된다.

## Acceptance Criteria

`--package` 값의 분류와 단일 패키지 해석, scope alias 열거의 승인 그룹은 `runCli/DETAIL.md` 가 소유한다. 대상 단위(`classifyTarget`, `resolvePackage`, `resolveScopeAlias`)가 `runCli/targets/` 에 있고, 그 spec-document 도 `runCli/__tests__/` 에서 마커로 결속하기 때문이다.

### AC-CMD-RENDERER — 렌더러는 한 번, 정해진 순서로 선택된다

- `--json` 이 있으면 TTY 여부와 무관하게 JSON 렌더러가 선택된다.
- 비TTY 이거나 `--no-interactive` 이면 plain 렌더러가 선택된다.
- 그 외 TTY 실행에서만 `ui/` 가 동적 import 된다.
- 비대화형 경로에서 `--scope` 나 `--agent` 가 없으면 묻지 않고 2로 종료한다.
- Verified by `src/__tests__/cli.test.ts`, `src/__tests__/json.test.ts`.

## History

- 2026-08-06 — `--json` 이 plain 경로를 강제한다는 계약이 폐기됐다. 이제 `renderJson` 이라는 독립 렌더러가 있고, `renderOrFallback` 에서 `--json` 분기가 TTY 분기보다 먼저 온다.

## Last Updated

2026-08-06 — 계약을 현행 구현에 맞춰 재작성. `--agent`, `--asset`, `--yes`, `--no-interactive` 를 플래그 목록에 추가하고, `resolve*Flag` / `parse*Flag` 두 형태의 존재 이유를 명시하고, Acceptance Criteria 를 도입했다.
