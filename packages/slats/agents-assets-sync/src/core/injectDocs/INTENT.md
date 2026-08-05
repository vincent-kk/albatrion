# injectDocs

## Purpose

Agent asset injection의 적용(apply)과 집계(summarize) 프리미티브. 계획은 `buildPlan/` 이 이미 세웠고, 여기서는 그것을 실행하고 보고서로 접는다. Ink(`ui/`)와 plain(`renderPlain`) 렌더러가 함께 소비하며, orchestrator 는 두지 않는다 — 파이프라인은 호출자가 직접 조립한다.

## Structure

- `index.ts` — 배럴 export
- `type.ts` — `InjectReport`
- `utils/partitionActions.ts` — 실행 가능한 일을 파일/문서별로 분류
- `utils/applyAction.ts` — `file` 목적지 한 건의 파일시스템 변경
- `utils/applyBlockActions.ts` — 공유 문서 하나를 한 번에 read-modify-write
- `utils/summarize.ts` — `InjectPlan` → `InjectReport` 집계

## Conventions

- 파일 작업과 블록 작업은 갈라서 다룬다. 파일은 풀로 병렬 처리해도 되지만, 한 `AGENTS.md` 를 여러 writer 가 동시에 쓰면 각자 읽은 판본을 저장해 마지막 하나만 남기 때문이다.
- `warn-diverged` 의 실행 가능 여부는 `partitionActions` 가 결정한다. CLI 의 "`--force` 는 덮어쓴다" 는 약속이 지켜지는 유일한 지점이다.

## Dependencies

- `buildPlan/`(`Action`, `InjectPlan`)과 `markerBlock/`(블록 쓰기)을 각 `index.ts` 로 소비한다. `utils/logger.ts` 는 `applyAction` 의 unlink 실패 경고 한 줄에만 쓰이며, 이것이 `core/**` 전체의 유일한 출력이다.

## Boundaries

### Always do

- `applyAction` 은 `file` 목적지만 처리하고, 블록 목적지는 실패 없이 무시
- `summarize` 를 순수하게 유지 — 파일시스템도 환경변수도 읽지 않는다
- `InjectReport.exitCode` 로 종료 코드(0 / 1 / 2)를 전파

### Ask first

- `Action.kind` 추가 — 호출자들을 함께 고쳐야 한다
- orchestrator 함수 재도입; 지금은 두 렌더러가 프리미티브를 조립한다

### Never do

- `commands/` 나 `ui/` 에서 import
- `printPlan` / `emitCiForceList` 재도입 — 렌더러의 책임이다
- `.sync-meta.json` 등 레거시 동기화 상태 재도입
