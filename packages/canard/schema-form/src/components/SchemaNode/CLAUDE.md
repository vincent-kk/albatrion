# SchemaNode

## Purpose
JSON Schema 노드 하나를 React 컴포넌트 트리로 변환하는 렌더링 경계. `SchemaNodeProxy`(렌더 조율)와 `SchemaNodeInput`(입력 처리)의 두 하위 모듈로 구성되며, 전체 폼 필드 렌더링의 핵심 진입점이다.

## Structure
```
SchemaNode/
  index.ts                  — SchemaNodeProxy, SchemaNodeProxyProps, ChildNodeComponent re-export
  SchemaNodeProxy/          — 노드를 렌더러에 연결하는 조율 레이어
  SchemaNodeInput/          — 실제 FormTypeInput 마운트 및 이벤트 처리 레이어
  __tests__/                — SchemaNodePropsFlow 통합 테스트
```

## Conventions
- TypeScript + React (TSX), 함수형 컴포넌트 + memo
- `SchemaNodeProxy`가 공개 API, `SchemaNodeInput`은 내부 구현
- 노드 이벤트 구독은 `useSchemaNodeTracker` / `useSchemaNodeSubscribe` 훅 사용
- `data-path` 속성을 span에 부여하여 DOM에서 경로 추적 가능

## Boundaries

### Always do
- `SchemaNodeProxy`를 통해서만 외부에서 노드를 렌더링
- `node.enabled === false`인 경우 `null` 반환
- `SchemaNodeProxy`를 `NodeProxy` prop으로 재귀 전달하여 하위 노드 렌더링

### Ask first
- `RERENDERING_EVENT` 마스크 변경 시 (리렌더 범위에 영향)
- `SchemaNodeProxy`의 공개 props 인터페이스(`SchemaNodeProxyProps`) 수정 시

### Never do
- `SchemaNodeInput`을 `SchemaNode` 모듈 외부에서 직접 import
- 노드 이벤트를 `useEffect` 없이 동기적으로 구독
- `__tests__` 디렉토리에 CLAUDE.md 생성 (organ 디렉토리)

## Dependencies
- `@/schema-form/core` — `SchemaNode`, `NodeEventType`, `isTerminalNode`
- `@/schema-form/hooks` — `useSchemaNode`, `useSchemaNodeTracker`, `useSchemaNodeSubscribe`
- `@/schema-form/providers` — `useFormTypeRendererContext`, `useWorkspaceContext`
- `@winglet/react-utils/hoc` — `withErrorBoundary`
- `@winglet/react-utils/hook` — `useConstant`, `useMemorize`
