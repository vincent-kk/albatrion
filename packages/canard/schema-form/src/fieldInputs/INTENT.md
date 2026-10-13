# schema-form/src/formTypeDefinitions

## Purpose

JSON Schema 타입과 속성에 따라 렌더링할 React 입력 컴포넌트를 매핑하는 기본 FormTypeInput 정의 모음. 플러그인으로 확장 가능한 우선순위 기반 매칭 시스템의 폴백 기본값이다.

## Conventions

- 배열 순서가 매칭 우선순위: 앞쪽이 높은 우선순위 (DateFormat > Checkbox > Radio > Enum > Virtual > Array > Object > Boolean > String > Number)
- 각 파일은 `Definition` suffix로 named export (`FormTypeInputStringDefinition` 등)
- `test` 조건: 객체 형태 `{ type, format, nullable }` 또는 함수 `(hint) => boolean`
- 컴포넌트는 `FormTypeInputProps` 인터페이스 구현

## Boundaries

### Always do

- 새 정의 추가 시 `index.tsx` 배열에서 적절한 우선순위 위치에 삽입
- `test` 조건은 최대한 구체적으로 작성하여 의도치 않은 매칭 방지
- 각 컴포넌트는 `value`, `onChange`, `node`, `errors` props를 올바르게 처리

### Ask first

- 기존 정의의 `test` 조건 변경 (매칭 대상 변경으로 렌더링 회귀 가능)
- 배열 순서 재정렬 (우선순위 변경으로 전체 폼 렌더링 영향)
- 기본 정의 삭제 (플러그인 미등록 환경에서 렌더링 실패 가능)

### Never do

- `formTypeDefinitions` 배열에 UI 라이브러리 의존 컴포넌트 포함 (플러그인으로 분리해야 함)
- `test` 함수에서 사이드 이펙트 발생

## Dependencies

- `@/schema-form/types` — `FormTypeInputDefinition`, `FormTypeInputProps`
- React (JSX)
