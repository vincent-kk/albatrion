# agentTarget Specification

## Requirements

- `resolveAgentTarget` 은 하나의 `(agent, scope)` 쌍을 구체적인 위치들로 바꾼다. 프로젝트 루트는 `resolveProjectRoot` 로 한 번만 해석되어 공유되므로, 한 실행에서 여러 agent 를 골라도 두 프로젝트에 걸칠 수 없다.
- `claude` 는 모든 kind 를 `<projectRoot>/.claude/<kind>/` 아래 파일로 둔다. `rulesMergeFile` 은 `null` 이고 지원하지 않는 kind 도 없다.
- `codex` 와 `agents` 는 rules 를 `AGENTS.md` 에 블록으로 병합하고, skills 를 `skills/` 디렉터리에 두며, commands 위치가 없다고 보고한다.
- 두 agent 는 `project` scope 에서 완전히 동일하다 — `<projectRoot>/.agents/skills` 와 저장소 자신의 `<projectRoot>/AGENTS.md`. `user` scope 에서만 갈라져 codex 는 `~/.codex`, agents 는 중립적인 `~/.agents` 를 읽는다.
- `agents` 는 제품이 아니라 vendor-neutral `.agents` 관례다. 자기 홈을 두는 대신 그 관례를 읽는 도구를 위해 존재한다.
- `unsupported` 는 kind 별로 보고할 이유 문자열을 담는다. 조용한 누락이 아니라 명시된 사유로 표면화되어야 한다.
- `description` 은 이 target 이 쓰는 곳을 한 줄로 말한다. `autoLocated` 인 경우 `auto-located` 표식이 포함된다.
- `resolveDestinations` 는 매니페스트 경로를 목적지로 사상한다. 선행 세그먼트가 알려진 kind 가 아니거나 호출자가 거른 kind 면 결과에서 **빠진다**. 이 부재가 kind 필터 실행이 아무것도 보고하거나 삭제하지 않게 막는 기제다.
- `rules` kind 이면서 `rulesMergeFile` 이 있으면 목적지는 `block` 이고 blockId 는 `formatBlockId(packageName, relPath)` 다.
- 첫 세그먼트가 `.` 으로 시작하는 skill 디렉터리는 `Error` 로 거부한다. 그 네임스페이스는 agent 자신의 예약 공간이다 (Codex 는 built-in 을 `skills/.system/` 에 둔다).
- orphan 스캔은 호출자가 요청한 kind 에 대해서만 만들어진다. `skills` 는 네임스페이스별 디렉터리 스캔, `rules` 는 소유 패키지를 명시한 block-file 스캔이다.
- 이 fractal 은 경로를 계산할 뿐 asset 파일을 만들거나 읽거나 쓰지 않는다.

## API Contracts

- `resolveAgentTarget(agent: AgentType, scope: Scope, cwd?: string): AgentTarget`
- `isValidAgent(value: unknown): value is AgentType`
- `splitAssetKind(relPath: string): { kind: AssetKind; rest: string } | null`
  - 선행 세그먼트가 알려진 kind 가 아니거나 뒤에 아무것도 없으면 `null`
- `resolveDestinations(input): { destinations: Map<string, Destination>; orphanScans: OrphanScan[] }`
  - `input`: `{ agentTarget, packageName, relPaths, namespacePrefixes, assetKinds }`
  - 예약 네임스페이스를 침범하는 skill 경로에서 throw

## Exported Types

- `AgentType = 'claude' | 'codex' | 'agents'`
- `AssetKind = 'skills' | 'rules' | 'commands'`
- `AgentTarget` — `{ agent, scope, projectRoot, directoryRoots, rulesMergeFile, unsupported, description }`
- `Destination` — `{ kind: 'file', dstAbs }` | `{ kind: 'block', fileAbs, blockId }` | `{ kind: 'unsupported', reason }`
- `OrphanScan` — `{ kind: 'directory', scanRoot, relPathPrefix }` | `{ kind: 'block-file', fileAbs, ownerPackage }`

## Acceptance Criteria

### AC-TARGET-LAYOUT — 각 agent 의 asset 위치

- `claude` 는 `user`/`project` 어느 scope 에서든 skills, rules, commands 를 모두 `.claude` 아래 파일로 둔다.
- `codex` 는 `user` scope 에서 자신의 홈(`~/.codex`) 안에 머문다.
- `agents` 는 `user` scope 에서 vendor-neutral 홈(`~/.agents`)을 쓴다.
- Verified by `tests/core/agentTarget.test.ts`.

### AC-TARGET-SPLIT — 매니페스트 경로의 kind 분해

- 알려진 kind 로 시작하고 뒤에 경로가 남는 값만 `{ kind, rest }` 로 분해된다.
- 그 외의 모든 형태는 `null` 이며, 따라서 목적지를 얻지 못한다.
- Verified by `tests/core/agentTarget.test.ts`.

### AC-TARGET-DEST — 목적지 사상과 kind 필터

- `claude` 에서는 모든 kind 가 파일 목적지가 된다.
- `codex` 에서 rules 는 블록 목적지가 되고 commands 는 사유를 가진 `unsupported` 가 된다.
- kind 필터가 걸리면 제외된 kind 는 목적지에서도 orphan 스캔에서도 사라진다.
- rules 가 포함되면 `AGENTS.md` 에 대한 block-file orphan 스캔이 추가되고, 그 스캔은 소유 패키지를 명시한다.
- 예약된 codex 네임스페이스를 가리는 skill 경로는 호출을 throw 시킨다.
- Verified by `tests/core/agentTarget.test.ts`.

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성.
