# Field

## Purpose

JSON Schema 노드 하나를 React 컴포넌트 트리로 변환하는 렌더링 경계. `FieldProxy`(렌더 조율)와 `FieldInputSlot`(입력 처리)의 두 하위 모듈로 구성되며, 전체 폼 필드 렌더링의 핵심 진입점이다.

## Structure

```
Field/
  index.ts                  — FieldProxy, FieldProxyProps, ChildField re-export
  FieldProxy/               — 노드를 렌더러에 연결하는 조율 레이어
  FieldInputSlot/           — 실제 FieldInput 마운트 및 이벤트 처리 레이어
  DeferredFieldProxy/       — 렌더 가상화 게이트 (placeholder ↔ NodeProxy 지연 전환)
  __tests__/                — FieldNodePropsFlow 통합 테스트
```

## Conventions

- TypeScript + React (TSX), 함수형 컴포넌트 + memo
- `FieldProxy`가 공개 API, `FieldInputSlot`은 내부 구현
- 노드 이벤트 구독은 `useFieldNodeTracker` / `useFieldNodeSubscribe` 훅 사용
- 예외: 입력 제어 훅 `useFieldInputControl`은 입력 속성·자식 구성·Refresh 세 추적을 하나의 스냅숏으로 합치려고 `useSyncExternalStore`를 직접 사용
- `data-path` 속성을 div(`display: contents`, `role="none"`)에 부여하여 DOM에서 경로 추적 가능

## Boundaries

### Always do

- `FieldProxy`를 통해서만 외부에서 노드를 렌더링
- `node.enabled === false`인 경우 `null` 반환
- `FieldProxy`를 `NodeProxy` prop으로 재귀 전달하여 하위 노드 렌더링

### Ask first

- `RERENDERING_EVENT` 마스크(리렌더 범위) 또는 `FieldProxyProps` 공개 인터페이스 수정 시

### Never do

- `FieldInputSlot`·`DeferredFieldProxy`를 `Field` 모듈 외부에서 직접 import
- 노드 이벤트를 `useEffect` 없이 동기적으로 구독
- `__tests__` 디렉토리에 INTENT.md 생성 (organ 디렉토리)
