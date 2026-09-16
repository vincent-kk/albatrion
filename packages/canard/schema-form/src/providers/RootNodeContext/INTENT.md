# RootNodeContext

## Purpose

JSON Schema로부터 루트 `SchemaNode` 트리를 생성하고 Context로 공급한다. 검증 모드·외부 에러·변경/검증/상태 콜백을 연결하며, 노드 초기화 완료 시 `onReady`로 루트 노드를 Form 컴포넌트에 전달한다.

## Conventions

- TypeScript + React, Generic 타입 파라미터 (`Schema`, `Value`) 사용
- `nodeFromJsonSchema()`로 `useMemo` 내에서 루트 노드 생성 (jsonSchema/defaultValue 변경 시 재생성)
- 기본 `validationMode`: `ValidationMode.OnChange | ValidationMode.OnRequest`
- 외부 에러(`errors` prop): `transformErrors()`로 변환 후 노드 경로별 `setExternalErrors()` 호출
- `contextNodeFactory(context)`로 사용자 정의 context를 노드 시스템에 주입
- 이벤트 구독: `UpdateGlobalError` → `onValidate`, `UpdateGlobalState` → `onStateChange`

## Boundaries

### Always do

- `nodeFromJsonSchema`를 `useMemo` 내에서만 호출 (의존성 변경 시 재생성)
- `onReady` 콜백을 구독 설정 이후에 호출 (`useEffect` 내, rootNode 준비 완료 후)
- `useEffect` cleanup에서 반드시 `unsubscribe()` 반환

### Ask first

- 기본 `validationMode` 변경 시 (전체 폼 검증 동작에 영향)
- `contextNode` 생성 및 업데이트 방식 변경 시

### Never do

- `nodeFromJsonSchema` 외부에서 루트 노드를 직접 생성하거나 이 Context에 주입
- `errors` prop 변환 없이 `setExternalErrors()`에 직접 전달
- `RootNodeContext`를 SchemaNode 트리 외부에서 소비 (Form 내부 전용)

## Dependencies

contextNode는 렌더 최적화용 캐시가 아니라 Provider 수명 동안 유지되는 인스턴스이므로 useLazyConstant로 한 번 생성합니다. 검증 설정의 폴백은 외부 폼 설정에서 받고, 사용자 context는 WorkspaceContext의 값을 사용합니다.
