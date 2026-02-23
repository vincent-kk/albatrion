# stripSchemaExtensions

## Purpose
`JsonSchemaWithVirtual` 확장 필드(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)를 스키마에서 제거하여 표준 `JsonSchema`로 변환한다. 검증 라이브러리에 전달하기 전 커스텀 확장을 정리하는 데 사용된다.

## Structure
- `stripSchemaExtensions.ts` — 공개 함수 및 모듈 수준 mutate 핸들러
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- `JsonSchemaScanner`로 스키마 트리 전체를 순회하며 각 노드에서 확장 필드 제거
- 확장 필드가 하나도 없는 노드는 `undefined` 반환으로 원본 유지 (불필요한 복제 방지)
- 확장 필드 존재 시 구조 분해 할당으로 해당 필드만 제외한 나머지 반환
- scanner는 매 호출마다 새로 생성 (상태 없음)

## Boundaries

### Always do
- 확장 필드 목록 변경 시 `mutate` 핸들러의 분해 할당과 조건 검사를 동시에 수정
- 확장 필드가 없는 노드에서 `undefined` 반환하여 불필요한 객체 생성 방지
- 반환 타입을 `JsonSchema`로 유지 (확장 필드 완전 제거 보장)

### Ask first
- 새 확장 필드 추가 (`JsonSchemaWithVirtual` 타입 변경과 연동 필요)
- 특정 확장 필드를 선택적으로 보존하는 옵션 추가

### Never do
- 표준 JSON Schema 필드(`type`, `properties`, `required` 등)를 제거
- 원본 `jsonSchema` 객체를 직접 변경(mutate)
- 확장 필드 제거 외의 스키마 변환 로직 추가 (단일 책임 유지)

## Dependencies
- `@winglet/json-schema/scanner` — `JsonSchemaScanner`, `JsonScannerOptions`
- `@/schema-form/types` — `JsonSchema`, `JsonSchemaWithVirtual`
