# agentTarget

## Purpose

에이전트별 주입 자산의 보관 위치를 결정합니다. `(agent, scope)` 쌍 하나를 구체적인 위치로 해석한 뒤 매니페스트의 각 경로를 복사된 파일·공유 `AGENTS.md`의 마커 블록·지원할 위치가 없다는 명시적 결과 중 하나로 정합니다. 에이전트별 규약을 아는 유일한 프랙탈입니다.

## Structure

- `index.ts` — 배럴 재수출
- `agentTarget.ts` — `resolveAgentTarget`, `isValidAgent`
- `type.ts` — `AgentType`, `AssetKind`, `AgentTarget`, `Destination`, `OrphanScan`
- `utils/splitAssetKind.ts` — 매니페스트 경로 → `{ kind, rest }`
- `utils/resolveDestinations.ts` — 경로 → 목적지 + 고아 항목 탐색
- `__tests__/` — 이 프랙탈의 검증 파일

## Conventions

- claude는 모든 종류의 루트를 `<projectRoot>/.claude` 아래에 둡니다.
- codex와 agents는 rules를 `AGENTS.md`에 병합하고 skills를 `skills/` 디렉터리에 두며 commands 위치는 없습니다. `project` 스코프에서는 같습니다(`<projectRoot>/.agents/skills` + 저장소의 `AGENTS.md`). `user` 스코프에서는 codex가 `~/.codex`를, agents가 `~/.agents`를 읽습니다.
- `agents`는 제품이 아닌 규약이며 `.agents`를 읽는 도구를 위한 것입니다.
- 루트는 `scope/`에, 블록 ID는 `markerBlock/`에 각각의 `index.ts`를 통해 의존하며 `buildPlan/`이 이 모듈을 소비합니다.

## Boundaries

### Always do

- 모든 위치를 공유 프로젝트 루트 하나에서 파생하여 한 실행에서 여러 에이전트를 선택해도 두 프로젝트에 걸치지 않게 합니다.
- 종류가 미지이거나 필터에서 제외되면 `destinations`에서 경로를 생략합니다. 이 부재로 필터된 실행의 삭제를 막습니다.
- 호출자가 요청한 종류에 대해서만 고아 항목 탐색을 생성합니다.

### Ask first

- `AgentType`에 에이전트를 추가할 때. 모든 렌더러가 이를 열거합니다.
- 에이전트의 디렉터리 규약을 바꿀 때. 설치된 자산에는 변경 전 경로가 남습니다.

### Never do

- 이곳에서 자산 파일을 만들거나 읽거나 쓰지 않습니다. 이 프랙탈은 경로를 계산합니다.
- `buildPlan/`, `injectDocs/`, `commands/`, `ui/`에서 가져오지 않습니다.
