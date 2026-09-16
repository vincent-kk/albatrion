# ui

## Purpose

TTY 실행에서 사용하는 React·Ink UI를 소유합니다. renderInjectApp은 에이전트·스코프 선택, 대상별 계획, 강제 적용 확인, 실행 결과를 하나의 화면 흐름으로 연결하고 종료 코드를 반환합니다. CLI의 renderOrFallback이 대화형 경로를 선택한 경우에만 동적으로 로드하며, 공개 패키지 서브패스로 노출하지 않습니다.

## Structure

상태 전이 규칙은 UI 프레임워크에 의존하지 않는 reducer가 소유합니다. 화면 컴포넌트와 파이프라인 훅은 그 상태를 소비하며, 렌더링 계층에 전이 규칙을 복제하지 않습니다.

## Conventions

- One hook per pipeline step — `useResolveStep`, `usePlanStep`, `useForceConfirmStep`, `useApplyStep` — driven by `useInjectSession`. Progress is reported per completed action, not on a timer.

## Boundaries

### Always do

- Compose `core/**` primitives directly (`resolveHashManifest`, `computeNamespacePrefixes`, `resolveAgentTarget`, `resolveDestinations`, `buildPlan`, `partitionActions`, `applyAction`, `applyBlockActions`, `summarize`) plus `asyncPool` to drive the pipeline
- Surface the final exit code through `useExitApp` so `renderInjectApp` resolves with a `number`

### Ask first

- Adding a new Ink entry beyond `renderInjectApp`
- Introducing a global UI store; per-hook `useReducer` is the pattern

### Never do

- Write to `process.stdout`/`stderr` directly; all output goes through Ink's virtual DOM
- Import from `commands/**`
- Read `package.json` or walk `node_modules`; consume the `ConsumerPackage[]` the caller provides
