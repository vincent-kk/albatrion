# schema-form/src/fieldInputs

## Purpose

JSON Schema의 타입과 속성에 맞춰 렌더링할 React 입력 컴포넌트를 연결하는 기본 FieldInput 정의 모음이다. 플러그인으로 확장할 수 있는 우선순위 기반 매칭 체계의 폴백 기본값이다.

## Conventions

- 배열 순서가 곧 매칭 우선순위이며 앞쪽일수록 우선순위가 높다(DateFormat > Checkbox > Radio > Enum > Virtual > Array > Object > Boolean > String > Number).
- 입력 하나마다 `fieldInputDefinitions/<이름>/` fractal 하나를 두고, 그 진입점 `index.ts`가 `Definition` 접미사가 붙은 정의(`FieldInputStringDefinition` 등)를 만들어 이름으로 내보낸다. 뿌리 `index.tsx`는 이 진입점들을 순서대로 조립하기만 한다.
- `test` 조건은 `{ type, format, nullable }` 형태의 객체이거나 `(hint) => boolean` 함수다.
- 컴포넌트는 `FieldInputProps` 인터페이스를 구현한다.

## Boundaries

### Always do

- 새 정의는 `fieldInputDefinitions/` 아래에 fractal(INTENT·DETAIL·`index.ts`·컴포넌트)로 만들고, `index.tsx` 배열에서 알맞은 우선순위 위치에 끼워 넣는다.
- `test` 조건은 가능한 한 구체적으로 써서 의도하지 않은 매칭을 막는다.
- 각 컴포넌트는 `value`, `onChange`, `node`, `errors` props를 올바르게 처리한다.

### Ask first

- 기존 정의의 `test` 조건 변경(매칭 대상이 바뀌어 렌더링이 회귀할 수 있다)
- 배열 순서 재정렬(우선순위가 바뀌어 전체 폼 렌더링에 영향을 준다)
- 기본 정의 삭제(플러그인을 등록하지 않은 환경에서 렌더링에 실패할 수 있다)

### Never do

- `builtinFieldInputDefinitions` 배열에 UI 라이브러리에 의존하는 컴포넌트를 넣지 않는다(플러그인으로 분리해야 한다).
- `test` 함수에서 사이드 이펙트를 일으키지 않는다.

## Dependencies

- `@/schema-form/types` — `FieldInputDefinition`, `FieldInputProps`
- React (JSX)
