# ComputedPropertiesManager

## Purpose
JSON Schema의 `computed` 속성을 파싱하여 노드의 동적 상태(active, visible, readOnly, disabled, oneOfIndex, anyOfIndices, watchValues, derived)를 의존성 값 변화에 따라 재계산하는 매니저 클래스.

## Structure
- `ComputedPropertiesManager.ts` — 클래스 본체
- `index.ts` — barrel export
- `utils/` — 팩토리 함수 및 내부 유틸 (organ)
  - `checkComputedOptionFactory/` — boolean 조건 함수 생성
  - `createDynamicFunction/` — JS 표현식을 런타임 함수로 컴파일
  - `getConditionIndexFactory/` — oneOf/anyOf 인덱스 계산 함수 생성
  - `getDerivedValueFactory/` — derived 값 계산 함수 생성
  - `getObservedValuesFactory/` — watch 경로 값 배열 생성
  - `getPathManager/` — 의존성 경로 중복 없이 수집
  - `regex.ts` — JSONPointer 경로 추출 정규식
  - `type.ts` — `DynamicFunction`, `ALIAS`, 필드명 타입

## Conventions
- TypeScript strict 모드
- `DynamicFunction<T>` = `(dependencies: unknown[]) => T`
- `computed.*` 필드와 `&fieldName` alias 두 가지 방식 지원
- `getPathManager` 로 의존성 경로를 수집하고 인덱스 기반으로 참조
- `recalculate()` 는 `dependencies` 배열이 업데이트된 후 호출

## Boundaries

### Always do
- 새 computed 필드 추가 시 `type.ts` 의 타입과 `ComputedPropertiesManager` 생성자 모두 수정
- 의존성 경로 수집은 반드시 `PathManager.set()` 을 통해 수행
- `isEnabled` 체크 후 의존성 구독 수행 (`AbstractNode.__prepareUpdateDependencies__`)

### Ask first
- `MAX_LOOP_COUNT` 또는 배치 제한 변경
- `ALIAS` (`&`) prefix 규칙 변경
- 새 computed 필드 타입 추가 (공개 API 계약 변경)

### Never do
- `new Function()` 외의 방식으로 동적 함수 생성 (`eval` 사용 금지)
- `pathManager` 없이 의존성 경로 직접 배열에 push
- `recalculate()` 를 의존성 업데이트 없이 반복 호출

## Dependencies
- `utils/createDynamicFunction` — JS 표현식 → `DynamicFunction` 컴파일
- `utils/getPathManager` — 의존성 경로 수집기
- `utils/checkComputedOptionFactory` — boolean 조건 팩토리
- `utils/getConditionIndexFactory` — oneOf/anyOf 인덱스 팩토리
- `utils/getDerivedValueFactory` — derived 값 팩토리
- `utils/getObservedValuesFactory` — watch 값 팩토리
- `utils/regex.ts` — `JSON_POINTER_PATH_REGEX`
- `@/schema-form/types` — `JsonSchemaWithVirtual`, `JsonSchemaType`
