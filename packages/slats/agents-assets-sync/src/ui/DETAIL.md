# ui Specification

## Requirements

- TTY 전용 계층이다. 호출자(`renderOrFallback`)가 이 모듈을 동적 import 하기 전에 TTY 이고 프롬프트가 허용됨을 보장한다 — `--json` 도 아니고 `--no-interactive` 도 아닌 실행에서만 여기 도달한다.
- `renderInjectApp(input)` 은 `core/**` 프리미티브를 직접 조합해 Ink 가상 DOM 을 구동한다. `process.stdout` / `process.stderr` 에 직접 쓰지 않는다.
- 파이프라인은 훅으로 나뉜다. `useInjectSession` 이 전이를 구동하고, `useResolveStep` → `usePlanStep` → `useForceConfirmStep` → `useApplyStep` 이 각 단계를 맡는다.
- agent 가 `--agent` 로 주어지지 않으면 Ink `AgentPicker` 로 대화식 선택한다. scope 도 마찬가지로 `--scope` 가 없으면 `ScopePicker` 를 연다. 주어졌으면 그 값을 쓴다.
- 계획은 target 마다 순차적으로 세운다. 각 `(agent, package)` 쌍에 대해 `resolveAgentTarget` → `resolveHashManifest` → `computeNamespacePrefixes` → `resolveDestinations` → `buildPlan` 순서로 조합한다.
- `dist/agents-hashes.json` 부재로 실패시키는 것은 `hashSource: 'manifest'` 인 target 뿐이다. `'directory'` 인 target 은 매니페스트를 읽지 않으므로 이 판정을 건너뛴다.
- force 확인은 `ConfirmForce` 로 표면화되며, 그 아래의 promise 다리가 사용자 응답이나 취소에서 resolve 된다. 취소는 종료 코드 2다.
- 적용은 계획별로 `partitionActions` 로 갈라, 파일 작업은 `asyncPool(8, …)` 로 돌리고 블록 작업은 문서 단위로 하나씩 적용한다.
- 진행률은 액션이 끝날 때마다 `apply-progress` 이벤트로 보고된다. 파일은 한 건씩, 블록 그룹은 그룹 크기만큼 `done` 이 증가한다.
- `--dry-run` 은 적용을 건너뛰고 `summarize(plan, 0)` 로 바로 summary 에 들어가며 종료 코드 0을 낸다.
- summary 는 target 마다 `summarize(plan, exitCode)` 로 그려진다.
- 종료 코드: `0` 성공/최신/dry-run, `1` 런타임 오류, `2` 사용자 취소 또는 설정 누락.
- `dist/agents-hashes.json` 이 없는 target 은 실패한 plan step 으로 표면화된다.

## API Contracts

- `renderInjectApp(input: RenderInput): Promise<number>`
  - `RenderInput` — `{ targets: readonly ConsumerPackage[]; flags: DefaultFlags; originCwd: string }`
  - Ink 가 unmount 된 뒤 최종 종료 코드로 resolve 된다

## Internal Unit Contracts

entry point 표면 밖의 내부 단위다. 바꿔도 공개 계약 변경이 아니다.

- `phaseReducer(phase: Phase, event: InjectEvent): Phase` (`reducer/` organ)
  - 순수하고 결정적이다. Ink 도 `core/**` 도 import 하지 않고, `Date.now()` 나 환경변수를 읽지 않는다 — 필요한 값은 이벤트로 들어온다.
  - 알 수 없는 이벤트는 무시하고 현재 국면 객체를 그대로 돌려준다.
  - 소비자는 `hooks/usePhase.ts` 하나다.

## Composed core primitives

- `resolveHashManifest`, `computeNamespacePrefixes` — 소스 해시와 네임스페이스
- `resolveAgentTarget`, `resolveDestinations` — 목적지 해석
- `buildPlan` — 계획 수립
- `isValidAgent` — `--agent` 값 검증
- `partitionActions`, `applyAction`, `applyBlockActions` — 적용
- `summarize` — 집계
- `asyncPool` (`utils/`) — 파일 복사 풀, 동시성 8

## Re-exported types

- `Phase`, `InjectEvent`, `RenderInput`
- `TargetPlan`, `Warning`, `ApplyProgress`, `PlanStepState`

## Module access

- 내부 전용. `commands/runCli/renderers/renderOrFallback.ts` 에서 `await import('../../../ui/index.js')` 로만 도달한다. 패키지 subpath 로 노출되지 않는다.

## Acceptance Criteria

### AC-UI-BOX — 상자 컴포넌트의 시각적 계약

- `Banner` 는 scope chip 을 단 둥근 단색 프레임으로 그려지고, scope 가 없으면 chip 없이 그려진다.
- `Summary` 는 2단 배치의 이중선 상자로 그려지며, dry-run 은 제목에 표시된다.
- Verified by `__tests__/boxSnapshot.test.tsx`.

### AC-PHASE-SELECT — 선택 국면의 전이

- `agent-needed` 는 `booting` 을 `agent-select` 로 옮긴다.
- `agent-select` 는 고른 agents 를 들고 `scope-select` 로 넘어간다.
- Verified by `__tests__/phaseReducer.test.ts`.

### AC-PHASE-PLANNING — 계획 진행은 쌍마다 독립이다

- `resolving` 에서 `planning` 으로 갈 때 `(agent, package)` 쌍마다 한 단계가 만들어진다.
- 한 agent 의 단계를 갱신해도 다른 agent 의 단계는 변하지 않는다.
- `plans-ready` 는 `diff-review` 로 넘어간다.
- Verified by `__tests__/phaseReducer.test.ts`.

### AC-PHASE-TERMINAL — 종료 국면과 코드

- `force-answer` 가 `false` 면 종료 코드 2인 `summary` 로 접힌다.
- `apply-progress` 는 `done` 을 증가시킨다.
- `done` 이 종료 코드 0으로 오면 `summary` 에 기록된다.
- `fail` 은 현재 국면과 무관하게 `error` 로 옮긴다.
- Verified by `__tests__/phaseReducer.test.ts`.

### AC-PHASE-PURE — 알 수 없는 이벤트는 아무것도 바꾸지 않는다

- reducer 가 처리하지 않는 이벤트는 같은 국면 객체를 돌려준다.
- Verified by `__tests__/phaseReducer.test.ts`.

### AC-UI-STEP — 단계 표시는 종료 국면에서 멈춘다

- `summary` 와 `error` 국면에서 마지막 `done` 단계는 스피너가 아니라 채워진 점으로 그려진다.
- `applying` 국면에서 `apply` 단계는 여전히 스피너로 그려진다.
- Verified by `__tests__/stepTracker.test.tsx`.

## History

- 2026-08-06 — `resolveScope` 를 조합한다는 기술이 폐기됐다. 그 함수는 `resolveProjectRoot` + `resolveAgentTarget` 으로 대체되어 더 이상 존재하지 않으며, 이 계층은 `resolveAgentTarget` 을 통해 루트에 도달한다.
- 2026-08-06 — 진행률을 `useInterval` 로 ~10Hz 로 합친다는 기술이 폐기됐다. 실제로는 `useApplyStep` 이 액션 완료마다 `apply-progress` 를 보낸다.

## Last Updated

2026-08-06 — 계약을 현행 구현에 맞춰 재작성. 조합하는 core 프리미티브 목록을 실제 import 에 맞추고, agent 선택 단계와 블록 적용 경로를 추가하고, Acceptance Criteria 를 도입했다.
