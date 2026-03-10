# extractSchemaInfo

## Purpose
JSON Schema에서 `type`과 `nullable` 정보를 추출하여 정규화된 형태로 반환한다. 배열 타입 표기(`['string', 'null']`)와 단일 타입 표기를 모두 처리한다.

## Structure
- `extractSchemaInfo.ts` — 핵심 구현
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드, 순수 함수
- 반환 타입: `{ type: JsonSchemaType; nullable: boolean } | null`
- `null` 반환: schema가 undefined이거나 type이 없거나 배열 타입이 2개 초과이거나 null이 없는 경우
- 배열 타입 처리 규칙:
  - 길이 1: `{ type: arr[0], nullable: arr[0] === 'null' }`
  - 길이 2: null 인덱스를 찾아 나머지를 type으로, `nullable: true`
  - 길이 0 또는 2 초과: `null` 반환

## Boundaries

### Always do
- 입력이 `undefined`이거나 `type`이 없으면 `null` 반환
- 배열 타입에서 null 포함 여부를 기준으로 `nullable` 결정
- 단일 타입의 경우 `jsonSchema.nullable === true`도 `nullable: true`로 처리

### Ask first
- 반환 타입 구조 변경 (호출부 전반에 영향을 줌)
- 배열 길이 2 초과 허용 여부 정책 변경

### Never do
- 스키마 객체를 변경(mutate)하거나 복제
- `getMergeSchemaHandler`, `preprocessSchema` 등 다른 헬퍼를 내부에서 호출

## Dependencies
- `@winglet/common-utils/filter` — `isArray`
- `@/schema-form/types` — `JsonSchemaType`, `JsonSchemaWithVirtual`
