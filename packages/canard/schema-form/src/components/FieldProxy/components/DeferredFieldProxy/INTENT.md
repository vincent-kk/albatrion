# DeferredFieldProxy

## Purpose

렌더 가상화의 게이트 컴포넌트. 대상 노드의 React 서브트리 마운트를 미루고, 노출(reveal)되기 전에는 가벼운 placeholder div만 렌더한다. 노출을 일으키는 계기는 ①IntersectionObserver 교차 ②idle backfill ③RequestFocus/RequestSelect 명령이며, 한 번 노출되면 되돌리지 않는다(defer-once).

## Structure

```
DeferredFieldProxy/
  DeferredFieldProxy.tsx   — 게이트 컴포넌트 (placeholder ↔ NodeProxy 전환)
  type.ts                 — DeferredFieldProxyProps 인터페이스
  index.ts                — DeferredFieldProxy re-export
```

## Conventions

- placeholder: `<div data-path={path} data-deferred aria-hidden style={{height}}>`. 실제 레이아웃 박스가 필요하므로 `display: contents`는 쓰지 않는다. 선택 사항인 `Placeholder` 컴포넌트는 wrapper "내부"의 시각적 채움만 맡고, 관찰 대상과 공간 예약은 wrapper가 소유한다.
- identity는 마운트된 wrapper와 같은 `data-path`로 통일해서 DOM 소비자의 조회 인터페이스가 바뀌지 않게 하고, 상태 구분은 `data-deferred` 마커만 맡는다.
- `NodeProxy`는 prop으로 받는다. `FieldProxy`를 직접 import하면 순환 의존이 생기기 때문이다.
- ref는 null-pattern 콜백을 쓴다. React 18과 호환되도록 ref cleanup 함수는 쓰지 않는다.
- 노출 명령 마스크는 `RequestFocus | RequestSelect`뿐이다. `RequestRefresh`는 외부 setValue마다 모든 노드에 발행되므로 넣지 않는다.
- `revealed`의 초기값은 `manager.hasRevealed(node)`이다. 캐시를 다시 만들 때(배열 번호 재할당)도 노출 상태가 유지된다.

## Boundaries

### Always do

- `node.isPresent === false`이면 placeholder도 렌더하지 않고 `null` 반환 (`UpdateControlledProperties` 추적)
- 노출을 커밋하는 layout effect에서 `manager.markRevealed(node)`를 호출한 뒤, 보류한 명령을 `immediate`로 다시 발행
- placeholder를 언마운트할 때 `manager.unregister`가 반드시 호출되게 한다 (null-pattern ref)

### Ask first

- 노출 명령 마스크(`FORCE_REVEAL_EVENT`)를 바꿀 때
- placeholder DOM 계약(`data-path`+`data-deferred`, `aria-hidden`)을 바꿀 때

### Never do

- 노출된 뒤에 다시 placeholder로 되돌리는 로직 추가
- `FieldInputSlot`/`FieldProxy`의 내부 구현을 직접 import
- placeholder에서 `data-deferred` 마커 생략 (마커 없는 `data-path`는 "실제로 마운트됨"을 뜻한다)
