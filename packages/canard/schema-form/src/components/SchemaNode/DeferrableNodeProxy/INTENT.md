# DeferrableNodeProxy

## Purpose

렌더 가상화의 게이트 컴포넌트. 대상 노드의 React 서브트리 마운트를 지연하고, reveal 전에는 경량 placeholder div만 렌더한다. reveal 트리거는 ①IntersectionObserver 교차 ②idle backfill ③RequestFocus/RequestSelect 명령이며, 한 번 reveal되면 되돌리지 않는다(defer-once).

## Structure

```
DeferrableNodeProxy/
  DeferrableNodeProxy.tsx   — 게이트 컴포넌트 (placeholder ↔ NodeProxy 전환)
  type.ts                 — DeferrableNodeProxyProps 인터페이스
  index.ts                — DeferrableNodeProxy, DeferrableNodeProxyProps re-export
```

## Conventions

- placeholder: `<div data-path={path} data-deferred aria-hidden style={{height}}>` — 실제 레이아웃 박스 필요(`display: contents` 금지); 옵션 `Placeholder` 컴포넌트는 wrapper "내부"의 시각 채움만 담당(관찰 대상·공간 예약은 wrapper 소유)
- identity는 마운트 wrapper와 동일한 `data-path`로 통일(DOM 소비자 조회 인터페이스 불변), 상태 구분은 `data-deferred` 마커가 전담
- `NodeProxy`는 prop으로 수신 (`SchemaNodeProxy` 직접 import 시 순환 의존)
- ref는 null-pattern 콜백 (React 18 호환 — ref cleanup 함수 금지)
- reveal 명령 마스크는 `RequestFocus | RequestSelect`만 — `RequestRefresh`는 외부 setValue마다 전 노드에 발행되므로 포함 금지
- `revealed` 초기값은 `manager.hasRevealed(node)` — 캐시 재생성(배열 renumbering) 시 노출 상태 유지

## Boundaries

### Always do

- `node.enabled === false`이면 placeholder도 렌더하지 않고 `null` 반환 (`UpdateComputedProperties` 추적)
- reveal 커밋의 layout effect에서 `manager.markRevealed(node)` 호출 후 pending 명령을 `immediate` 재발행
- placeholder 언마운트 시 `manager.unregister` 보장 (null-pattern ref)

### Ask first

- reveal 명령 마스크(`FORCE_REVEAL_EVENT`) 변경
- placeholder DOM 계약(`data-path`+`data-deferred`, `aria-hidden`) 변경

### Never do

- reveal 후 placeholder로 되돌리는 로직 추가
- `SchemaNodeInput`/`SchemaNodeProxy` 내부 구현 직접 import
- placeholder에서 `data-deferred` 마커 생략 (마커 없는 `data-path`는 "실제 마운트됨"을 의미)

## Dependencies

- `@/schema-form/core` — `NodeEventType`, `SchemaNode`
- `@/schema-form/hooks` — `useSchemaNodeTracker`, `useSchemaNodeSubscribe`
- `@/schema-form/helpers/virtualization` — `VirtualizationManager`
- `../SchemaNodeProxy` — `SchemaNodeProxyProps` (type-only)
