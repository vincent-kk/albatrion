# Form

## Purpose
`@canard/schema-form`의 최상위 공개 컴포넌트. JSON Schema를 받아 전체 폼 트리를 초기화하고, 모든 Context Provider를 조합하여 폼 상태·검증·렌더링을 통합 관리한다.

## Structure
```
Form/
  Form.tsx          — 핵심 폼 컴포넌트 (forwardRef + memo + ErrorBoundary)
  type.ts           — FormProps, FormHandle, FormChildrenProps 타입 정의
  util.ts           — createChildren() 헬퍼
  index.ts          — Form 네임스페이스 조립 및 public export
  components/
    FormGroup.tsx   — 레이블+입력+에러를 묶은 완전한 필드 그룹
    FormInput.tsx   — 입력 렌더링 전용
    FormLabel.tsx   — 레이블 렌더링 전용
    FormError.tsx   — 에러 메시지 렌더링 전용
    FormRender.tsx  — 커스텀 렌더 함수 기반 필드
    FormRootProxy.tsx — <form> 태그와 기본 SchemaNodeProxy 래퍼
    index.ts
```

## Conventions
- TypeScript + React 18+, Generic 타입 파라미터(`Schema`, `Value`) 사용
- `Form` = `BaseForm` + `{ Render, Group, Label, Input, Error }` 네임스페이스
- `FormHandle` ref로 명령형 API 제공: `focus`, `select`, `reset`, `validate`, `submit`, `setValue`, `getValue`, `getErrors`, `getAttachedFilesMap`
- Provider 중첩 순서: `WorkspaceContext → FormTypeInputsContext → FormTypeRendererContext → InputControlContext → RootNodeContext → FormRootProxy`
- `children`은 ReactNode 또는 `(props: FormChildrenProps) => ReactNode` 렌더 함수 모두 지원
- `ValidationError`는 submit 시 검증 실패 전용 에러 클래스

## Boundaries

### Always do
- Provider 중첩 순서를 반드시 유지
- `forwardRef`로 `FormHandle` ref를 외부에 노출
- `memo`와 `withErrorBoundaryForwardRef`로 래핑하여 성능·안정성 보장
- `jsonSchema` 변경 시 `preprocessSchema(clone(schema))`로 안전하게 복제 후 전처리

### Ask first
- Provider 중첩 순서 또는 컨텍스트 구성 변경 시
- `FormHandle` 인터페이스에 새 메서드 추가 시
- `FormProps`에 새 공개 prop 추가 시

### Never do
- `Form` 컴포넌트 내부에서 직접 SchemaNode를 생성 (RootNodeContextProvider가 담당)
- `children` prop 이외의 방법으로 폼 레이아웃을 하드코딩
- Provider를 부분적으로만 렌더링하거나 순서를 변경

## Dependencies
- `@/schema-form/providers` — 5개 ContextProvider
- `@/schema-form/core` — `SchemaNode`, `NodeEventType`, `InferSchemaNode`
- `@/schema-form/errors` — `ValidationError`
- `@/schema-form/helpers/error` — `formatSchemaValidationFailedError`
- `@/schema-form/helpers/jsonSchema` — `preprocessSchema`
- `@winglet/react-utils/hoc` — `withErrorBoundaryForwardRef`
- `@winglet/react-utils/hook` — `useHandle`, `useMemorize`, `useReference`, `useVersion`
- `@winglet/common-utils/function` — `getTrackableHandler`
