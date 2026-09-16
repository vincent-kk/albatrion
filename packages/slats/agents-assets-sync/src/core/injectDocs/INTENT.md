# injectDocs

## Purpose

Agent asset injection의 적용(apply)과 집계(summarize) 프리미티브. 계획은 `buildPlan/` 이 이미 세웠고, 여기서는 그것을 실행하고 보고서로 접는다. Ink(`ui/`)와 plain(`renderPlain`) 렌더러가 함께 소비하며, orchestrator 는 두지 않는다 — 파이프라인은 호출자가 직접 조립한다.

## Conventions

- 파일 작업과 블록 작업은 갈라서 다룬다. 파일은 풀로 병렬 처리해도 되지만, 한 `AGENTS.md` 를 여러 writer 가 동시에 쓰면 각자 읽은 판본을 저장해 마지막 하나만 남기 때문이다. 이 순차화는 한 실행 안에서만 유효하다 — 잠금이 아니므로 동시에 도는 두 프로세스는 여전히 서로의 블록을 잃는다.
- `warn-diverged` 의 실행 가능 여부는 `partitionActions` 가 결정한다. CLI 의 "`--force` 는 덮어쓴다" 는 약속이 지켜지는 유일한 지점이다.

## Dependencies

적용기는 계획과 마커 변환의 공개 계약을 소비합니다. 파일 삭제 실패를 경고하는 logger 호출만 핵심 연산 계층의 출력 예외로 유지하며, 일반 진행 보고는 렌더러가 담당합니다.

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
