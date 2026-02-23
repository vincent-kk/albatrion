# getDerivedValueFactory

## Purpose
JSON Schema의 `computed.derived` / `&derived` 표현식을 파싱하여 의존성 값 배열로부터 파생 값을 계산하는 `DynamicFunction` 을 생성한다. 활성 노드에서 값을 자동으로 덮어쓰는 데 사용된다.

## Structure
- `getDerivedValueFactory.ts` — 팩토리 함수
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- 반환 타입: `DynamicFunction<any> | undefined`
- `computed.derived` 우선, `&derived` alias 폴백
- `createDynamicFunction` 에 `coerceToBoolean: false` 로 위임 (값 타입 보존)
- `AbstractNode` 에서 `isDerivedDefined` 체크 후 `getDerivedValue()` 호출

## Boundaries

### Always do
- `coerceToBoolean: false` 를 유지 (derived는 boolean이 아닌 임의 타입 반환)
- undefined expression 은 `undefined` 반환 (createDynamicFunction에 위임)

### Ask first
- derived 값의 우선순위 변경 (`__reset__` 로직과 연관)

### Never do
- `coerceToBoolean: true` 로 컴파일 (derived 표현식 값 손실)
- `ComputedPropertiesManager` 외부에서 직접 호출

## Dependencies
- `../createDynamicFunction` — 표현식 컴파일
- `../getPathManager` — `PathManager`
- `../type` — `ALIAS`, `DerivedValueFieldName`
- `@/schema-form/types` — `JsonSchemaWithVirtual`
