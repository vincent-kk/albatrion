# getNodeGroup

## Purpose
JSON Schema 타입과 스키마 정의를 분석하여 노드가 `branch`(자식 보유 가능) 인지 `terminal`(리프) 인지 결정한다. `object`/`array` 타입이라도 `FormTypeInput` 이 직접 지정된 경우 terminal로 처리된다.

## Structure
- `getNodeGroup.ts` — 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- 판단 우선순위:
  1. `schema.terminal` boolean이 명시된 경우 해당 값 사용
  2. `isBranchType(type)` 인 경우 `schema.FormTypeInput` 의 React 컴포넌트 여부로 판단
  3. 나머지는 `terminal`
- `isReactComponent(schema.FormTypeInput)` 체크로 컴포넌트 직접 지정 여부 확인

## Boundaries

### Always do
- `AbstractNode` 생성자에서 한 번만 호출하여 `group` 속성에 할당
- `schema.terminal` 명시적 boolean 이 최우선

### Ask first
- `isBranchType` 판단 기준 변경 (현재: object, array만 branch)
- `FormTypeInput` 외 다른 조건으로 terminal 강제하는 방식 추가

### Never do
- 런타임 중 `group` 을 재계산 (생성자 할당 후 불변)
- `schema.terminal` 없이 string/number/boolean 을 branch로 처리

## Dependencies
- `@winglet/common-utils/lib` — `hasOwnProperty`
- `@winglet/react-utils/filter` — `isReactComponent`
- `@/schema-form/helpers/jsonSchema` — `isBranchType`
- `@/schema-form/types` — `JsonSchemaType`, `JsonSchemaWithVirtual`
