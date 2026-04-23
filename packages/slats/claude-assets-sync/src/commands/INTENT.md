# commands

## Purpose

Commander 액션 핸들러. 최상위 `claude-sync` CLI(`runCli`), `list` 열거기,
`build-hashes` 하위 커맨드를 core 엔진에 바인드한다. 모든 하위 커맨드는
`runCli` 내부에서 만들어진 동일한 commander 루트를 공유한다.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — 모든 public 심볼을 재-export 하는 집계 배럴
- `runCli/` — 최상위 `claude-sync` CLI (기본 액션 + 하위 커맨드 와이어링)
- `listConsumers/` — `claude-sync list` 표/JSON 핸들러
- `buildHashesCmd/` — `claude-sync build-hashes [pkgRoot]` 핸들러

## Boundaries

### Always do

- 모든 사용자 대상 오류는 문서화된 exit code 0 / 1 / 2 매핑에 따라
  `process.exit(<code>)` 로 라우팅
- `startHeartbeat` 는 이 커맨드 레이어에서 사용 (core 는 tick-free 유지)

### Ask first

- `list`, `build-hashes` 이외의 하위 커맨드 추가
- per-consumer 레거시 진입점 재도입 (대신 `runCli` 사용)

### Never do

- `@inquirer/prompts` 직접 import; 프롬프트는 반드시 `prompts/` 경유
- sub-fractal 내부 파일로 접근; 항상 sibling `index.ts` 통해 접근
