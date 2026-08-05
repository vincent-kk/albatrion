# injectDocs Specification

## Requirements

- 이 fractal 은 부수효과 전담이다. 계획은 이미 `buildPlan/` 이 만들었고,
  여기서는 그 계획을 실행하고 집계한다. orchestrator 함수는 없다 — 두 렌더러가
  프리미티브를 직접 조합한다.
- `partitionActions` 는 계획을 병렬 가능한 일과 직렬화해야 하는 일로 가른다.
  파일 복사·삭제는 서로 독립이므로 하나의 풀로, 블록 쓰기는 도착 문서별로
  묶인다.
- 블록을 문서별로 묶는 이유는 여러 블록이 보통 하나의 `AGENTS.md` 를 공유하고,
  동시 기록자가 각자 읽은 판본을 저장하면 마지막 하나의 변경만 남기 때문이다.
- 아무것도 바꾸지 않는 판정은 버려진다. `copy` 와 `delete` 는 항상 실행
  가능하고, `warn-diverged` 는 force 가 주어졌을 때에만 실행 가능하다. CLI 의
  "`--force` 는 덮어쓴다" 는 약속이 지켜지는 지점이 바로 여기다.
- `applyAction` 은 `file` 목적지만 다룬다. 블록 목적지가 들어오면 실패하지 않고
  아무것도 하지 않는다 — 계획 전체를 풀에 먹이는 호출자가 실수로 문서를
  망가뜨릴 수 없게 한다.
- `applyAction` 은 `copy` 와 `warn-diverged` 에서 상위 디렉터리를 만들고 소스를
  복사한다. `delete` 에서 `ENOENT` 는 조용히 넘어가고, 그 외 실패만
  `logger.warn` 으로 알린다. 이 한 줄이 `core/**` 전체에서 유일한 출력이다.
- `applyBlockActions` 는 하나의 공유 문서를 한 번의 read-modify-write 로
  처리한다. 문서가 없으면 빈 내용에서 시작하고, 상위 디렉터리를 만들어 쓴다.
- 이 도구의 블록 바깥 내용은 바이트 단위로 살아남는다. 문서는 다른 도구와
  사용자의 땅이기도 하다.
- `summarize` 는 순수하다. 계획이 이미 모든 판정을 담고 있으므로 파일시스템도
  환경변수도 읽지 않는다.
- `skip-uptodate` 와 `skip-unsupported` 는 함께 `skipped` 로 집계되고,
  `warn-diverged` 와 `warn-orphan` 은 사유(`'diverged'` / `'orphan'`)를 단
  `warnings` 로 집계된다.
- `exitCode` 는 호출자가 정해 넘기며 `InjectReport` 를 통해 전파된다.

## API Contracts

- `partitionActions(actions: readonly Action[], force: boolean): { fileActions: Action[]; blockGroups: Map<string, Action[]> }`
  - `blockGroups` 의 키는 문서의 절대 경로
- `applyAction(action: Action, assetRoot: string): Promise<void>`
  - `file` 이외의 목적지에서는 무동작
- `applyBlockActions(fileAbs: string, actions: readonly Action[], assetRoot: string): Promise<void>`
- `summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport`

## Exported Types

- `InjectReport` — `{ created, updated, skipped, warnings, deleted, exitCode }`
  - `warnings: { relPath: string; reason: string }[]`

## Acceptance Criteria

### AC-APPLY-PARTITION — force 가 실행 가능성을 결정한다

- 파일 작업과 블록 작업은 갈라지고, 블록은 도착 문서별로 묶인다.
- 아무것도 바꾸지 않는 판정은 어느 쪽에도 들어가지 않는다.
- `warn-diverged` 는 force 가 주어졌을 때에만 실행 가능해진다.
- Verified by `tests/core/applyActions.test.ts`.

### AC-APPLY-BLOCK — 공유 문서는 한 번에 통째로 쓰인다

- 문서와 그 상위 디렉터리가 없으면 만들어진다.
- 기존 문서에 덧붙일 때 외부 내용은 흐트러지지 않는다.
- 같은 복사를 두 번 적용해도 블록은 하나로 남는다.
- 한 문서에 대한 두 블록은 한 번의 통과로 함께 쓰인다.
- force 아래에서 diverged 블록은 소스 본문으로 덮어써진다.
- 삭제는 지명된 블록만 지우고 외부 블록은 그대로 둔다. 삭제가 문서를 비우면
  문서 내용은 빈 문자열이 된다.
- Verified by `tests/core/applyActions.test.ts`.

### AC-APPLY-FILE — 파일 적용은 자기 몫만 한다

- 복사는 없는 상위 디렉터리를 만들어 가며 수행된다.
- 블록 목적지가 들어오면 무시된다 — 그 일은 `applyBlockActions` 의 몫이다.
- Verified by `tests/core/applyActions.test.ts`.

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성.
