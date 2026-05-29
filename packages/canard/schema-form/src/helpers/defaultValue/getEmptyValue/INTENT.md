# getEmptyValue

## Purpose

JSON Schema 타입 문자열을 받아 컨테이너 타입(`array`, `object`)에 한해
빈 초기값을 반환하는 최소 단위 순수 함수.
원시 타입은 `undefined` 를 반환하여 상위 계층이 직접 처리하도록 위임한다.

## Structure

| 파일               | 역할                                     |
| ------------------ | ---------------------------------------- |
| `getEmptyValue.ts` | 구현 — 3줄 조건 분기                     |
| `index.ts`         | `getEmptyValue` named re-export (barrel) |

## Conventions

- 시그니처: `(type?: string): ArrayValue | ObjectValue | undefined`
- `'array'` → `[]` (새 배열 리터럴), `'object'` → `{}` (새 객체 리터럴)
- `string`, `number`, `boolean`, `null`, `undefined` 등 원시·미확인 타입 → `undefined`
- `type` 파라미터는 선택적: `undefined` 전달 시 항상 `undefined` 반환

## Boundaries

### Always do

- 매 호출마다 새 리터럴(`[]`, `{}`)을 반환하여 호출부 간 참조 공유 방지
- 원시 타입(`'string'`, `'number'`, `'boolean'`, `'null'`)은 반드시 `undefined` 반환 유지

### Ask first

- 새 컨테이너 타입 추가 (노드 시스템 전반의 초기화 동작에 연쇄 영향)
- `null`, `0`, `false` 등 원시 타입에 기본값 반환 로직 추가

### Never do

- 이 함수 내에서 스키마 파싱, `extractSchemaInfo` 호출 등 외부 의존성 추가
- 반환값을 메모이즈하거나 싱글턴 참조 반환 (값 공유 버그 유발)
- `virtual` 타입 처리 추가 — 해당 분기는 `getDefaultValue` 책임

## Dependencies

**내부**

- `@/schema-form/types` — `ArrayValue`, `ObjectValue`

**외부**

- 없음
