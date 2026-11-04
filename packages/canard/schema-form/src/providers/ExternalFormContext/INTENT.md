# ExternalFormContext

## Purpose

애플리케이션 수준에서 여러 `<Form>` 인스턴스에 공통 설정을 제공하는 외부 Context. 커스텀 렌더러, 입력 정의, 에러 표시 정책, 검증 모드를 prop drilling 없이 폼 트리 전체에 주입한다.

## Structure

```
ExternalFormContext/
  ExternalFormContext.ts          — Context 객체 및 ExternalFormContext 인터페이스 정의
  ExternalFormContextProvider.tsx — 공개 Provider 컴포넌트 (ExternalFormContextProviderProps)
  useExternalFormContext.ts       — 내부 소비 훅
  index.ts                        — Provider, 훅, Props 타입 re-export
```

## Conventions

- TypeScript와 React로 작성하며, Context 초기값은 빈 객체 `{} as ExternalFormContext`다.
- `fieldInputDefinitions`는 Provider가 마운트될 때 `useConstant`로 고정하므로 런타임에 바꿀 수 없다.
- `context` prop은 `useSnapshot`으로 안정화해서 불필요한 리렌더를 막는다.
- Form 수준 props가 이 Context 값보다 항상 우선한다(`FieldRendererContextProvider`에서 병합한다).

## Boundaries

### Always do

- `fieldInputDefinitions`를 `useConstant`로 고정해서 마운트 이후의 변경을 막는다.
- `useExternalFormContext`는 `providers/` 안에서만 쓴다(`FieldRendererContext`, `RootNodeContext`, `WorkspaceContext`가 소비한다).

### Ask first

- `ExternalFormContext` 인터페이스에 새 필드를 추가하는 경우(Form 수준 병합 로직도 같이 고쳐야 한다)
- `validatorFactory`를 런타임에 교체해야 하는 요구가 생긴 경우

### Never do

- 이 Context에서 FieldNode를 직접 만들거나 조작하는 것
- 애플리케이션 코드에서 `useExternalFormContext`를 직접 import하는 것(`providers/index.ts`를 통해 접근한다)
- `ExternalFormContext` 초기값에 기본 렌더러를 하드코딩하는 것
