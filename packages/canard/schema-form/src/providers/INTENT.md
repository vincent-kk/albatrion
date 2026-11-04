# providers

## Purpose

`@canard/schema-form` 전체에서 쓰는 React Context Provider와 훅을 모아 둔 곳이다. 폼 설정, 입력 타입 매핑, 렌더러, 입력 제어, 루트 노드, 가상화, 워크스페이스를 각각의 Context로 나눠 prop drilling을 없앤다.

## Conventions

- 각 Context 모듈은 역할 칸인 components(Context 객체와 Provider)와 hooks(소비 훅), 필요하면 utils, 그리고 진입점 index로 이룬다. 훅 이름은 `use<ContextName>Context()` 형태로 짓는다.
- Provider 중첩 순서는 Form.tsx를 따른다: `Workspace → FieldInputs → FieldRenderer → InputControl → Virtualization → RootNode`
- `VirtualizationContext`의 manager는 마운트 시 `VirtualizationManager.create`로 한 번 만들어 고정한다(`useLazyConstant`는 memo와 달리 한 번만 만든다는 보장이 있다). 비활성이거나 IntersectionObserver가 없으면 null이다.
- `ExternalFormContext`는 앱 최상단에 두는 선택적 외부 설정 레이어다. 함수와 컴포넌트 참조는 `useConstant`로 고정해 불필요한 리렌더를 막는다.

## Boundaries

### Always do

- 각 Context 훅은 해당 Context 파일에서만 `useContext` 호출
- Provider 중첩 순서는 `Form.tsx`에 정의된 순서대로 유지
- `ExternalFormContext` 값과 Form 수준 prop을 병합할 때 Form 수준 값을 우선 적용

### Ask first

- 새 Context를 추가, 분리, 통합하거나 Provider 중첩 순서를 바꾸는 경우(하위 컨텍스트의 의존성에 영향)
- `ExternalFormContext` 인터페이스에 새 필드를 추가하는 경우

### Never do

- 이 디렉토리에 Context와 무관한 비즈니스 로직 추가
- Context 값을 Provider 밖에서 직접 변경하거나 Context 모듈끼리 직접 import (각 모듈의 index.ts를 거친다)
