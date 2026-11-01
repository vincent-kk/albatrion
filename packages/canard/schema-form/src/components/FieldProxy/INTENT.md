# FieldProxy

## Purpose

JSON Schema 노드 하나를 React 컴포넌트 트리로 변환하는 렌더링 경계. 본체 `FieldProxy`가 필드 노드 하나를 찾아 구독, 렌더러 선택, 입력 팩토리를 한 프록시 컴포넌트에서 소유하고, 주입된 포맷의 실패와 렌더 실패는 렌더러 경계가 맡는다. 본체의 내부 부품 둘(`FieldInputSlot`은 입력 처리, `DeferredFieldProxy`는 지연 마운트)은 `components/` 아래에 있다.

## Structure

```
FieldProxy/
  index.ts                  — FieldProxy, ChildField 이름 export
  FieldProxy.tsx            — 본체: 노드를 렌더러에 연결하는 조율 레이어
  type.ts                   — 재귀 렌더 props 계약 FieldProxyProps
  components/               — 본체의 부품 fractal 칸 (index 없음)
    FieldInputSlot/         — 실제 FieldInput 마운트 및 이벤트 처리 레이어
    DeferredFieldProxy/     — 렌더 가상화 게이트 (placeholder ↔ NodeProxy 지연 전환)
```

## Conventions

- TypeScript와 React(TSX)로 작성한 함수형 컴포넌트에 memo를 쓴다. `FieldProxy`가 공개 API이고, 부품 둘은 내부 구현이다.
- 노드 추적과 메모된 선택은 훅에 두며, 별도의 필드 컴포넌트나 필드 경로 Provider는 만들지 않는다.
- 렌더러는 한 번 선택해서 memo 없이 ErrorBoundary로 직접 감싸고, errorMessage는 그 경계 안에서 계산한다. 현재 필드 경로는 보고기 훅에 넘긴다.
- display-contents 래퍼(`data-path`, `role="none"`)와 RequestRemount 래퍼 key를 유지한다.
- 노드 이벤트는 `useFieldNodeTracker` / `useFieldNodeSubscribe` 훅으로 구독한다. 예외로 `useFieldInputControl`은 입력 속성, 자식 구성, Refresh 세 가지 추적을 한 스냅숏으로 합치려고 `useSyncExternalStore`를 직접 사용한다.

## Boundaries

### Always do

- 외부에서는 `FieldProxy`를 통해서만 노드를 렌더링하고, 노드가 없거나 `node.isPresent === false`이면 `null` 반환
- 오류 표시 조건이 거짓이면 포맷된 오류를 숨기고, 포맷 실패와 렌더러 실패는 같은 필드 보고기와 경로로 격리
- Refresh 동안 렌더러 경계를 유지하고, 하위 트리는 RequestRemount일 때만 교체
- `FieldProxy`를 `NodeProxy` prop으로 재귀 전달해서 하위 노드 렌더링

### Ask first

- `RERENDERING_EVENT` 마스크(리렌더 범위)를 바꾸거나, `type.ts`의 `FieldProxyProps`를 수정하거나, 공개 프록시 prop을 추가할 때

### Never do

- `FieldInputSlot`·`DeferredFieldProxy`를 이 fractal 바깥에서 직접 import
- 프록시에서 필드 노드를 만들거나 변경, 소비자 props로 노드 식별 props를 덮어쓰기
- 필드 전체를 감싸는 두 번째 경계 추가
- `type.ts`의 `FieldProxyProps` 계약에 렌더 컴포넌트 구현을 import (부품은 형만 읽는다)
- 노드 이벤트를 `useEffect` 없이 동기적으로 구독
- `__tests__` 디렉토리에 INTENT.md 생성 (organ 디렉토리)
