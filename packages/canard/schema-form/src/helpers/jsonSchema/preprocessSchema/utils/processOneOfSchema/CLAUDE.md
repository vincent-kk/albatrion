# processOneOfSchema

## Purpose
oneOf 스키마 변형 처리기. 선택된 variant 인덱스를 `ENHANCED_KEY` 상수 프로퍼티로 스키마에 주입하여 폼 시스템이 현재 활성 oneOf 옵션을 추적할 수 있게 한다.

## Structure
- `processOneOfSchema.ts` — 핵심 구현
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드, 순수 함수
- 시그니처: `processOneOfSchema(schema, variant) => merged schema`
- `ENHANCED_KEY`를 `const: variant` 값의 프로퍼티로 `properties`에 병합
- `merge()`를 사용하여 기존 properties를 보존하며 주입

## Boundaries

### Always do
- `merge()`로 기존 schema 내용을 보존하면서 `ENHANCED_KEY` 주입
- `ENHANCED_KEY`는 반드시 `@/schema-form/app/constants`에서 import
- `preprocessSchema`의 scanner `mutate` 콜백에서만 호출

### Ask first
- `ENHANCED_KEY` 상수 이름 변경 (노드 시스템 전반에 영향)
- variant 추적 방식 변경 (const 대신 다른 표현 방식 사용)

### Never do
- 입력 `schema` 객체를 직접 변경(mutate)
- `preprocessSchema` 외부에서 이 함수를 독립적으로 호출
- variant 인덱스 외의 데이터를 `ENHANCED_KEY`에 저장

## Dependencies
- `@winglet/common-utils/object` — `merge`
- `@/schema-form/app/constants` — `ENHANCED_KEY`
- `@/schema-form/types` — `JsonSchema`
