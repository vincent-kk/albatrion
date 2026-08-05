# InjectApp Specification

## Requirements

- `Phase` 는 `kind` 로 판별되는 union 이다. reducer 는 `useInjectSession` 이
  보내는 `InjectEvent` 에 반응해 kind 사이를 전이한다. 알 수 없는 이벤트는
  무시하고 현재 국면을 그대로 돌려준다.
- Phase kind:
  - `booting` — 초기 union 멤버. 화면에서는 `resolving` 과 같은 분기로 그려진다.
  - `resolving` — target 해석 중. `InjectApp` 이 실제로 시작하는 국면이다.
  - `agent-select` — Ink `AgentPicker` 대기. `pending: (agents) => void` 보유
  - `scope-select` — Ink `ScopePicker` 대기. 고른 agents 를 이어서 들고 있으며
    `pending: (scope) => void` 보유
  - `planning` — target 별 `buildPlan` 진행 중. `progress` 는 `PlanStepState`
    맵이며 `(agent, package)` 쌍마다 한 단계다
  - `diff-review` — 계획 완료, 적용 전 검토. `focusedIndex` 로 항목을 옮긴다
  - `force-confirm` — diverged/orphan 경고 표시. `pending` 은 사용자 결정의
    promise resolver
  - `applying` — 적용 중. `progress: ApplyProgress`
  - `summary` — 완료. `reports`, `plans`, `exitCode`, `dryRun` 보유
  - `error` — 치명적. `Error` 보유
- `booting` 을 제외한 모든 국면은 `scope` 를 들고 다닌다. 렌더러가 쓰기 위치를
  계속 표시할 수 있어야 하기 때문이다.
- `InjectEvent` 종류: `agent-needed`, `agent-selected`, `scope-needed`,
  `scope-selected`, `planning-started`, `plan-step`, `plans-ready`,
  `force-confirm-required`, `force-answer`, `apply-start`, `apply-progress`,
  `done`, `fail`, `focus-target`.
- reducer 는 순수하고 결정적이다. `Date.now()` 도 환경변수도 읽지 않으며,
  필요한 값은 이벤트로 들어온다. Ink 도 `core/**` 도 import 하지 않는다.
- `InjectApp` 컴포넌트:
  - `usePhase({ kind: 'resolving', targets })` 로 reducer 를 묶는다. 초기
    국면은 `resolving` 이며 `booting` 이 아니다
  - `useInjectSession({ targets, flags, originCwd, dispatch })` 로 전이를 구동
  - `<Banner/>`, `<StepTracker/>`, 국면별 본문, `<Footer/>` 를 그리고,
    `error` 국면에서는 본문이 `<ErrorPanel/>` 로 대체된다
  - `useExitApp` 을 `summary` 와 `error` 국면에서 각각 활성화한다. 이 훅이
    `useApp().exit()` 을 호출하고 코드를 `onExit` 으로 넘긴다
- `renderInjectApp(input)`:
  - `ink.render(<InjectApp {...input} onExit={captureCode}/>, { exitOnCtrlC: true })`
  - `waitUntilExit()` 를 기다린 뒤 잡아 둔 종료 코드를 돌려준다
  - `finally` 에서 unmount 하여 터미널을 복구한다
  - 초기 국면을 만들지 않는다 — 그것은 `InjectApp` 의 몫이다

## API Contracts

- `Phase` — 위 union
- `InjectEvent` — 위 union
- `InjectAppProps = RenderInput & { onExit: (code: 0 | 1 | 2) => void }`
- `phaseReducer(phase: Phase, event: InjectEvent): Phase`
- `renderInjectApp(input: RenderInput): Promise<number>`

## Acceptance Criteria

### AC-PHASE-SELECT — 선택 국면의 전이

- `agent-needed` 는 `booting` 을 `agent-select` 로 옮긴다.
- `agent-select` 는 고른 agents 를 들고 `scope-select` 로 넘어간다.
- Verified by `tests/ui/phaseReducer.test.ts`.

### AC-PHASE-PLANNING — 계획 진행은 쌍마다 독립이다

- `resolving` 에서 `planning` 으로 갈 때 `(agent, package)` 쌍마다 한 단계가
  만들어진다.
- 한 agent 의 단계를 갱신해도 다른 agent 의 단계는 변하지 않는다.
- `plans-ready` 는 `diff-review` 로 넘어간다.
- Verified by `tests/ui/phaseReducer.test.ts`.

### AC-PHASE-TERMINAL — 종료 국면과 코드

- `force-answer` 가 `false` 면 종료 코드 2인 `summary` 로 접힌다.
- `apply-progress` 는 `done` 을 증가시킨다.
- `done` 이 종료 코드 0으로 오면 `summary` 에 기록된다.
- `fail` 은 현재 국면과 무관하게 `error` 로 옮긴다.
- Verified by `tests/ui/phaseReducer.test.ts`.

### AC-PHASE-PURE — 알 수 없는 이벤트는 아무것도 바꾸지 않는다

- reducer 가 처리하지 않는 이벤트는 같은 국면 객체를 돌려준다.
- Verified by `tests/ui/phaseReducer.test.ts`.

## History

- 2026-08-06 — 존재하지 않는 `plan-built` 이벤트가 계약에서 제거되고, 실제
  이벤트 8종(`agent-needed`, `agent-selected`, `scope-needed`,
  `planning-started`, `plan-step`, `plans-ready`, `apply-start`,
  `focus-target`)이 기록됐다. `agent-select` 국면도 함께 누락돼 있었다.
- 2026-08-06 — 초기 국면이 `renderInjectApp` 에서 `{ kind: 'booting' }` 으로
  만들어진다는 기술이 폐기됐다. `InjectApp` 이 `usePhase` 에 `resolving` 을
  넘긴다.

## Last Updated

2026-08-06 — 계약을 현행 구현에 맞춰 재작성. Phase 와 InjectEvent 목록을
소스와 일치시키고, `useExitApp` 의 실제 사용 형태를 명시하고, Acceptance
Criteria 를 도입했다.
