# schema-form/src/core/parsers

## Purpose
JSON Schema 타입별 값 파싱 순수 함수 모음. 알 수 없는 입력 타입을 각 JSON Schema 타입에 맞는 안전한 기본값으로 변환한다.

## Structure
- `parseString.ts` — string 및 number → string, 그 외 → `""`
- `parseNumber.ts` — number/string → number, 그 외 → `NaN` (isInteger 옵션 지원)
- `parseBoolean.ts` — boolean → boolean, 그 외 → `false`
- `parseArray.ts` — array → array, 그 외 → `[]`
- `parseObject.ts` — plain object → object, 그 외 → `{}`
- `index.ts` — barrel export
- `__tests__/` — 타입별 파서 단위 테스트

## Conventions
- 모든 파서는 순수 함수: `(value: unknown, ...options?) => TypedValue`
- 파싱 불가 입력은 throw 하지 않고 빈 기본값 반환 (`""`, `NaN`, `false`, `[]`, `{}`)
- `parseNumber` 의 비숫자 문자 제거 패턴: `/[^\d.-]/g`
- `parseObject` 는 `isPlainObject` 사용 (배열, 클래스 인스턴스, Date 등 제외)

## Boundaries

### Always do
- 파서 함수는 순수 함수로 유지 (사이드 이펙트 없음, 동일 입력 → 동일 출력)
- 새 파서 추가 시 `index.ts` 에 named export 포함
- 파싱 실패는 throw 없이 안전한 기본값 반환
- `__tests__/` 에 경계 케이스 테스트 포함

### Ask first
- `parseNumber` 의 비숫자 문자 제거 정규식 변경 (예: 음수 부호, 소수점 처리 방식)
- `parseString` 이 number 외 타입도 변환하도록 확장 (현재 number만 허용)

### Never do
- 파서 함수 내에서 네트워크, DOM, 파일 접근 등 사이드 이펙트 발생
- 파서에서 JSON Schema 유효성 검사 수행 (노드 레이어의 역할)
- `parseObject` 에서 배열이나 클래스 인스턴스를 plain object로 처리
- 파서 함수에서 예외 throw

## Dependencies
- `@winglet/common-utils/filter` — `isPlainObject`, `isArray`
- `@/schema-form/types` — `ObjectValue`, `ArrayValue`
