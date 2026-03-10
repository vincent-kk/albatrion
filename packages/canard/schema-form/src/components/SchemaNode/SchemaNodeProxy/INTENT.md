# SchemaNodeProxy

## Purpose
SchemaNode 렌더링의 공개 조율 레이어. 경로 또는 노드 참조로 SchemaNode를 찾고, `FormTypeRenderer`와 `SchemaNodeInputWrapper`를 연결하여 에러 메시지·가시성·오버라이드 props를 계산한 뒤 렌더러에 전달한다.

## Structure
```
SchemaNodeProxy/
  SchemaNodeProxy.tsx   — 핵심 조율 컴포넌트
  type.ts               — SchemaNodeProxyProps 인터페이스
  index.ts              — SchemaNodeProxy, SchemaNodeProxyProps re-export
```

## Conventions
- TypeScript + React (TSX), 비-memo 함수형 컴포넌트 (상위에서 memo 처리)
- `path` 또는 `node` prop으로 노드 접근 (`useSchemaNode` 훅 위임)
- `data-path={node.path}` div(`display: contents`, `role="none"`)로 DOM 경로 추적 지원
- `FormTypeRenderer`는 `memo(withErrorBoundary(...))` 래핑 필수
- `Wrapper`가 없으면 `Fragment`를 기본값으로 사용
- `RequestRemount` 이벤트로 version을 Wrapper의 key로 활용 → 강제 리마운트

## Boundaries

### Always do
- `node.enabled === false`이면 `null` 반환 (필드 비활성화 지원)
- `errorVisible`이 false이면 `formatError`를 `NULL_FUNCTION`으로 교체
- `FormTypeRenderer`를 항상 `withErrorBoundary`로 래핑
- `Input`을 `SchemaNodeInputWrapper(...)` 팩토리로 생성하여 `FormTypeRenderer`에 전달

### Ask first
- `SchemaNodeProxyProps` 인터페이스에 새 prop 추가 시
- `RERENDERING_EVENT` 마스크 구성 변경 시

### Never do
- `SchemaNodeProxy` 내부에서 직접 `SchemaNode`를 생성하거나 수정
- `overridePropsRef` 값을 non-overridable(node, type, path 등) 필드에 적용
- `FormTypeRenderer`를 에러 경계 없이 렌더링

## Dependencies
- `@/schema-form/core` — `SchemaNode`, `NodeEventType`
- `@/schema-form/hooks` — `useSchemaNode`, `useSchemaNodeTracker`
- `@/schema-form/providers` — `useFormTypeRendererContext`, `useWorkspaceContext`
- `../SchemaNodeInput` — `SchemaNodeInputWrapper`
- `@winglet/react-utils/hoc` — `withErrorBoundary`
- `@winglet/react-utils/hook` — `useConstant`, `useMemorize`
- `@/schema-form/app/constants` — `DISPLAY_CONTENT` 스타일 상수
- `@winglet/common-utils/constant` — `NULL_FUNCTION`
