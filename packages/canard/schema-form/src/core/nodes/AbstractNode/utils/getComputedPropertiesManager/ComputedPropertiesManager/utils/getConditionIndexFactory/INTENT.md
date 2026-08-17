# getConditionIndexFactory

## Purpose

oneOf/anyOf 스키마 배열에서 `&if` / `computed.if` 조건을 파싱하여 현재 활성 브랜치 인덱스를 반환하는 런타임 함수를 생성한다. 단순 등호 조건은 O(1) 딕셔너리 룩업으로 최적화한다.

## Structure

- `getConditionIndexFactory.ts` — oneOf용 단일 인덱스 팩토리 (returns `number`)
- `getConditionIndicesFactory.ts` — anyOf용 다중 인덱스 팩토리 (returns `number[]`)
- `index.ts` — barrel export
- `utils/` — organ 파일: `extractConditionInfo.ts`(조건 표현식 추출·경로 변환), `getExpressionFromSchema.ts`(스키마 프로퍼티에서 표현식 추출), `getSimpleEquality.ts`(단순 등호 패턴 최적화)

## Conventions

- TypeScript strict 모드
- `object` 타입 스키마에만 적용 (비객체는 `undefined` 반환)
- `extractConditionInfo` 로 표현식 추출 → `getSimpleEquality` 로 최적화 시도 → 실패 시 `new Function` 으로 폴백
- 반환: `DynamicFunction<number>` (단일) 또는 `DynamicFunction<number[]>` (다중)
- 매칭 없는 경우 `-1` (단일) 또는 `[]` (다중) 반환
- `schemaIndices`는 입력 스키마 배열의 원래 인덱스를 담고 `expressions`와 길이·순서가 대응한다

## Boundaries

### Always do

- `type !== 'object'` 인 경우 `undefined` 조기 반환
- 조건 컴파일 실패 시 `JsonSchemaError('CONDITION_INDEX')` throw

### Ask first

- `boolean true` 조건 처리 방식 변경 (현재: `expressions.push('true')`)
- 단순 등호 최적화(`getSimpleEquality`) 기준 변경

### Never do

- `array` / `string` 등 비객체 타입에 조건 인덱스 적용
- `schemaIndices` 와 `expressions` 배열의 순서를 불일치하게 처리

## Dependencies

- 형제 팩토리 `../getPathManager`(`PathManager`)와 CPM utils 공유 모듈(`regex`·`type`)
- `@/schema-form/errors`(`JsonSchemaError`) · `@/schema-form/helpers/error`(`formatConditionIndexError`)
