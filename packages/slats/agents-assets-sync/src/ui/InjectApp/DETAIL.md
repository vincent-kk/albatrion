# InjectApp Specification

## Requirements

- `Phase` 는 `kind` 로 판별되는 union 이다. reducer 는 `useInjectSession` 이 보내는 `InjectEvent` 에 반응해 kind 사이를 전이한다. 알 수 없는 이벤트는 무시하고 현재 국면을 그대로 돌려준다.
- Phase kind:
  - `booting` — 초기 union 멤버. 화면에서는 `resolving` 과 같은 분기로 그려진다.
  - `resolving` — target 해석 중. `InjectApp` 이 실제로 시작하는 국면이다.
  - `agent-select` — Ink `AgentPicker` 대기. `pending: (agents) => void` 보유
  - `scope-select` — Ink `ScopePicker` 대기. 고른 agents 를 이어서 들고 있으며 `pending: (scope) => void` 보유
  - `planning` — target 별 `buildPlan` 진행 중. `progress` 는 `PlanStepState` 맵이며 `(agent, package)` 쌍마다 한 단계다
  - `diff-review` — 계획 완료, 적용 전 검토. `focusedIndex` 로 항목을 옮긴다
  - `force-confirm` — diverged/orphan 경고 표시. `pending` 은 사용자 결정의 promise resolver
  - `applying` — 적용 중. `progress: ApplyProgress`
  - `summary` — 완료. `reports`, `plans`, `exitCode`, `dryRun` 보유
  - `error` — 치명적. `Error` 보유
- `booting` 을 제외한 모든 국면은 `scope` 를 들고 다닌다. 렌더러가 쓰기 위치를 계속 표시할 수 있어야 하기 때문이다.
- `InjectEvent` 종류: `agent-needed`, `agent-selected`, `scope-needed`, `scope-selected`, `planning-started`, `plan-step`, `plans-ready`, `force-confirm-required`, `force-answer`, `apply-start`, `apply-progress`, `done`, `fail`, `focus-target`.
- reducer 는 순수하고 결정적이다. `Date.now()` 도 환경변수도 읽지 않으며, 필요한 값은 이벤트로 들어온다. Ink 도 `core/**` 도 import 하지 않는다.
- `InjectApp` 컴포넌트:
  - `usePhase({ kind: 'resolving', targets })` 로 reducer 를 묶는다. 초기 국면은 `resolving` 이며 `booting` 이 아니다
  - `useInjectSession({ targets, flags, originCwd, dispatch })` 로 전이를 구동
  - `<Banner/>`, `<StepTracker/>`, 국면별 본문, `<Footer/>` 를 그리고, `error` 국면에서는 본문이 `<ErrorPanel/>` 로 대체된다
  - `useExitApp` 을 `summary` 와 `error` 국면에서 각각 활성화한다. 이 훅이 `useApp().exit()` 을 호출하고 코드를 `onExit` 으로 넘긴다
- `renderInjectApp(input)`:
  - `ink.render(<InjectApp {...input} onExit={captureCode}/>, { exitOnCtrlC: true })`
  - `waitUntilExit()` 를 기다린 뒤 잡아 둔 종료 코드를 돌려준다
  - `finally` 에서 unmount 하여 터미널을 복구한다
  - 초기 국면을 만들지 않는다 — 그것은 `InjectApp` 의 몫이다

## API Contracts

entry point(`index.ts`)가 실제로 수출하는 것이 이 fractal 의 공개 계약이다:

- `renderInjectApp(input: RenderInput): Promise<number>`
- `InjectApp(props: InjectAppProps): React.ReactElement`

## Internal Unit Contracts

entry point 표면 밖의 내부 단위다. 바꿔도 공개 계약 변경이 아니다.

- `InjectAppProps = RenderInput & { onExit: (code: 0 | 1 | 2) => void }`
- `Phase`, `InjectEvent` — `ui/types/` 가 소유하며 이 fractal 은 소비만 한다
- `phaseReducer` — `ui/reducer/` 가 소유한다. 계약과 승인 그룹은 `ui/DETAIL.md` 에 있다

## Acceptance Criteria

### AC-APP-RENDER — 국면마다 정해진 본문을 그린다

- `booting` 과 `resolving` 은 같은 분기로 그려진다.
- `error` 국면에서는 본문이 `<ErrorPanel/>` 로 대체되고, `<Banner/>`·`<StepTracker/>`·`<Footer/>` 는 모든 국면에서 그려진다.
- 직접 검증하는 파일이 없다. `__tests__/stepTracker.test.tsx` 와 `__tests__/boxSnapshot.test.tsx` 가 구성 요소를 개별로 덮을 뿐이며, 이 그룹은 아직 오라클을 갖지 않는다.

### AC-APP-EXIT — 종료 코드는 컴포넌트 안에서 표면화된다

- `summary` 와 `error` 국면에서만 `useExitApp` 이 활성화되고, 그것이 `useApp().exit()` 을 호출한 뒤 코드를 `onExit` 으로 넘긴다.
- `renderInjectApp` 은 `waitUntilExit()` 이후 잡아 둔 코드를 돌려주고 `finally` 에서 unmount 한다.
- 직접 검증하는 파일이 없다.

국면 전이 자체의 승인 그룹(`AC-PHASE-*`)은 `ui/DETAIL.md` 로 옮겼다 — reducer 가 `ui/reducer/` 로 이동했기 때문이다.

## History

- 2026-08-06 — `phaseReducer` 가 `ui/reducer/` 로 이동해 이 fractal 의 계약에서 빠졌다. organ `InjectApp/utils` 가 소유자 밖 `ui/hooks/usePhase.ts` 에 소비되어 entry point 경유 경로가 없던 상태를 해소한 결과다. `AC-PHASE-*` 네 그룹도 함께 `ui/DETAIL.md` 로 옮겼다.
- 2026-08-06 — `## API Contracts` 를 entry point 가 실제로 수출하는 심볼로 좁히고, 나머지를 `## Internal Unit Contracts` 로 분리했다. 두 계층이 한 제목 아래 섞여 무엇이 계약 변경인지 판별할 수 없었다.

- 2026-08-06 — 존재하지 않는 `plan-built` 이벤트가 계약에서 제거되고, 실제 이벤트 8종(`agent-needed`, `agent-selected`, `scope-needed`, `planning-started`, `plan-step`, `plans-ready`, `apply-start`, `focus-target`)이 기록됐다. `agent-select` 국면도 함께 누락돼 있었다.
- 2026-08-06 — 초기 국면이 `renderInjectApp` 에서 `{ kind: 'booting' }` 으로 만들어진다는 기술이 폐기됐다. `InjectApp` 이 `usePhase` 에 `resolving` 을 넘긴다.

## Last Updated

2026-08-06 — `phaseReducer` 이동에 맞춰 계약을 좁혔다. 공개 계약은 entry point 표면(`renderInjectApp`, `InjectApp`)만 담고, 국면 전이 승인 그룹은 `ui/DETAIL.md` 로 넘겼다.
