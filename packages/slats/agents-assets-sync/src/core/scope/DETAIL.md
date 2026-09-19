# scope Specification

## Requirements

- `resolveProjectRoot`는 하나의 절대 경로만 답한다. 이 루트는 agent-neutral 이므로 한 번의 실행에서 여러 agent 를 선택해도 서로 다른 프로젝트에 쓰는 일이 생기지 않는다.
- `user` scope 는 `cwd` 를 완전히 무시하고 `homedir()` 를 답하며, `autoLocated` 는 항상 `false` 다.
- `project` scope 는 `cwd` 부터 파일시스템 루트까지 두 단계로 판정한다. 먼저 root marker 를 소유한 가장 가까운 조상을 택하고, 그런 조상이 하나도 없을 때에만 agent anchor 를 소유한 가장 가까운 조상을 택한다. 각 단계에서 `cwd` 자신이 첫 후보다.
- root marker 가 agent anchor 를 이기는 이유: `.claude` 같은 anchor 는 도구가 workspace 멤버를 포함해 어느 디렉터리에나 만들 수 있지만, lockfile · workspace manifest · `.git` 은 패키지 매니저와 저장소가 스스로 루트로 삼는 자리에만 놓인다. 모노레포든 단일 패키지 저장소든 같은 규칙으로 루트에 닿는다.
- 홈 디렉터리 또는 그 조상이 소유한 root marker 는 세지 않는다. dotfiles 저장소의 `~/.git` 이나 떠돌이 lockfile 은 사용자 설정의 것이지 그 아래 프로젝트의 것이 아니며, 이를 세면 `project` scope 가 조용히 홈 디렉터리에 쓰게 된다.
- marker 도 anchor 도 가진 조상이 없으면 `cwd` 를 루트로 삼는다. 호출은 언제나 사용 가능한 루트를 돌려주며 실패하지 않는다.
- `autoLocated` 는 `cwd` 가 아닌 조상이 선택되었을 때에만 `true` 다. 렌더러가 "쓰기가 어디로 가는지" 를 사용자에게 알릴 수 있게 하는 신호다.
- anchor 판정은 존재 여부만 본다. 디렉터리 검사를 하지 않는 이유는 `AGENTS.md` 가 파일이고, worktree 나 submodule 안에서는 `.git` 도 디렉터리가 아니라 파일이기 때문이다.
- 모듈 전체가 동기이고 결정적이다. 읽는 것은 `cwd` 와 `homedir` 뿐이며 네트워크나 비동기 IO 를 쓰지 않는다.
- agent 별 경로는 여기서 계산하지 않는다. `(agent, scope)` → 위치 변환은 `agentTarget/` 의 책임이다.

## API Contracts

- `resolveProjectRoot(scope: Scope, cwd?: string): ProjectRootResolution`
  - `cwd` 생략 시 `process.cwd()`
- `findProjectRoot(start: string): string | null`
  - 2단 판정. marker 도 anchor 도 없으면 `null`
- `findMarkerRoot(start: string): string | null`
  - 홈 디렉터리보다 아래에서 root marker 를 소유한 가장 가까운 조상. 없으면 `null`
- `findNearestOwner(start: string, names: readonly string[]): string | null`
  - `names` 중 하나를 직접 소유한 가장 가까운 조상. `start` 자신이 첫 후보이며, 없으면 `null`
- `isValidScope(value: unknown): value is Scope`
- `PROJECT_ANCHORS: readonly ['.claude', 'AGENTS.md', '.agents', '.codex', '.git']`
  - 순서는 판정에 영향을 주지 않는다. 첫 일치에서 통과한다.
- `PROJECT_ROOT_MARKERS: readonly ['.git', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'npm-shrinkwrap.json', 'bun.lock', 'bun.lockb']`
  - 순서는 판정에 영향을 주지 않는다.

## Exported Types

- `Scope = 'user' | 'project'`
- `ProjectRootResolution = { scope, projectRoot, autoLocated }`

## Acceptance Criteria

### AC-SCOPE-WALK — root marker 가 먼저, 그 다음 가장 가까운 anchor

- root marker 를 가진 조상이 있으면, 그보다 가까운 디렉터리가 agent anchor 를 가졌더라도 marker 쪽이 루트가 된다.
- 여러 조상이 root marker 를 가지면 가장 가까운 조상이 루트가 된다.
- 가장 가까운 marker 가 홈 디렉터리나 그 조상의 것이면 marker 단계는 빈손이고 anchor 단계로 넘어간다.
- root marker 가 없고 여러 조상이 anchor 를 가질 때, `project` scope 를 해석하면 가장 깊은 (가장 가까운) 조상이 루트가 된다.
- 중간 레벨이 anchor 를 갖지 않아도 탐색은 멈추지 않고 계속 올라간다.
- anchor 가 디렉터리인 경우에도 인식된다.
- Verified by `__tests__/scope.test.ts`.

### AC-SCOPE-RESOLVE — 해석 결과와 autoLocated

- `cwd` 위의 조상이 선택되면 `autoLocated` 는 `true` 이고 `projectRoot` 는 그 조상이다.
- anchor 를 가진 조상이 하나도 없으면 `projectRoot` 는 `cwd` 이고 `autoLocated` 는 `false` 다.
- `user` scope 는 홈 디렉터리를 답하며 `autoLocated` 는 결코 `true` 가 되지 않는다.
- Verified by `__tests__/scope.test.ts`.

## Last Updated

2026-09-20 — 루트 판정을 2단으로 바꿨다. pnpm workspace 멤버에 도구가 만든 `.claude` 가 있으면 "가장 가까운 anchor" 규칙이 멤버를 프로젝트 루트로 삼았기 때문이다. `PROJECT_ROOT_MARKERS` 를 추가하고 `findNearestAnchorAncestor` · `hasAnchor` 를 `findProjectRoot` · `findMarkerRoot` · `findNearestOwner` 로 대체했다. marker 단계에는 홈 디렉터리 천장을 둔다. `PROJECT_ANCHORS` 의 값은 그대로다.
