# NumberNode

## Purpose
JSON Schema `number`/`integer` 타입을 처리하는 단말 노드. 부동소수점 비교(`isClose`) 및 정수 강제(`integer` 타입), NaN/빈값 omit 처리를 담당한다.

## Structure
- `NumberNode.ts` — 메인 클래스, `AbstractNode` 상속
- `filter.ts` — `isNumberNode` 타입 가드
- `index.ts` — re-export

## Conventions
- `schemaType === 'integer'`이면 `parseNumber`에 정수 모드 전달
- `__equals__`는 `isClose`로 부동소수점 오차 허용 비교 (full precision 모드 별도)
- `omitEmpty !== false`이면 `NaN`과 `undefined`를 `undefined`로 변환
- `onChange` 핸들러는 생성자에서 omitEmpty 여부에 따라 분기 설정
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- 정수 여부는 `schemaType` 비교로만 판단 (`type` 직접 비교 금지)
- `NaN` 값은 항상 `undefined`로 처리 (omitEmpty 기본 활성화)
- `__equals__` 오버라이드로 부동소수점 비교 보장

### Ask first
- `isClose` tolerance 값 변경
- `omitEmpty` 기본값 변경 (현재 `true`)

### Never do
- `__value__`에 `NaN` 저장
- `integer` 타입에 소수값 강제 저장

## Dependencies
- `AbstractNode` — 기반 클래스
- `parseNumber` — `core/parsers`
- `@winglet/common-utils/math` (`isClose`)
- `NumberSchema`, `NumberValue` — `@/schema-form/types`
