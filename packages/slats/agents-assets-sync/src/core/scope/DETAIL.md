# scope Specification

## Requirements

- `resolveProjectRoot`는 하나의 절대 경로만 답한다. 이 루트는
  agent-neutral 이므로 한 번의 실행에서 여러 agent 를 선택해도 서로 다른
  프로젝트에 쓰는 일이 생기지 않는다.
- `user` scope 는 `cwd` 를 완전히 무시하고 `homedir()` 를 답하며,
  `autoLocated` 는 항상 `false` 다.
- `project` scope 는 `cwd` 부터 시작해 파일시스템 루트까지 올라가며 anchor 를
  소유한 첫 디렉터리를 택한다. `cwd` 자신이 첫 후보다.
- anchor 를 가진 조상이 없으면 `cwd` 를 루트로 삼는다. 호출은 언제나 사용
  가능한 루트를 돌려주며 실패하지 않는다.
- `autoLocated` 는 `cwd` 가 아닌 조상이 선택되었을 때에만 `true` 다. 렌더러가
  "쓰기가 어디로 가는지" 를 사용자에게 알릴 수 있게 하는 신호다.
- anchor 판정은 존재 여부만 본다. 디렉터리 검사를 하지 않는 이유는
  `AGENTS.md` 가 파일이고, worktree 나 submodule 안에서는 `.git` 도
  디렉터리가 아니라 파일이기 때문이다.
- 모듈 전체가 동기이고 결정적이다. 읽는 것은 `cwd` 와 `homedir` 뿐이며
  네트워크나 비동기 IO 를 쓰지 않는다.
- agent 별 경로는 여기서 계산하지 않는다. `(agent, scope)` → 위치 변환은
  `agentTarget/` 의 책임이다.

## API Contracts

- `resolveProjectRoot(scope: Scope, cwd?: string): ProjectRootResolution`
  - `cwd` 생략 시 `process.cwd()`
- `findNearestAnchorAncestor(start: string): string | null`
  - anchor 소유 조상이 없으면 `null`
- `isValidScope(value: unknown): value is Scope`
- `PROJECT_ANCHORS: readonly ['.claude', 'AGENTS.md', '.agents', '.codex', '.git']`
  - 순서는 판정에 영향을 주지 않는다. 첫 일치에서 통과한다.
- `hasAnchor(dir: string): boolean`

## Exported Types

- `Scope = 'user' | 'project'`
- `ProjectRootResolution = { scope, projectRoot, autoLocated }`

## Acceptance Criteria

### AC-SCOPE-WALK — 가장 가까운 anchor 조상이 루트가 된다

- 여러 조상이 anchor 를 가질 때, `project` scope 를 해석하면 가장 깊은
  (가장 가까운) 조상이 루트가 된다.
- 중간 레벨이 anchor 를 갖지 않아도 탐색은 멈추지 않고 계속 올라간다.
- anchor 가 디렉터리인 경우에도 인식된다.
- Verified by `tests/core/scope.test.ts`.

### AC-SCOPE-RESOLVE — 해석 결과와 autoLocated

- `cwd` 위의 조상이 선택되면 `autoLocated` 는 `true` 이고 `projectRoot` 는
  그 조상이다.
- anchor 를 가진 조상이 하나도 없으면 `projectRoot` 는 `cwd` 이고
  `autoLocated` 는 `false` 다.
- `user` scope 는 홈 디렉터리를 답하며 `autoLocated` 는 결코 `true` 가
  되지 않는다.
- Verified by `tests/core/scope.test.ts`.

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성. `PROJECT_ANCHORS` 는 5개이며
`.agents` 를 포함한다.
