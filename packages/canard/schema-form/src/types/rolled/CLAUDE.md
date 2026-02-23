# schema-form/src/types/rolled

## Purpose
내부 타입을 `Roll<T>` 유틸리티로 변환하여 외부에 노출할 공개 타입을 정의하는 모듈. 내부 구현 세부사항을 숨기고 안정적인 공개 API 타입을 제공한다.

## Structure
- `jsonSchema.ts` — JSON Schema 타입 (Nullable/NonNullable 변형 및 `InferJsonSchema`)
- `form.ts` — Form 컴포넌트 공개 props 타입 (`FormGroupProps`, `FormInputProps`, `FormRenderProps`)
- `formTypeRenderer.ts` — `FormTypeRendererProps` 공개 타입
- `index.ts` — `export type *` barrel

## Conventions
- 모든 타입은 `Roll<BaseType>` 으로 래핑하여 export
- `type` 키워드만 사용 (`export type`, `import type`)
- 기반 타입은 `Base*` prefix alias로 import하여 명시적으로 구분
- 값(runtime) export 없음, 타입 전용 모듈

## Boundaries

### Always do
- 새 공개 타입 추가 시 `Roll<T>` 래핑 후 `index.ts` 에 `export type *` 포함
- 기반 타입 변경 시 `rolled` 타입도 함께 갱신
- `import type` 만 사용 (런타임 import 금지)

### Ask first
- `InferJsonSchema` 의 타입 추론 로직 변경 (nullable 처리 방식에 영향)
- 새 스키마 카테고리 추가 (NonNullable/Nullable 쌍으로 추가 필요)

### Never do
- 런타임 값(함수, 상수, 클래스)을 이 디렉토리에 추가
- `Roll` 래핑 없이 내부 타입을 직접 re-export
- 순환 참조 발생하는 타입 정의

## Dependencies
- `@aileron/declare` — `Roll`, `Dictionary`, `IsNullable`
- `@winglet/json-schema` — `RefSchema`, 기반 스키마 타입
- `@/schema-form/types` — `AllowedValue`, value 타입들, 기반 JsonSchema 타입들
