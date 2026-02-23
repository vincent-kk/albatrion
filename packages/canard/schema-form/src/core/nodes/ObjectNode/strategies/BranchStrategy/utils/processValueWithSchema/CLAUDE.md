# processValueWithSchema

## Purpose
조건부 스키마에 따라 객체 값을 필터링하는 유틸 모음. `processValueWithCondition`은 조건 맵 기반 필터링을, `processValueWithValidate`는 허용 키 검증 함수 기반 필터링을 수행한다.

## Structure
- `processValueWithCondition.ts` — `FieldConditionMap` 기반 값 필터링
- `processValueWithValidate.ts` — `validateAllowedKey` 함수 기반 값 필터링
- `utils/requiredFactory.ts` — 조건 평가 함수 팩토리
- `index.ts` — re-export

## Conventions
- 순수 함수, 부수 효과 없음
- `processValueWithCondition`: `__isolated__` 모드에서 적용 (직접 setValue 시)
- `processValueWithValidate`: oneOf/anyOf 분기 전환 후 적용
- `value == null`이면 그대로 반환
- 허용되지 않는 키는 결과 객체에서 제외

## Boundaries

### Always do
- 입력 `value`는 수정하지 않고 새 객체 반환
- `null`/`undefined` 값은 필터링 없이 그대로 반환

### Ask first
- `requiredFactory` 조건 평가 방식 변경 (동적 표현식 실행 포함)

### Never do
- 입력 `value` 객체를 직접 변경
- `processValueWithCondition`과 `processValueWithValidate`를 혼용 호출

## Dependencies
- `FieldConditionMap` — `getFieldConditionMap`
- `requiredFactory` — `utils/requiredFactory`
- `ObjectValue` — `@/schema-form/types`
