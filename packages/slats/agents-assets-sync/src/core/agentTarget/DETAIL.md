# agentTarget Specification

## Requirements

- `resolveAgentTarget` 은 하나의 `(agent, scope)` 쌍을 구체적인 위치들로 바꾼다. 프로젝트 루트는 `resolveProjectRoot` 로 한 번만 해석되어 공유되므로, 한 실행에서 여러 agent 를 골라도 두 프로젝트에 걸칠 수 없다.
- `claude` 는 모든 kind 를 `<projectRoot>/.claude/<kind>/` 아래 파일로 둔다. `rulesMergeFile` 은 `null` 이고 지원하지 않는 kind 도 없다.
- `codex` 와 `agents` 는 rules 를 `AGENTS.md` 에 블록으로 병합하고, skills 를 스킬 디렉터리 디렉터리에 두며, commands 위치가 없다고 보고한다.
- 두 agent 는 `project` scope 에서 완전히 동일하다 — `<projectRoot>/.agents/skills` 와 저장소 자신의 `<projectRoot>/AGENTS.md`. `user` scope 에서만 갈라져 codex 는 `~/.codex`, agents 는 중립적인 `~/.agents` 를 읽는다.
- `agents` 는 제품이 아니라 vendor-neutral `.agents` 관례다. 자기 홈을 두는 대신 그 관례를 읽는 도구를 위해 존재한다.
- 설치 기록은 에이전트 자산 루트 바로 아래 `agents-assets-sync.json`입니다. 프로젝트에서는 Claude는 `.claude`, Codex와 agents는 공유 `.agents`, 사용자 스코프에서는 각각 `.claude`, `.codex`, `.agents` 아래에 둡니다. 직접 복사하는 규칙 또는 스킬을 다루는 실행에서만 설치 기록 경로를 검사합니다. 프로젝트에서는 기존 목적지 포함 검사에 합류합니다.
- `unsupported` 는 kind 별로 보고할 이유 문자열을 담는다. 조용한 누락이 아니라 명시된 사유로 표면화되어야 한다.
- `description` 은 이 target 이 쓰는 곳을 한 줄로 말한다. `autoLocated` 인 경우 `auto-located` 표식이 포함된다.
- `resolveDestinations` 는 매니페스트 경로를 목적지로 사상한다. 선행 세그먼트가 알려진 kind 가 아니거나 호출자가 거른 kind 면 결과에서 **빠진다**. 이 부재가 kind 필터 실행이 아무것도 보고하거나 삭제하지 않게 막는 기제다.
- `rules` kind 이면서 `rulesMergeFile` 이 있으면 목적지는 `block` 이고 blockId 는 `formatBlockId(packageName, relPath)` 다.
- skills 바로 아래의 placeholder 파일은 설치를 막지 않습니다. 첫 세그먼트가 `.` 으로 시작하고 하위 파일을 가진 skill 디렉터리는 `Error` 로 거부한다. 그 네임스페이스는 agent 자신의 예약 공간이다 (Codex 는 built-in 을 스킬 디렉터리 아래의 `.system` 구획 에 둔다).
- kind 뒤의 경로나 스킬 네임스페이스 접두사에 `..` 세그먼트가 하나라도 있으면 (`/` 와 `\` 어느 구분자든) `Error` 로 거부한다. 매니페스트 키는 배포된 `agents-hashes.json` 이나 공개 API 호출자에게서 오는 신뢰할 수 없는 입력이고, `join` 이 그런 세그먼트를 정규화하면 목적지가 kind 루트 밖이 되어 쓰기나 `--force` 삭제가 사용자의 다른 파일에 닿기 때문이다. 이름에 점이 들어 있을 뿐인 세그먼트(`a..b`)는 허용한다.
- kind 는 첫 `/` 세그먼트에서 읽으므로 `/` 가 없는 역슬래시 키나 `C:/…` 같은 드라이브 문자 키는 목적지를 얻지 못하고 오류도 내지 않는다. 목적지를 얻은 키를 Windows 의 `path.win32.join` 이 루트 밖으로 해석하는지는 검증하지 않은 한계다. 경로 모듈을 주입할 수 없고 이 저장소의 CI 는 Windows 에서 돌지 않기 때문이다.
- `project` scope 에서는 요청한 kind 의 목적지 루트(kind 디렉터리와 `AGENTS.md` 병합 파일)와 각 스킬 네임스페이스 디렉터리를 심볼릭 링크를 따라 해석한 위치가 `realpath(projectRoot)` 안에 있어야 한다. 아니면 그 경로를 명시한 `Error` 로 거부한다. 저장소는 심볼릭 링크를 커밋할 수 있으므로, 받아 온 프로젝트의 `.claude/skills -> /다른/곳` 같은 링크가 복사와 `--force` 삭제를 프로젝트 밖으로 보내기 때문이다. 해석에 실패하는 끊긴 링크도 거부한다. 아직 없는 경로는 가장 가까운 기존 조상의 해석 위치로 판단한다.
- `user` scope 는 이 검사를 하지 않는다. `~/.claude` 나 `~/.claude/skills` 를 dotfiles 저장소로 링크하는 것은 사용자가 의도한 흔한 구성이고, 위협은 받아 온 프로젝트에 커밋된 링크이기 때문이다.
- 루트 검사는 실행 단위(패키지와 agent 쌍)마다 루트와 네임스페이스당 한 번이다.
- 그 아래는 계획이 정해진 뒤 `assertProjectPathsContained`의 쓰기 경로가 같은 규칙으로 검사한다. 계획이 복사하거나 덮어쓰는 파일을 디렉터리별로 묶고, 가장 깊은 디렉터리부터 본다. 각 디렉터리는 루트 검사가 같은 실행 캐시에 남긴 가장 가까운 조상에서 내려오며 위 단계의 목록(`readdir` 의 `withFileTypes`)으로 판단한다. 목록에 정확히 있고 링크가 아닌 이름은 부모의 실제 위치 아래에 있다고 보고, 링크이거나 목록에 없는 이름만 `realpath` 로 해석한다. 대소문자를 구별하지 않는 파일 시스템에서는 목록에 없는 이름도 대소문자만 다른 기존 항목, 링크를 포함한 항목에 닿을 수 있기 때문이다. `d_type` 을 채우지 않는 일부 네트워크·FUSE 마운트처럼 목록이 파일, 디렉터리, 링크 중 무엇인지 알려 주지 않는 항목은 목록에서 빼서, 목록에 없는 이름과 똑같이 파일은 `lstat`, 디렉터리는 `realpath` 로 확인한다. 없는 디렉터리 아래는 아무것도 읽지 않는다. 이미 있는 디렉터리에 쓰는 파일도 같은 목록으로 판단한다. 목록이 아직 없고 그 디렉터리에 이름 하나만 쓰면 그 이름에 `lstat` 을 한 번 하고, 목록에 없는 이름은 같은 이유로 `lstat` 한다. 이름 하나에는 `lstat` 이 목록보다 싸고, 이 도구가 쓰는 디렉터리에는 대개 이 도구가 쓰는 파일만 있기 때문이다. `realpath` 는 링크에만 쓴다. 캐시에 있는 가장 가까운 조상이 서로 다른 디렉터리들, 예를 들어 두 스킬 네임스페이스 아래는 같은 디렉터리를 읽지 않으므로 동시에 검사한다(`groupByCachedAncestor`). 여러 곳이 밖으로 나가면 가장 깊은 디렉터리 순서로 먼저 나오는 묶음의 경로를 알린다. 그래서 40개 파일 트리에서 쓰기 검사는 새 설치에서 파일 시스템 호출이 없고, 덮어쓰기에서는 `readdir` 12번만 한다(`__tests__/writeTargetCallCount.test.ts`). 링크가 프로젝트 안을 가리키면 루트와 마찬가지로 허용한다. 받아 온 프로젝트가 네임스페이스 아래에 커밋한 `knowledge -> /다른/곳` 같은 디렉터리 링크나 `SKILL.md -> /다른/파일` 같은 파일 링크가 복사를 프로젝트 밖으로 보내기 때문이다.
- 삭제에는 이 검사가 필요 없다. 고아 탐색의 `walkFiles` 는 디렉터리 목록이 링크라고 알려 주는 항목을 따라가지도 내놓지도 않으므로 `--force` 는 링크를 통해 지우지 않고 링크 자체도 남겨 둔다. 블록 쓰기는 루트로 검사한 병합 파일에만 한다.
- 남은 한계: 검사와 실제 쓰기 사이에 다른 프로세스가 링크를 만들면 막지 못한다. 검사는 계획 직후 한 번이고 쓰기는 링크를 따르는 `copyFile` 이기 때문이다.
- 경로 포함 관계는 하드 링크의 inode 소유권을 추측하지 않습니다. 실제 덮어쓰기의 링크 수·owner·group·mode 보존은 injectDocs의 동일한 identity 규칙이 담당합니다. 고아 삭제는 디렉터리 항목 자체의 unlink이며 링크를 따라가지 않습니다. 명시적으로 계획된 dangling orphan link는 항목만 제거하고 ENOENT는 무시합니다. 일반 walkFiles가 내놓지 않는 링크는 삭제 계획에 들어가지 않으므로 그대로 남습니다.
- orphan 스캔은 호출자가 요청한 kind 에 대해서만 만들어진다. `skills` 는 네임스페이스별 디렉터리 스캔, `rules` 는 소유 패키지를 명시한 block-file 스캔이다.
- 이 fractal 은 경로를 계산할 뿐 asset 파일을 만들거나 읽거나 쓰지 않는다.

이전 설치 기록이 제시한 단일 파일은 일반 스캔과 달리 하위 경로를 직접 해석합니다. 계획에서 해시를 읽기 전에 쓰기 대상과 동일한 프로젝트 포함 검사를 적용합니다.

## API Contracts

- `resolveAgentTarget(agent: AgentType, scope: Scope, cwd?: string): AgentTarget`
- `isValidAgent(value: unknown): value is AgentType`
- `splitAssetKind(relPath: string): { kind: AssetKind; rest: string } | null`
  - 선행 세그먼트가 알려진 kind 가 아니거나 뒤에 아무것도 없으면 `null`
- `resolveDestinations(input): { destinations: Map<string, Destination>; orphanScans: OrphanScan[] }`
  - `input`: `{ agentTarget, packageName, relPaths, namespacePrefixes, assetKinds }`
  - 예약 네임스페이스를 침범하는 skill 경로, `..` 세그먼트를 가진 경로나 네임스페이스 접두사에서 throw
- `assertProjectPathsContained(input): Promise<void>`
  - 공통 입력은 `{ agentTarget, resolved }`입니다. 계획 전 `{ assetKinds, orphanScans }`로 루트와 스킬 네임스페이스를 확인합니다. 계획 후 `{ dstPaths }`로 쓰기 대상을 검사하며 먼저 채운 실행 캐시를 재사용합니다.
  - 프로젝트 경로가 밖으로 해석되거나 끊긴 링크를 지나면 해당 경로를 명시해 거부합니다. 사용자 스코프는 즉시 반환합니다.

## Exported Types

- `AgentType = 'claude' | 'codex' | 'agents'`
- `AssetKind = 'skills' | 'rules' | 'commands'`
- `resolveAgentTarget`의 반환값은 `AgentTarget`에 더해 설치 기록의 절대 위치를 제공합니다. 기존 호출자가 직접 구성하는 `AgentTarget`은 설치 기록 경로를 요구하지 않습니다.
- `Destination` — `{ kind: 'file', dstAbs }` | `{ kind: 'block', fileAbs, blockId }` | `{ kind: 'unsupported', reason }`
- `OrphanScan` — `{ kind: 'directory', scanRoot, relPathPrefix }` | `{ kind: 'block-file', fileAbs, ownerPackage }`

## Acceptance Criteria

### AC-TARGET-LAYOUT — 각 agent 의 asset 위치

- `claude` 는 `user`/`project` 어느 scope 에서든 skills, rules, commands 를 모두 `.claude` 아래 파일로 둔다.
- `codex` 는 `user` scope 에서 자신의 홈(`~/.codex`) 안에 머문다.
- `agents` 는 `user` scope 에서 vendor-neutral 홈(`~/.agents`)을 쓴다.
- 검증: `__tests__/agentTarget.test.ts`.

### AC-TARGET-SPLIT — 매니페스트 경로의 kind 분해

- 알려진 kind 로 시작하고 뒤에 경로가 남는 값만 `{ kind, rest }` 로 분해된다.
- 그 외의 모든 형태는 `null` 이며, 따라서 목적지를 얻지 못한다.
- 검증: `__tests__/agentTarget.test.ts`.

### AC-TARGET-DEST — 목적지 사상과 kind 필터

- `claude` 에서는 모든 kind 가 파일 목적지가 된다.
- `codex` 에서 rules 는 블록 목적지가 되고 commands 는 사유를 가진 `unsupported` 가 된다.
- kind 필터가 걸리면 제외된 kind 는 목적지에서도 orphan 스캔에서도 사라진다.
- rules 가 포함되면 `AGENTS.md` 에 대한 block-file orphan 스캔이 추가되고, 그 스캔은 소유 패키지를 명시한다.
- 예약된 codex 네임스페이스를 가리는 skill 경로는 호출을 throw 시킨다.
- 검증: `__tests__/agentTarget.test.ts`.

### AC-TARGET-CONTAINMENT — 목적지는 kind 루트 밖으로 나가지 않는다

- 모든 kind 에서 `..` 세그먼트를 가진 매니페스트 경로는 호출을 throw 시키고, 오류 메시지는 그 경로를 명시한다.
- `..` 세그먼트를 가진 스킬 네임스페이스 접두사도 throw 시킨다. 그 접두사는 `--force` 가 지우는 고아 스캔 루트를 정하기 때문이다.
- 점이 들어 있을 뿐인 이름은 그대로 목적지를 얻는다.
- 검증: `__tests__/destinationContainment.test.ts`.

### AC-TARGET-REAL-ROOT — project 목적지는 해석한 위치도 프로젝트 안이다

- `project` scope 에서 프로젝트 밖 디렉터리를 가리키는 kind 루트 링크와 스킬 네임스페이스 링크는 그 경로를 명시해 거부되고, 그 밖에는 아무것도 쓰거나 지워지지 않는다.
- 프로젝트 안을 가리키는 링크와 아직 없는 루트는 통과한다. 끊긴 링크는 거부된다.
- `user` scope 의 링크된 skills 루트를 통해서는 그대로 설치된다.
- 네임스페이스 아래에서 프로젝트 밖을 가리키는 디렉터리 링크로 복사하거나 파일 링크를 덮어쓰려는 계획은 그 경로를 명시해 거부되고, 링크 대상은 바뀌지 않는다.
- 프로젝트 안을 가리키는 아래쪽 링크와 `user` scope 의 파일 링크는 그대로 따라간다.
- `--force` 는 고아 옆의 링크와 그 대상을 지우지 않고 그대로 0으로 끝난다.
- 이름 하나를 쓸 때의 `lstat` 경로와 여러 이름을 쓸 때의 목록 경로는 바깥 파일 링크, 끊긴 링크, 안쪽 링크, 보통 파일에 같은 판정을 내린다.
- 대소문자를 구별하지 않는 파일 시스템에서 대소문자만 바꾼 이름으로 바깥 링크에 닿는 쓰기도 거부된다.
- 검증: `__tests__/destinationRootContainment.test.ts`, `__tests__/writeTargetContainment.test.ts`, `__tests__/writeTargetCallCount.test.ts`, `__tests__/untypedDirent.test.ts`, 패키지의 `src/__tests__/symlinkedDestinations.test.ts`.

## Last Updated

에이전트별 목적지와 설치 스코프의 계약이 바뀌면 갱신합니다.
