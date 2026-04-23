# commands Specification

## Requirements

- `runCli` 는 최상위 드라이버다: 기본 액션은 컨슈머를 discover 하고 inject 를
  실행하며, `list` 는 이를 열거하고, `build-hashes` 는 `dist/claude-hashes.json`
  을 생성한다.
- 기본 inject 플래그: `--package`, `--all`, `--scope <user|project|local>`,
  `--dry-run`, `--force`, `--root`, `--no-workspaces`.
- `list` 플래그: `--json`, `--root`.
- `build-hashes [pkgRoot]` 는 `<pkgRoot>/dist/claude-hashes.json` 에 매니페스트를
  쓴다 (pkgRoot 기본값은 `process.cwd()`).
- `--scope` 생략 시: TTY 는 `selectScopeAsync` 로 대화형 피커 실행,
  non-TTY 는 오류 출력 후 exit 2.
- `--force` 가 diverged/orphan 액션과 함께 설정되면: TTY 는
  `confirmForceAsync` 를 열고, non-TTY 는 타겟 리스트를 stderr 로 방출한 뒤
  조용히 진행.
- `--package` / `--all` 없이 복수 컨슈머가 발견되면 exit 2 로 사용 가능 리스트 출력.

## API Contracts

- `runCli(argv: readonly string[], options?: RunCliOptions): Promise<void>`
  - `RunCliOptions` = `{ version?, invokedFromBin? }`
- `listConsumers(opts: ListOptions): Promise<void>`
  - `ListOptions` = `{ cwd?, json? }`
- `buildHashesCmd(opts: BuildHashesCmdOptions): Promise<void>`
  - `BuildHashesCmdOptions` = `{ packageRoot }`

## Last Updated

2026-04-24
