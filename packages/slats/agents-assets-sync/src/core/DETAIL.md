# core Specification

## Requirements

- `core/**`는 순수하고 상태 없는 기본 연산의 모음이다. 드문 파일 연결 해제 실패를 위한 `injectDocs/utils/applyAction.ts` 안의 `logger.warn` 한 곳을 제외하고 이 트리의 어떤 함수도 `process.stdout`/`process.stderr`에 쓰지 않는다.
- 스코프 해석은 결정적이다. `resolveProjectRoot`는 `cwd`와 `homedir`만 읽는다. `user`는 홈 디렉터리를 반환하고 `project`는 `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git` 중 하나를 가진 가장 가까운 조상을 반환하며 없으면 `cwd`를 사용한다. `cwd`보다 위에서 찾으면 `autoLocated`를 보고한다. 앵커의 존재로 판단하며 `AGENTS.md`는 파일이고 워크트리 안의 `.git`도 파일이다.
- 선택된 모든 에이전트는 프로젝트 루트 하나를 사용하므로 여러 에이전트를 지정한 실행이 두 프로젝트에 걸칠 수 없다.
- `resolveAgentTarget`은 `(agent, scope)`를 자산 위치로 매핑한다. claude는 모든 종류의 루트를 `<projectRoot>/.claude` 아래에 둔다. codex와 agents는 skills를 `skills/` 디렉터리에 두고 rules를 `AGENTS.md`에 병합하며 `commands`는 지원하지 않는다고 보고한다. `project` 스코프에서는 같다(`<projectRoot>/.agents/skills`와 `<projectRoot>/AGENTS.md`). `user` 스코프에서만 codex는 `~/.codex`, agents는 `~/.agents`를 사용한다.
- `resolveDestinations`는 종류가 미지이거나 필터에서 제외된 매니페스트 경로를 생략한다. 이 부재로 종류를 필터한 실행이 요청 범위 밖 항목을 보고하거나 삭제하지 못하게 한다.
- 첫 세그먼트가 `.`로 시작하는 스킬 디렉터리는 오류로 거부한다. 에이전트가 소유한 이름 공간이기 때문이다. Codex는 `skills/.system/` 아래에 기본 스킬을 배포한다.
- 계획 생성은 읽기 전용이다. `buildPlan`은 원본 해시와 목적지를 비교하여 `InjectPlan`을 반환하며 쓰지 않는다.
- 블록도 파일과 같은 방식으로 판정한다. `blockBodyMatches`는 마커 사이의 본문과 매니페스트 해시를 비교하며 원본에 끝 개행이 없을 때 `upsertBlock`이 추가하는 개행 하나를 허용한다.
- `warn-diverged`와 `--force` 없이 발견한 모든 고아 항목은 `requiresForce`를 설정한다. `skip-unsupported`는 설정하지 않는다.
- 계획 적용은 부수 효과만 수행한다. `applyAction`은 `file` 대상을 처리하고 `applyBlockActions`는 호출마다 공유 문서 하나를 다시 쓴다. 호출자가 문서를 하나씩 적용하므로 한 실행 안에서 같은 `AGENTS.md`에 쓰는 블록이 서로를 지우지 않는다. 이 보장은 한 실행 안으로 제한된다. 잠금이 아니므로 두 실행이 같은 문서를 동시에 쓰면 각자 읽은 내용을 저장하고 나중 쓰기가 우선한다. 이 도구의 마커 밖 내용은 바이트 단위로 보존된다.
- `partitionActions`는 `force`가 허용된 경우에만 `warn-diverged`를 실행 가능하게 한다. CLI가 약속하는 "--force overwrites"는 이곳에서 지킨다.
- 해시 계산은 결정적이며 `hashContent`/`hashFile`은 Node의 `crypto` 모듈만 사용한다.
- `readHashManifest`는 `schemaVersion !== 1`을 명시적 오류로 거부한다.
- 대상의 원본 해시는 저장된 `dist/agents-hashes.json` 또는 실행 시 해시를 계산한 자산 디렉터리 중 하나에서 오며 `resolveHashManifest`가 `hashSource`로 선택한다. 선택은 명령 분배기의 책임이다. `--asset-path`는 항상 디렉터리를 사용하며, 선언된 자산 경로는 빌드된 매니페스트가 없을 때 디렉터리를 사용한다.
- 고아 항목 탐색은 호출자가 제공한 탐색만 실행한다. 블록 탐색은 지정된 패키지 소유의 블록만 고려하므로 다른 패키지나 도구의 블록을 삭제 대상으로 제안하지 않는다.

## API Contracts

- `resolveProjectRoot(scope: Scope, cwd?: string): ProjectRootResolution`
- `findProjectRoot(start: string): string | null`
- `findMarkerRoot(start: string): string | null`
- `findNearestOwner(start: string, names: readonly string[]): string | null`
- `isValidScope(value: unknown): value is Scope`
- `PROJECT_ANCHORS: readonly ['.claude', 'AGENTS.md', '.agents', '.codex', '.git']`
- `PROJECT_ROOT_MARKERS` — 루트 마커 목록. 값은 `scope/DETAIL.md` 가 소유한다.
- `resolveAgentTarget(agent: AgentType, scope: Scope, cwd?: string): AgentTarget`
- `isValidAgent(value: unknown): value is AgentType`
- `splitAssetKind(relPath: string): { kind: AssetKind; rest: string } | null`
- `resolveDestinations(input): { destinations: Map<string, Destination>; orphanScans: OrphanScan[] }`
- `formatBlockId(packageName: string, relPath: string): string`
- `parseBlocks(content: string): ParsedBlock[]`
- `findBlockBody(content: string, blockId: string): string | null`
- `upsertBlock(content: string, blockId: string, body: string): string`
- `removeBlock(content: string, blockId: string): string`
- `blockBodyMatches(body: string, expected: Sha256Hex): boolean`
- `MARKER_PREFIX = 'AGENTS-ASSETS-SYNC'`
- `needsBuiltManifest(target): boolean`
- `resolveHashManifest(source: HashManifestSource, generatedAt?: string): Promise<HashManifest>`
- `readHashManifest(packageRoot: string): Promise<HashManifest>`
- `computeNamespacePrefixes(manifest: HashManifest): string[]`
- `buildPlan(input: PlanInput): Promise<InjectPlan>`
- `partitionActions(actions, force): { fileActions: Action[]; blockGroups: Map<string, Action[]> }`
- `applyAction(action: Action, assetRoot: string): Promise<void>`
- `applyBlockActions(fileAbs: string, actions, assetRoot: string): Promise<void>`
- `summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport`
- `hashContent(buffer: Buffer | string): Sha256Hex`
- `hashFile(absPath: string): Promise<Sha256Hex | null>`
- `hashEquals(a: Sha256Hex | null, b: Sha256Hex | null): boolean`
- `HASH_MANIFEST_FILENAME = 'agents-hashes.json'`

## 내보내는 타입

- `Scope`, `ProjectRootResolution`
- `AgentType`, `AssetKind`, `AgentTarget`, `Destination`, `OrphanScan`
- `ParsedBlock`
- `ActionKind`, `ActionTarget`, `Action`, `InjectPlan`, `PlanInput`
- `HashManifest`, `HashManifestSource`, `InjectReport`, `Sha256Hex`

## Acceptance Criteria

### AC-ROOT — 모든 에이전트가 프로젝트 루트 하나를 사용한다

- 앵커 하나를 보유한 디렉터리의 하위에서 `project` 스코프를 해석하면 해당 디렉터리가 프로젝트 루트이며 `autoLocated`는 `true`이다.
- 앵커를 보유한 조상이 없으면 `project` 스코프 해석은 시작 디렉터리를 루트로 사용하고 `autoLocated`는 `false`이다.
- `core/scope/__tests__/scope.test.ts`에서 검증한다.

### AC-DEST — 에이전트별 자산 위치

- `claude`의 목적지를 해석하면 skills·rules·commands는 `<projectRoot>/.claude/<kind>/` 아래의 파일이다.
- `project` 스코프의 `codex`나 `agents`는 skills가 `<projectRoot>/.agents/skills/` 아래의 파일이고 rules가 `<projectRoot>/AGENTS.md`의 블록이며 commands는 `unsupported`이다.
- `user` 스코프에서는 codex가 `~/.codex`, agents가 `~/.agents`로 해석된다.
- 종류 필터가 주어지면 다른 모든 종류의 경로는 목적지에 없고 어떤 고아 항목 탐색도 이를 포함하지 않는다.
- 스킬 이름 공간이 `.`로 시작하면 목적지 해석 호출이 예외를 던진다.
- `core/agentTarget/__tests__/agentTarget.test.ts`에서 검증한다.

### AC-BLOCK — 공유 AGENTS.md에서 다른 소유자의 내용을 보존한다

- 다른 도구의 블록과 자유 본문을 가진 문서에 이 도구의 블록을 추가·갱신한 뒤 제거하면 문서는 원래 바이트로 돌아간다.
- 변경하지 않은 블록에 대해 계획을 다시 만들면 판정은 `skip-uptodate`이며 문서를 다시 쓰지 않는다.
- 직접 편집한 블록에 대해 계획을 다시 만들면 판정은 `warn-diverged`이며 `requiresForce`를 설정한다.
- `core/markerBlock/__tests__/markerBlock.test.ts`, `core/buildPlan/__tests__/buildPlan.test.ts`, `core/injectDocs/__tests__/applyActions.test.ts`에서 검증한다.

### AC-FORCE — 강제 적용은 안내한 내용을 덮어쓴다

- 내용이 달라진 항목에 `--force`가 없으면 액션을 나누어도 실행 가능한 항목이 없다.
- 같은 항목에 `--force`를 지정하고 액션을 나누어 적용하면 목적지는 원본 내용을 다시 가진다.
- `core/injectDocs/__tests__/applyActions.test.ts`에서 검증한다.

## History

- 2026-08-05 — codex가 공유 `AGENTS.md` 안의 블록으로 규칙을 보관하므로, 판정이 곧 파일을 뜻하지 않게 `ActionKind`와 `ActionTarget`을 분리했다. 액션마다 `dstAbs`를 두는 형태로는 이를 표현할 수 없었다.
- 2026-08-05 — `resolveScope`/`ScopeResolution`을 제거하고 `resolveProjectRoot`와 `resolveAgentTarget`으로 대체했다. 기존 함수는 `.claude`를 고정해 두 에이전트에 응답할 수 없었다.
- 2026-08-05 — `codex` 옆에 `agents`를 추가했다. 둘은 프로젝트 배치를 공유하지만, 공급자와 독립적인 `.agents` 홈을 읽는 도구가 Codex라고 주장하지 않고 지정될 수 있도록 `agents`를 둔다.
- 2026-08-05 — `--force`가 내용이 달라진 항목을 덮어쓰게 했다. CLI는 덮어쓰기를 안내했지만 `applyAction`은 `copy`와 `delete`만 처리하여 내용이 달라진 파일을 조용히 남겨 두었다.

## Last Updated

2026-08-05 — `agentTarget`과 `markerBlock`을 추가하고 여러 에이전트의 목적지를 위해 `scope`, `buildPlan`, `injectDocs`를 재구성했다.
