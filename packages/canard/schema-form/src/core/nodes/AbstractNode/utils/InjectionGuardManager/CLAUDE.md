# InjectionGuardManager

## Purpose
`injectTo` 스키마 속성에 의한 노드 간 값 주입 시 순환 주입 루프를 방지한다. 현재 주입 중인 노드 경로를 추적하고, macrotask 스케줄링으로 동기 주입 완료 후 경로를 일괄 해제한다.

## Structure
- `InjectionGuardManager.ts` — 클래스 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- 루트 노드에만 인스턴스 생성 (`AbstractNode` 생성자에서 `this.isRoot` 조건)
- 자식 노드는 `this.rootNode.__injectionGuardManager__` 를 통해 접근
- `scheduleClearInjectedPaths()`: 중복 스케줄링 방지 (`__scheduledClearInjectedPathsId__ !== null`)
- `Set<string>` 기반 O(1) 경로 조회

## Boundaries

### Always do
- `injectTo` 핸들러 진입 시 `add(path)` → 작업 완료 후 `scheduleClearInjectedPaths()` 호출
- 주입 전 `has(path)` 로 순환 여부 확인 후 순환이면 스킵

### Ask first
- macrotask 대신 다른 스케줄링 전략 사용 (동기 완료 보장 방식 변경)

### Never do
- 루트 노드 외에서 `InjectionGuardManager` 인스턴스 생성
- `clear()` 를 비동기 주입이 완료되기 전에 직접 호출

## Dependencies
- `@winglet/common-utils/scheduler` — `scheduleMacrotaskSafe`
- `../../AbstractNode` — `AbstractNode['path']` 타입 참조
