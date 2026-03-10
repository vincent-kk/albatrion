# afterMicrotask

## Purpose
주어진 핸들러를 macrotask(setTimeout)로 실행하는 래퍼 함수를 생성한다. 중복 호출 시 이전 태스크를 취소하고 새 태스크를 예약하여 디바운스 효과를 제공한다. 루트 노드의 `onChange` 콜백을 React Fiber 스케줄러와 충돌 없이 지연 실행하는 데 사용된다.

## Structure
- `afterMicrotask.ts` — 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- `MessageChannel` 대신 `setTimeout` 기반 (`scheduleMacrotaskSafe`) — React Fiber 스케줄러 충돌 방지
- 반환: `() => void` — 호출마다 이전 태스크 취소 후 재예약
- 단일 macrotaskId 로 중복 예약 방지

## Boundaries

### Always do
- `scheduleMacrotaskSafe` / `cancelMacrotaskSafe` 를 통해서만 macrotask 예약/취소

### Ask first
- `MessageChannel` 또는 다른 스케줄러로 교체 (React 버전 업그레이드 시)

### Never do
- `Promise.resolve()` / microtask 기반으로 교체 (React 렌더링 사이클과 충돌)
- 루트 노드 `onChange` 외 용도로 사용

## Dependencies
- `@winglet/common-utils/scheduler` — `scheduleMacrotaskSafe`, `cancelMacrotaskSafe`
- `@aileron/declare` — `Fn`
