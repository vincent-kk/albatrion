# getResolveSchema

## Purpose
JSON Schema 내 `$ref` 참조를 해석하는 함수를 생성한다. 참조 테이블을 구축하고 `JsonSchemaScanner`를 통해 최대 깊이 제한과 함께 재귀 참조를 안전하게 해석한다.

## Structure
- `getResolveSchema.ts` — 공개 팩토리 함수 및 `ResolveSchema` 타입
- `index.ts` — barrel export
- `utils/getReferenceTable.ts` — 스키마 전체를 스캔하여 `$ref` → 실제 스키마 Map 구축
- `utils/getResolveSchemaScanner.ts` — 참조 해석용 `JsonSchemaScanner` 인스턴스 생성

## Conventions
- TypeScript strict 모드, 순수 함수
- `getResolveSchema(jsonSchema, maxDepth?)` → `ResolveSchema | null`
- `$ref`가 없는 스키마: `null` 반환 (스캐너 불필요)
- `maxDepth` 기본값: 1 (무한 재귀 방지)
- `ResolveSchema` 타입: `(schema: JsonSchemaWithRef) => JsonSchemaWithVirtual | undefined`
- `preferredSchema`($ref 외 필드)가 있으면 참조 스키마와 병합하여 반환

## Boundaries

### Always do
- `$ref`가 없는 스키마에 대해 `null` 반환하여 불필요한 스캐너 생성 방지
- `maxDepth`로 재귀 참조 깊이 제한 (무한 루프 방지)
- `$ref` 외 필드가 있으면 참조 결과와 merge하여 우선권 부여

### Ask first
- `maxDepth` 기본값 변경 (기존 호출부 동작에 영향)
- `getReferenceTable` 스캔 범위 변경 (definitions 외 영역 포함 등)

### Never do
- 원본 `jsonSchema`를 직접 변경(mutate)
- 참조 테이블 없이 `$ref` 문자열을 직접 파싱

## Dependencies
- `@winglet/json-schema/scanner` — `JsonSchemaScanner`
- `@winglet/json/pointer` — `getValue` (JSONPointer로 참조 스키마 조회)
- `@winglet/common-utils/filter` — `isEmptyObject`
- `@winglet/common-utils/object` — `merge`, `clone`
- `@aileron/declare` — `Fn`
- `@/schema-form/types` — `JsonSchema`, `JsonSchemaWithRef`, `JsonSchemaWithVirtual`
