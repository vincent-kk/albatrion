# getMergeSchemaHandler

## Purpose

JSON Schema의 타입을 기반으로 적절한 교집합(intersect) 병합 함수를 선택하여 반환한다. allOf 병합 시 타입별 특화 로직을 위임하는 팩토리 역할을 한다.

## Structure

타입별 교집합 구현은 구조 깊이 제한 때문에 부모 프랙탈의 `../../intersectSchema`에 둡니다. 이 팩토리는 그 진입점을 소비해 핸들러를 선택하며, 구현을 이 내부로 다시 복제하지 않습니다.

## Conventions

- TypeScript strict 모드
- 시그니처: `getMergeSchemaHandler(schema) => MergeSchemaHandler | null`
- `MergeSchemaHandler`: `(base: JSONSchema, source: Partial<JSONSchema>) => JSONSchema`
- `extractSchemaInfo`로 type 추출 후 switch 분기
- type이 없거나 알 수 없는 타입: `null` 반환
- `number`와 `integer` 모두 `intersectNumberSchema`로 위임

## Boundaries

### Always do

- 새 타입 지원 시 `../../intersectSchema`에 구현 파일 추가 후 switch case 추가
- `null` 반환 시 `processAllOfSchema`에서 병합 없이 원본 반환하도록 계약 유지
- `../../intersectSchema`의 진입점을 통해 타입별 함수 import

### Ask first

- `number`와 `integer`를 다른 핸들러로 분리하는 경우
- `virtual` 타입에 대한 핸들러 추가

### Never do

- 이 함수 내부에서 직접 스키마를 병합하거나 변경
- `extractSchemaInfo` 없이 `schema.type`을 직접 참조
- `null` 반환 대신 기본 병합 로직을 폴백으로 실행
